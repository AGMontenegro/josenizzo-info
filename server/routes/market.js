import express from 'express';

const router = express.Router();

// Cache para almacenar datos y no hacer tantas peticiones
let commoditiesCache = {
  data: null,
  lastFetch: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// GET /api/market/commodities - Obtener precios de commodities
router.get('/commodities', async (req, res) => {
  try {
    const now = Date.now();

    // Usar cache si está disponible y no ha expirado
    if (commoditiesCache.data && (now - commoditiesCache.lastFetch) < CACHE_DURATION) {
      return res.json(commoditiesCache.data);
    }

    // Valores por defecto actualizados a precios de mercado aproximados
    const commodities = {
      brent: { price: 66.00, change: 0 },
      crude: { price: 63.00, change: 0 },
      naturalGas: { price: 3.50, change: 0 }
    };

    let dataFetched = false;

    // Opción 1: Usar yfinance API proxy (funciona sin autenticación)
    try {
      const response = await fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1d&range=1d',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          commodities.crude = {
            price: meta.regularMarketPrice,
            change: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0
          };
          dataFetched = true;
        }
      }
    } catch (err) {
      console.warn('Error fetching WTI:', err.message);
    }

    // Brent
    try {
      const response = await fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?interval=1d&range=1d',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          commodities.brent = {
            price: meta.regularMarketPrice,
            change: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0
          };
          dataFetched = true;
        }
      }
    } catch (err) {
      console.warn('Error fetching Brent:', err.message);
    }

    // Natural Gas
    try {
      const response = await fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/NG=F?interval=1d&range=1d',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          commodities.naturalGas = {
            price: meta.regularMarketPrice,
            change: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0
          };
          dataFetched = true;
        }
      }
    } catch (err) {
      console.warn('Error fetching Natural Gas:', err.message);
    }

    // Guardar en cache
    commoditiesCache = {
      data: commodities,
      lastFetch: now
    };

    res.json(commodities);
  } catch (error) {
    console.error('Error fetching commodities:', error);
    res.json(commoditiesCache.data || {
      brent: { price: 66.00, change: 0 },
      crude: { price: 63.00, change: 0 },
      naturalGas: { price: 3.50, change: 0 }
    });
  }
});

export default router;
