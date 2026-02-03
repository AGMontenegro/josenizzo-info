import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchStats(days);
  }, [days, navigate]);

  const fetchStats = async (period) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${API_URL}/analytics/stats?days=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Estadísticas de tráfico del sitio</p>
          </div>
          <Link to="/admin/dashboard" className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded">
            Volver al panel
          </Link>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mb-6">
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 text-sm font-medium rounded ${
                days === d
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {d} días
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Cargando estadísticas...</div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-500 uppercase tracking-wider">Vistas totales</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {(stats.summary?.total_views || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-500 uppercase tracking-wider">Visitantes únicos</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {(stats.summary?.unique_visitors || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Daily views table */}
            {stats.dailyViews?.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="font-bold text-gray-900">Vistas por día</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vistas</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Únicos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.dailyViews.map(day => (
                        <tr key={day.date}>
                          <td className="px-6 py-3 text-sm text-gray-900">{day.date}</td>
                          <td className="px-6 py-3 text-sm text-gray-900 text-right font-medium">{day.views}</td>
                          <td className="px-6 py-3 text-sm text-gray-600 text-right">{day.unique_visitors}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top articles */}
            {stats.topArticles?.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="font-bold text-gray-900">Artículos más vistos</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {stats.topArticles.map((article, i) => (
                    <div key={article.article_id} className="px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-gray-400 font-bold text-sm w-6">{i + 1}</span>
                        <span className="text-sm text-gray-900 truncate">{article.title}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-700 flex-shrink-0 ml-4">{article.views}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top pages & referrers side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top pages */}
              {stats.topPages?.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900">Páginas más vistas</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {stats.topPages.slice(0, 10).map((page) => (
                      <div key={page.path} className="px-6 py-2 flex items-center justify-between">
                        <span className="text-xs text-gray-700 truncate max-w-[200px]">{page.path}</span>
                        <span className="text-xs font-bold text-gray-600 ml-2">{page.views}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top referrers */}
              {stats.topReferrers?.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900">Referrers principales</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {stats.topReferrers.map((ref) => (
                      <div key={ref.referrer} className="px-6 py-2 flex items-center justify-between">
                        <span className="text-xs text-gray-700 truncate max-w-[200px]">{ref.referrer}</span>
                        <span className="text-xs font-bold text-gray-600 ml-2">{ref.visits}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">No hay datos disponibles</div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
