import { useState } from 'react';
import { Link } from 'react-router-dom';

function ReadingHistory() {
  const [history] = useState([
    {
      id: 1,
      title: 'Nueva ley de inversiones impulsa el desarrollo tecnológico nacional',
      category: 'Economía',
      readDate: 'Hoy a las 14:30',
      progress: 100,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=120&fit=crop'
    },
    {
      id: 2,
      title: 'Histórico acuerdo comercial con principales socios regionales',
      category: 'Política',
      readDate: 'Ayer',
      progress: 65,
      image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=200&h=120&fit=crop'
    },
    {
      id: 4,
      title: 'Inteligencia artificial revoluciona el sector educativo',
      category: 'Tecnología',
      readDate: 'Hace 2 días',
      progress: 30,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=120&fit=crop'
    }
  ]);

  const [recommendations] = useState([
    {
      id: 5,
      title: 'Festival de cine independiente rompe récords de asistencia',
      reason: 'Te interesó Cultura',
      category: 'Cultura'
    },
    {
      id: 6,
      title: 'Crisis climática: nuevas medidas para reducir emisiones',
      reason: 'Relacionado con tus lecturas de Economía',
      category: 'Sociedad'
    }
  ]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <h3 className="text-2xl font-bold mb-1">Tu Historial de Lectura</h3>
        <p className="text-indigo-100 text-sm">
          Artículos que has leído recientemente
        </p>
      </div>

      {/* Artículos leídos */}
      <div className="p-6">
        <div className="space-y-4">
          {history.map((item) => (
            <Link
              key={item.id}
              to={`/articulo/${item.id}`}
              className="group block"
            >
              <div className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                <div className="w-32 h-20 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mt-1">
                    {item.title}
                  </h4>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-gray-500">{item.readDate}</span>
                    <div className="flex-1 max-w-[200px]">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{item.progress}%</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h4 className="font-bold text-gray-900">Recomendado para ti</h4>
        </div>
        <div className="space-y-3">
          {recommendations.map((item) => (
            <Link
              key={item.id}
              to={`/articulo/${item.id}`}
              className="block p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-indigo-100"
            >
              <div className="flex items-start gap-2 mb-1">
                <svg className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-indigo-600 font-semibold mb-1">{item.reason}</p>
                  <p className="font-semibold text-gray-900 text-sm line-clamp-2">{item.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 text-center bg-gray-50">
        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
          Ver historial completo →
        </button>
      </div>
    </div>
  );
}

export default ReadingHistory;
