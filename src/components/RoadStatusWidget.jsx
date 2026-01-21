import { useState, useEffect } from 'react';

function RoadStatusWidget() {
  const [roadData, setRoadData] = useState({
    routes: [],
    loading: true,
    lastUpdate: null,
    source: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchRoadStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/roads/status');
        if (response.ok) {
          const data = await response.json();
          setRoadData({
            routes: data.routes || [],
            loading: false,
            lastUpdate: data.lastUpdate,
            source: data.source
          });
        }
      } catch (error) {
        console.error('Error fetching road status:', error);
        setRoadData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchRoadStatus();
    // Actualizar cada 15 minutos
    const timer = setInterval(fetchRoadStatus, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = (color) => {
    const colors = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500'
    };
    return colors[color] || colors.yellow;
  };

  const getStatusText = (color) => {
    const texts = {
      green: 'Normal',
      yellow: 'Precaución',
      red: 'Cerrada'
    };
    return texts[color] || 'Precaución';
  };

  // Calcular resumen
  const summary = {
    total: roadData.routes.length,
    normal: roadData.routes.filter(r => r.statusColor === 'green').length,
    precaucion: roadData.routes.filter(r => r.statusColor === 'yellow').length,
    cerradas: roadData.routes.filter(r => r.statusColor === 'red').length
  };

  if (roadData.loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header - Mobile first */}
      <div
        className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-3 sm:p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h3 className="font-bold text-sm sm:text-base md:text-lg">Rutas Vaca Muerta</h3>
          </div>
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Resumen rápido - Mobile first */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span>{summary.normal} OK</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            <span>{summary.precaucion} Prec.</span>
          </div>
          {summary.cerradas > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span>{summary.cerradas} Cerr.</span>
            </div>
          )}
        </div>
      </div>

      {/* Lista de rutas expandible - Mobile first */}
      {isExpanded && (
        <div className="p-3 sm:p-4">
          {roadData.routes.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-sm">No hay datos disponibles</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {roadData.routes.map((route, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg"
                >
                  <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mt-1 flex-shrink-0 ${getStatusBadge(route.statusColor)}`}></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className="font-bold text-gray-800 text-sm">{route.ruta}</span>
                      <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                        route.statusColor === 'green' ? 'bg-green-100 text-green-700' :
                        route.statusColor === 'red' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {getStatusText(route.statusColor)}
                      </span>
                    </div>
                    {route.tramo && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{route.tramo}</p>
                    )}
                    {route.observaciones && (
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{route.observaciones}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer con fuente y actualización */}
          <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-200 text-[10px] sm:text-xs text-gray-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span className="truncate">Fuente: {roadData.source}</span>
              {roadData.lastUpdate && (
                <span>
                  Act: {new Date(roadData.lastUpdate).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoadStatusWidget;
