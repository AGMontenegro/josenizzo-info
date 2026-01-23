import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../../services/api';

function SendNewsletter() {
  const [articles, setArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [customTitle, setCustomTitle] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Cargar artículos recientes
      const articlesData = await articlesAPI.getAll({ limit: 20 });
      setArticles(articlesData.articles);

      // Cargar stats de suscriptores
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_URL}/newsletter/subscribers`);
      const subscribersData = await response.json();
      setStats(subscribersData.stats);

      // Cargar templates disponibles
      const templatesResponse = await fetch(`${API_URL}/newsletter/templates`);
      const templatesData = await templatesResponse.json();
      setTemplates(templatesData.templates);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleArticle = (articleId) => {
    if (selectedArticles.includes(articleId)) {
      setSelectedArticles(selectedArticles.filter(id => id !== articleId));
    } else {
      setSelectedArticles([...selectedArticles, articleId]);
    }
  };

  const handleSend = async () => {
    if (selectedArticles.length === 0) {
      alert('Seleccioná al menos un artículo');
      return;
    }

    if (!window.confirm(`¿Enviar newsletter con ${selectedArticles.length} artículo(s) a ${stats.active} suscriptores activos?`)) {
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_URL}/newsletter/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleIds: selectedArticles,
          template: selectedTemplate,
          customTitle: customTitle || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Newsletter enviado exitosamente a ${data.successful} suscriptores`,
          stats: data
        });
        setSelectedArticles([]);
      } else {
        throw new Error(data.error || 'Error al enviar newsletter');
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.message || 'Error al enviar newsletter'
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">
                Enviar Newsletter
              </h1>
              <p className="text-gray-600 mt-1">
                Seleccioná artículos para enviar a {stats.active} suscriptores activos
              </p>
            </div>
            <Link
              to="/admin/newsletter"
              className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              Ver Suscriptores
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Result Message */}
        {result && (
          <div className={`mb-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start">
              {result.success ? (
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <div>
                <p className={`font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                  {result.message}
                </p>
                {result.stats && (
                  <p className="text-sm text-gray-600 mt-1">
                    Exitosos: {result.stats.successful} | Fallidos: {result.stats.failed}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Suscriptores Activos</div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Artículos Seleccionados</div>
            <div className="text-3xl font-bold text-blue-600">{selectedArticles.length}</div>
          </div>
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total a Enviar</div>
            <div className="text-3xl font-bold text-gray-900">
              {selectedArticles.length > 0 ? stats.active : 0}
            </div>
          </div>
        </div>

        {/* Template and Options */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Opciones de Envío</h3>

          <div className="space-y-4">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template de Newsletter
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Personalizado (opcional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Las noticias del día"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dejá vacío para usar el título por defecto
              </p>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <div className="mb-6">
          <button
            onClick={handleSend}
            disabled={selectedArticles.length === 0 || sending}
            className="w-full bg-blue-600 text-white font-semibold px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Enviando Newsletter...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Enviar Newsletter a {stats.active} Suscriptores</span>
              </>
            )}
          </button>
        </div>

        {/* Articles List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Seleccioná Artículos para el Newsletter
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Hacé clic en los artículos que querés incluir
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => toggleArticle(article.id)}
                className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedArticles.includes(article.id) ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                        selectedArticles.includes(article.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedArticles.includes(article.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {article.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 ml-8">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 ml-8">
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {article.category}
                      </span>
                      <span>{new Date(article.created_at).toLocaleDateString('es-AR')}</span>
                      <span>{article.views} vistas</span>
                    </div>
                  </div>
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-24 h-24 object-cover rounded ml-4"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SendNewsletter;
