import { useState, useEffect } from 'react';

function LiveDataWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather] = useState({
    temp: 24,
    condition: 'Parcialmente nublado',
    location: 'Neuquén'
  });

  // Datos económicos con valores por defecto
  const [economicData, setEconomicData] = useState({
    dolar: {
      oficial: { compra: 0, venta: 0 },
      blue: { compra: 0, venta: 0 }
    },
    gold: {
      price: 0,
      currency: 'USD'
    },
    commodities: {
      brent: { price: 0, change: 0 },
      crude: { price: 0, change: 0 },
      naturalGas: { price: 0, change: 0 }
    },
    loading: true
  });

  // Fetch datos del dólar y oro en tiempo real
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch dólar oficial y blue
        const [oficialRes, blueRes] = await Promise.all([
          fetch('https://dolarapi.com/v1/dolares/oficial'),
          fetch('https://dolarapi.com/v1/dolares/blue')
        ]);

        const oficialData = await oficialRes.json();
        const blueData = await blueRes.json();

        // Fetch precio del oro
        let goldPrice = 2650; // Valor por defecto aproximado
        try {
          // Usar API de CoinGecko para precio del oro (Tether Gold como proxy)
          const goldRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd');
          if (goldRes.ok) {
            const goldData = await goldRes.json();
            // Tether Gold = 1 token = 1 onza troy de oro
            if (goldData['tether-gold'] && goldData['tether-gold'].usd) {
              goldPrice = goldData['tether-gold'].usd;
            }
          }
        } catch (goldError) {
          console.warn('Error fetching gold price, using default:', goldError);
        }

        // Fetch precios de commodities desde nuestro backend
        let commoditiesData = {
          brent: { price: 74.50, change: 0 },
          crude: { price: 71.20, change: 0 },
          naturalGas: { price: 3.15, change: 0 }
        };

        try {
          const API_URL = import.meta.env.VITE_API_URL || '/api';
          const commoditiesRes = await fetch(`${API_URL}/market/commodities`);
          if (commoditiesRes.ok) {
            commoditiesData = await commoditiesRes.json();
          }
        } catch (commoditiesError) {
          console.warn('Error fetching commodities, using defaults:', commoditiesError);
        }

        setEconomicData(prev => ({
          ...prev,
          dolar: {
            oficial: {
              compra: oficialData.compra,
              venta: oficialData.venta
            },
            blue: {
              compra: blueData.compra,
              venta: blueData.venta
            }
          },
          gold: {
            price: goldPrice.toFixed(2),
            currency: 'USD'
          },
          commodities: commoditiesData,
          loading: false
        }));
      } catch (error) {
        console.error('Error fetching market data:', error);
        setEconomicData(prev => ({ ...prev, loading: false }));
      }
    };

    // Fetch inicial
    fetchMarketData();

    // Actualizar cada 5 minutos
    const marketTimer = setInterval(fetchMarketData, 5 * 60 * 1000);

    return () => clearInterval(marketTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Actualiza cada minuto

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        {/* Primera línea: Mobile-first - solo dólares en móvil */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 py-2 text-[10px] sm:text-xs md:text-sm">
          {/* Hora - compacta en móvil */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{formatTime(currentTime)}</span>
          </div>

          <div className="w-px h-3 bg-gray-600"></div>

          {/* Dólar Oficial - compacto en móvil */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-gray-400 hidden sm:inline">USD</span>
            <span className="text-gray-400">Oficial:</span>
            {economicData.loading ? (
              <span className="font-bold">...</span>
            ) : (
              <>
                <span className="font-bold text-green-400">${economicData.dolar.oficial.compra}</span>
                <span className="text-gray-500">/</span>
                <span className="font-bold text-red-400">${economicData.dolar.oficial.venta}</span>
              </>
            )}
          </div>

          <div className="w-px h-3 bg-gray-600"></div>

          {/* Dólar Blue */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-gray-400">Blue:</span>
            {economicData.loading ? (
              <span className="font-bold">...</span>
            ) : (
              <>
                <span className="font-bold text-green-400">${economicData.dolar.blue.compra}</span>
                <span className="text-gray-500">/</span>
                <span className="font-bold text-red-400">${economicData.dolar.blue.venta}</span>
              </>
            )}
          </div>

          {/* Clima - solo md+ */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            <div className="w-px h-3 bg-gray-600 mr-2"></div>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <span>{weather.location}: {weather.temp}°C</span>
          </div>

          {/* Oro - Solo en pantallas grandes (xl+) */}
          <div className="hidden xl:flex items-center gap-1 flex-shrink-0">
            <div className="w-px h-3 bg-gray-600 mr-2"></div>
            <span className="text-gray-400">Oro:</span>
            {economicData.loading ? (
              <span className="font-bold">...</span>
            ) : (
              <span className="font-bold text-yellow-400">${economicData.gold.price}</span>
            )}
          </div>

          {/* Brent Oil - Solo en pantallas grandes (xl+) */}
          <div className="hidden xl:flex items-center gap-1 flex-shrink-0">
            <div className="w-px h-3 bg-gray-600 mr-2"></div>
            <span className="text-gray-400">Brent:</span>
            {economicData.loading ? (
              <span className="font-bold">...</span>
            ) : (
              <span className={`font-bold ${economicData.commodities.brent.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${economicData.commodities.brent.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* WTI - Solo en pantallas grandes (xl+) */}
          <div className="hidden xl:flex items-center gap-1 flex-shrink-0">
            <div className="w-px h-3 bg-gray-600 mr-2"></div>
            <span className="text-gray-400">WTI:</span>
            {economicData.loading ? (
              <span className="font-bold">...</span>
            ) : (
              <span className={`font-bold ${economicData.commodities.crude.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${economicData.commodities.crude.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Gas - Solo en pantallas grandes (xl+) */}
          <div className="hidden xl:flex items-center gap-1 flex-shrink-0">
            <div className="w-px h-3 bg-gray-600 mr-2"></div>
            <span className="text-gray-400">Gas:</span>
            {economicData.loading ? (
              <span className="font-bold">...</span>
            ) : (
              <span className={`font-bold ${economicData.commodities.naturalGas.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${economicData.commodities.naturalGas.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Segunda línea: Commodities - Solo visible en móvil/tablet (< xl) */}
        <div className="flex xl:hidden items-center justify-center gap-2 sm:gap-4 py-2 text-[10px] sm:text-xs border-t border-gray-700">
          {/* Oro */}
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Oro:</span>
            {economicData.loading ? (
              <span className="font-bold">...</span>
            ) : (
              <span className="font-bold text-yellow-400">${economicData.gold.price}</span>
            )}
          </div>

          <div className="w-px h-3 bg-gray-600"></div>

          {/* Brent */}
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Brent:</span>
            {economicData.loading ? (
              <span className="font-bold">...</span>
            ) : (
              <span className={`font-bold ${economicData.commodities.brent.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${economicData.commodities.brent.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="w-px h-3 bg-gray-600"></div>

          {/* WTI */}
          <div className="flex items-center gap-1">
            <span className="text-gray-400">WTI:</span>
            {economicData.loading ? (
              <span className="font-bold">...</span>
            ) : (
              <span className={`font-bold ${economicData.commodities.crude.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${economicData.commodities.crude.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="w-px h-3 bg-gray-600"></div>

          {/* Gas */}
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Gas:</span>
            {economicData.loading ? (
              <span className="font-bold">...</span>
            ) : (
              <span className={`font-bold ${economicData.commodities.naturalGas.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${economicData.commodities.naturalGas.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveDataWidget;
