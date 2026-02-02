import express from 'express';

const router = express.Router();

// Cache unificado para todos los datos de mercado
let marketCache = {
  data: null,
  lastFetch: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

/**
 * Fetch con timeout para evitar que una API lenta bloquee todo
 */
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
  ]);
}

/**
 * Fetch un commodity de Yahoo Finance
 */
async function fetchYahooPrice(symbol, defaultPrice) {
  try {
    const res = await fetchWithTimeout(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      { headers: YAHOO_HEADERS },
      5000
    );
    if (res.ok) {
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (meta?.regularMarketPrice) {
        return {
          price: meta.regularMarketPrice,
          change: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0
        };
      }
    }
  } catch (err) {
    console.warn(`Error fetching ${symbol}:`, err.message);
  }
  return { price: defaultPrice, change: 0 };
}

// GET /api/market/all - Todos los datos de mercado en una sola llamada
router.get('/all', async (req, res) => {
  try {
    const now = Date.now();

    // Usar cache si está disponible y no expiró
    if (marketCache.data && (now - marketCache.lastFetch) < CACHE_DURATION) {
      return res.json(marketCache.data);
    }

    // Hacer TODAS las llamadas en paralelo
    const [oficialRes, blueRes, goldRes, crude, brent, naturalGas] = await Promise.allSettled([
      fetchWithTimeout('https://dolarapi.com/v1/dolares/oficial', {}, 5000),
      fetchWithTimeout('https://dolarapi.com/v1/dolares/blue', {}, 5000),
      fetchWithTimeout('https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd', {}, 5000),
      fetchYahooPrice('CL=F', 63.00),
      fetchYahooPrice('BZ=F', 66.00),
      fetchYahooPrice('NG=F', 3.50),
    ]);

    // Procesar dólar oficial
    let dolarOficial = { compra: 0, venta: 0 };
    if (oficialRes.status === 'fulfilled' && oficialRes.value.ok) {
      try { dolarOficial = await oficialRes.value.json(); } catch {}
    }

    // Procesar dólar blue
    let dolarBlue = { compra: 0, venta: 0 };
    if (blueRes.status === 'fulfilled' && blueRes.value.ok) {
      try { dolarBlue = await blueRes.value.json(); } catch {}
    }

    // Procesar oro
    let goldPrice = 2650;
    if (goldRes.status === 'fulfilled' && goldRes.value.ok) {
      try {
        const goldData = await goldRes.value.json();
        if (goldData['tether-gold']?.usd) {
          goldPrice = goldData['tether-gold'].usd;
        }
      } catch {}
    }

    const result = {
      dolar: {
        oficial: { compra: dolarOficial.compra, venta: dolarOficial.venta },
        blue: { compra: dolarBlue.compra, venta: dolarBlue.venta }
      },
      gold: {
        price: Number(goldPrice).toFixed(2),
        currency: 'USD'
      },
      commodities: {
        crude: crude.status === 'fulfilled' ? crude.value : { price: 63.00, change: 0 },
        brent: brent.status === 'fulfilled' ? brent.value : { price: 66.00, change: 0 },
        naturalGas: naturalGas.status === 'fulfilled' ? naturalGas.value : { price: 3.50, change: 0 },
      },
      timestamp: now
    };

    // Guardar en cache
    marketCache = { data: result, lastFetch: now };

    res.json(result);
  } catch (error) {
    console.error('Error fetching market data:', error);
    // Devolver cache viejo o defaults
    res.json(marketCache.data || {
      dolar: { oficial: { compra: 0, venta: 0 }, blue: { compra: 0, venta: 0 } },
      gold: { price: '2650.00', currency: 'USD' },
      commodities: {
        crude: { price: 63.00, change: 0 },
        brent: { price: 66.00, change: 0 },
        naturalGas: { price: 3.50, change: 0 },
      },
      timestamp: Date.now()
    });
  }
});

// GET /api/market/commodities - Mantener por compatibilidad
router.get('/commodities', async (req, res) => {
  try {
    const now = Date.now();

    if (marketCache.data && (now - marketCache.lastFetch) < CACHE_DURATION) {
      return res.json(marketCache.data.commodities);
    }

    const [crude, brent, naturalGas] = await Promise.all([
      fetchYahooPrice('CL=F', 63.00),
      fetchYahooPrice('BZ=F', 66.00),
      fetchYahooPrice('NG=F', 3.50),
    ]);

    const commodities = { crude, brent, naturalGas };
    res.json(commodities);
  } catch (error) {
    console.error('Error fetching commodities:', error);
    res.json({
      brent: { price: 66.00, change: 0 },
      crude: { price: 63.00, change: 0 },
      naturalGas: { price: 3.50, change: 0 }
    });
  }
});

export default router;
