import { Link } from 'react-router-dom';
import { useState } from 'react';
import SEO from '../components/SEO';
import LoadingSpinner from '../components/LoadingSpinner';
import HomeSkeleton from '../components/HomeSkeleton';
import RoadStatusWidget from '../components/RoadStatusWidget';
import { useFeaturedArticles, useArticles, useTrendingArticles, useArticlesByCategory } from '../hooks/useArticles';
import { newsletterAPI } from '../services/api';

function Home() {
  const { articles: featuredArticles, loading: featuredLoading } = useFeaturedArticles(3);
  const { articles: latestArticles, loading: latestLoading } = useArticles({ limit: 34 });
  const { articles: trendingArticles, loading: trendingLoading } = useTrendingArticles(5);
  const { articles: bienestarArticles } = useArticlesByCategory('DESAFIO_BIENESTAR', 1);
  const { articles: ngInsightsArticles, loading: ngInsightsLoading } = useArticlesByCategory('NG_INSIGHTS', 2);
  const [showSecureModal, setShowSecureModal] = useState(false);
  const [showSecureForm, setShowSecureForm] = useState(false);
  const [secureFormData, setSecureFormData] = useState({
    subject: '',
    message: '',
    contactMethod: '',
    files: []
  });
  const [secureFormSubmitted, setSecureFormSubmitted] = useState(false);

  const handleSecureFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('subject', secureFormData.subject);
      formData.append('message', secureFormData.message);
      formData.append('contactMethod', secureFormData.contactMethod);

      // Agregar archivos si hay
      if (secureFormData.files && secureFormData.files.length > 0) {
        secureFormData.files.forEach((file) => {
          formData.append('files', file);
        });
      }

      const response = await fetch('/api/contact/secure-tip', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setSecureFormSubmitted(true);
        setTimeout(() => {
          setShowSecureModal(false);
          setShowSecureForm(false);
          setSecureFormSubmitted(false);
          setSecureFormData({ subject: '', message: '', contactMethod: '', files: [] });
        }, 3000);
      } else {
        alert('Error al enviar. Por favor intentá de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar. Por favor intentá de nuevo.');
    }
  };

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle'); // idle, loading, success, error
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterStatus('error');
      setNewsletterMessage('Por favor ingresá un email válido');
      return;
    }

    setNewsletterStatus('loading');
    setNewsletterMessage('');

    try {
      await newsletterAPI.subscribe(newsletterEmail);
      setNewsletterStatus('success');
      setNewsletterMessage('¡Suscripción exitosa! Revisá tu correo.');
      setNewsletterEmail('');

      // Reset message after 5 seconds
      setTimeout(() => {
        setNewsletterStatus('idle');
        setNewsletterMessage('');
      }, 5000);
    } catch (error) {
      setNewsletterStatus('error');
      setNewsletterMessage(error.message || 'Error al suscribirse. Intentá nuevamente.');

      // Reset error after 5 seconds
      setTimeout(() => {
        setNewsletterStatus('idle');
        setNewsletterMessage('');
      }, 5000);
    }
  };

  return (
    <>
      <SEO
        title="Inicio"
        description="Portal de noticias y análisis de actualidad en Argentina y el mundo. Economía, Política, Tecnología, Cultura y más."
        url="/"
      />

      <div className="bg-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-0">
          {/* Hero Section - Estilo NYT exacto */}
          <section className="mb-16">
            {(featuredLoading || latestLoading) ? (
              <HomeSkeleton />
            ) : featuredArticles.length > 0 && latestArticles.length >= 6 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Columna IZQUIERDA - Layout horizontal con imagen central más grande */}
                <div className="lg:col-span-8 lg:border-r border-gray-200 lg:pr-8">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Imagen CENTRAL - Solo imagen decorativa (4 columnas) - Primero en mobile */}
                    <div className="md:col-span-4 group order-1 md:order-2">
                      <Link to={`/articulo/${featuredArticles[0].id}`}>
                        <div className="aspect-[16/9] overflow-hidden bg-gray-100 rounded-sm">
                          <img
                            src={featuredArticles[0].image}
                            alt={featuredArticles[0].title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      </Link>
                    </div>

                    {/* Artículos izquierda - 2 apilados con texto completo - Después en mobile */}
                    <div className="space-y-6 order-2 md:order-1">
                      <div className="group pb-6 border-b border-gray-200">
                        <Link to={`/articulo/${latestArticles[0].id}`}>
                          <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-4 leading-snug text-sm mb-1">
                            {latestArticles[0].title}
                          </h3>
                          <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed font-light">
                            {latestArticles[0].excerpt}
                          </p>
                        </Link>
                      </div>
                      <div className="group">
                        <Link to={`/articulo/${latestArticles[1].id}`}>
                          <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-4 leading-snug text-sm mb-1">
                            {latestArticles[1].title}
                          </h3>
                          <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed font-light">
                            {latestArticles[1].excerpt}
                          </p>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Artículos adicionales debajo - 2 artículos solo texto separados por línea */}
                  {latestArticles.length >= 4 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group pb-6 border-b border-gray-200 md:pb-0 md:border-b-0">
                        <Link to={`/articulo/${latestArticles[2].id}`}>
                          <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                            {latestArticles[2].title}
                          </h3>
                        </Link>
                      </div>

                      <div className="group md:border-l border-gray-200 md:pl-6">
                        <Link to={`/articulo/${latestArticles[3].id}`}>
                          <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                            {latestArticles[3].title}
                          </h3>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Línea separadora más oscura */}
                  <div className="mt-8 border-t-2 border-gray-900"></div>

                  {/* Llamado a acción para denuncias confidenciales */}
                  <button
                    onClick={() => setShowSecureModal(true)}
                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors group flex items-center gap-2 mt-4"
                  >
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="font-medium">¿Tenés un dato?</span>
                    <span className="font-light">josenizzo.info ofrece varias maneras de enviar información importante de forma confidencial</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Línea separadora más oscura después de "Tenés un dato?" */}
                  <div className="mt-8 border-t-2 border-gray-900"></div>

                  {/* NG Insights - Solo visible en MOBILE */}
                  <div className="mt-8 lg:hidden">
                    <h3 className="text-xs font-bold text-gray-900 tracking-widest uppercase mb-6">
                      NG Insights
                    </h3>
                    {ngInsightsLoading ? (
                      <LoadingSpinner className="py-10" />
                    ) : ngInsightsArticles.length > 0 && (
                      <div className="space-y-4">
                        {/* Primer artículo - Título + Extracto */}
                        <div className="group pb-4 border-b border-gray-200">
                          <Link to={`/articulo/${ngInsightsArticles[0].id}`}>
                            <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-base mb-2">
                              {ngInsightsArticles[0].title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed font-light">
                              {ngInsightsArticles[0].excerpt}
                            </p>
                          </Link>
                        </div>

                        {/* Segundo artículo - Solo título */}
                        {ngInsightsArticles.length >= 2 && (
                          <div className="group">
                            <Link to={`/articulo/${ngInsightsArticles[1].id}`}>
                              <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                {ngInsightsArticles[1].title}
                              </h3>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna DERECHA - Layout vertical con imágenes más pequeñas */}
                <div className="lg:col-span-4 space-y-5">
                  {/* Artículo superior - Imagen reducida */}
                  {featuredArticles.length >= 2 && (
                    <div className="group pb-5 border-b border-gray-200">
                      <Link to={`/articulo/${featuredArticles[1].id}`}>
                        <div className="aspect-[16/10] overflow-hidden bg-gray-100 mb-2 rounded-sm">
                          <img
                            src={featuredArticles[1].image}
                            alt={featuredArticles[1].title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                          {featuredArticles[1].title}
                        </h3>
                      </Link>
                    </div>
                  )}

                  {/* Artículos inferiores - 2 lado a lado con imágenes más pequeñas */}
                  <div className="grid grid-cols-2 gap-3 relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -ml-[0.5px]"></div>
                    {latestArticles.slice(4, 6).map((article) => (
                      <div key={article.id} className="group">
                        <Link to={`/articulo/${article.id}`}>
                          <div className="aspect-square overflow-hidden bg-gray-100 mb-2 rounded-sm">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          </div>
                          <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-tight text-sm">
                            {article.title}
                          </h4>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Línea separadora más oscura */}
                  <div className="mt-8 border-t-2 border-gray-900"></div>
                </div>
              </div>
            )}
          </section>

          {/* Editor's Picks - Layout con columna de Sociedad */}
          {!latestLoading && latestArticles.length >= 14 && (
            <section className="mb-0 -mt-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Columna izquierda - Artículos verticales (mismo ancho que Hero izquierda) */}
                <div className="lg:col-span-8 lg:border-r border-gray-200 lg:pr-8">
                  {/* Grid con artículos a la izquierda y espacio para videos a la derecha */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Columna izquierda - 3 artículos (1/3) */}
                    <div className="space-y-6 md:col-span-1">
                      {/* Primer artículo - Título + Extracto */}
                      <div className="group pb-6 border-b border-gray-200">
                        <Link to={`/articulo/${latestArticles[6].id}`}>
                          <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-4 leading-snug text-sm mb-1">
                            {latestArticles[6].title}
                          </h3>
                          <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed font-light">
                            {latestArticles[6].excerpt}
                          </p>
                        </Link>
                      </div>

                      {/* Segundo artículo - Solo título */}
                      <div className="group pb-6 border-b border-gray-200">
                        <Link to={`/articulo/${latestArticles[7].id}`}>
                          <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                            {latestArticles[7].title}
                          </h3>
                        </Link>
                      </div>

                      {/* Tercer artículo - Solo título */}
                      <div className="group">
                        <Link to={`/articulo/${latestArticles[8].id}`}>
                          <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                            {latestArticles[8].title}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    {/* Columna derecha - Espacio para videos (2/3) */}
                    <div className="bg-gray-50 border border-gray-200 p-6 flex items-center justify-center md:col-span-2 min-h-[200px] md:min-h-0">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-400 font-medium text-sm">Espacio Videos</p>
                      </div>
                    </div>
                  </div>

                  {/* Línea separadora gruesa */}
                  <div className="mt-8 border-t-2 border-gray-900"></div>

                  {/* Sección Desafío Bienestar - Artículo destacado */}
                  {bienestarArticles.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xs font-bold text-gray-900 tracking-widest uppercase mb-6">Desafío Bienestar</h3>
                      <div className="group">
                        <Link to={`/articulo/${bienestarArticles[0].id}`}>
                          <div className="flex gap-6">
                            <div className="w-1/2 flex flex-col justify-center">
                              <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-tight text-2xl mb-3">
                                {bienestarArticles[0].title}
                              </h3>
                              <p className="text-gray-600 text-base line-clamp-4 leading-relaxed font-light">
                                {bienestarArticles[0].excerpt}
                              </p>
                            </div>
                            <div className="w-1/2 aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm">
                              <img
                                src={bienestarArticles[0].image}
                                alt={bienestarArticles[0].title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* Línea separadora gruesa */}
                      <div className="mt-8 border-t-2 border-gray-900"></div>
                    </div>
                  )}

                  {/* Sección promocional Lo Nuestro TV - Siempre visible */}
                  <div className="mt-8">
                    {/* Línea separadora gruesa */}
                    <div className="border-t-2 border-gray-900"></div>

                    <a
                      href="https://www.lonuestro.com.ar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group mt-8 hover:bg-gray-50 transition-colors p-4 -mx-4 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src="/logos/logo512.webp"
                          alt="Lo Nuestro TV"
                          className="w-24 h-24 rounded-lg shadow-sm"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 text-base">Lo Nuestro TV</span>
                            <svg className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600 font-light leading-relaxed">
                            ¡La TV que querés ver! Contenido 100% gratuito y entretenimiento sin límites
                          </p>
                        </div>
                      </div>
                    </a>

                    {/* Línea separadora gruesa debajo */}
                    <div className="mt-8 border-t-2 border-gray-900"></div>

                    {/* Artículo con título/extracto (40%) e imagen (60%) */}
                    {latestArticles.length > 17 && (
                      <div className="mt-8">
                        <Link to={`/articulo/${latestArticles[17].id}`} className="group block">
                          <div className="flex gap-4">
                            {/* Texto - 40% */}
                            <div className="flex-[0.4]">
                              <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-base mb-2">
                                {latestArticles[17].title}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed font-light">
                                {latestArticles[17].excerpt}
                              </p>
                            </div>
                            {/* Imagen - 60% */}
                            <div className="flex-[0.6]">
                              <div className="aspect-[16/9] overflow-hidden bg-gray-100 rounded-sm">
                                <img
                                  src={latestArticles[17].image}
                                  alt={latestArticles[17].title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}

                    {/* Línea separadora gruesa debajo del artículo */}
                    <div className="mt-8 border-t-2 border-gray-900"></div>

                    {/* 2 artículos lado a lado con línea divisoria */}
                    {latestArticles.length > 19 && (
                          <div className="mt-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:divide-x divide-gray-200">
                              {/* Artículo izquierda */}
                              <Link to={`/articulo/${latestArticles[18].id}`} className="group block md:pr-6 pb-6 md:pb-0 border-b md:border-b-0 border-gray-200">
                                <div className="flex gap-3 items-center">
                                  <div className="w-24 flex-shrink-0">
                                    <div className="aspect-square overflow-hidden bg-gray-100 rounded-sm">
                                      <img
                                        src={latestArticles[18].image}
                                        alt={latestArticles[18].title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-4 leading-snug text-sm">
                                      {latestArticles[18].title}
                                    </h3>
                                  </div>
                                </div>
                              </Link>

                              {/* Artículo derecha */}
                              <Link to={`/articulo/${latestArticles[19].id}`} className="group block md:pl-6">
                                <div className="flex gap-3 items-center">
                                  <div className="w-24 flex-shrink-0">
                                    <div className="aspect-square overflow-hidden bg-gray-100 rounded-sm">
                                      <img
                                        src={latestArticles[19].image}
                                        alt={latestArticles[19].title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-4 leading-snug text-sm">
                                      {latestArticles[19].title}
                                    </h3>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        )}

                        {/* Línea separadora fina */}
                        {latestArticles.length > 22 && (
                          <>
                            <div className="mt-8 border-t border-gray-200"></div>

                            {/* 3 artículos solo título */}
                            <div className="mt-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 md:divide-x divide-gray-200">
                                {/* Artículo 1 */}
                                <Link to={`/articulo/${latestArticles[20].id}`} className="group md:pr-6 pb-4 md:pb-0 border-b md:border-b-0 border-gray-200">
                                  <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                    {latestArticles[20].title}
                                  </h3>
                                </Link>

                                {/* Artículo 2 */}
                                <Link to={`/articulo/${latestArticles[21].id}`} className="group md:px-6 pb-4 md:pb-0 border-b md:border-b-0 border-gray-200">
                                  <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                    {latestArticles[21].title}
                                  </h3>
                                </Link>

                                {/* Artículo 3 */}
                                <Link to={`/articulo/${latestArticles[22].id}`} className="group md:pl-6">
                                  <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                    {latestArticles[22].title}
                                  </h3>
                                </Link>
                              </div>
                            </div>
                          </>
                        )}

                        {latestArticles.length > 25 && (
                          <>
                            {/* Línea separadora gruesa */}
                            <div className="mt-8 border-t-2 border-gray-900"></div>

                            {/* Sección CULTURA */}
                            <div className="mt-8">
                              <h3 className="text-xs font-bold text-gray-900 tracking-widest uppercase mb-6">
                                Cultura
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x divide-gray-200">
                                {/* Artículo 1 */}
                                <Link to={`/articulo/${latestArticles[23].id}`} className="group block md:pr-3 pb-6 md:pb-0 border-b md:border-b-0 border-gray-200">
                                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-3">
                                    <img
                                      src={latestArticles[23].image}
                                      alt={latestArticles[23].title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      loading="lazy"
                                    />
                                  </div>
                                  <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2 leading-snug text-sm mb-2">
                                    {latestArticles[23].title}
                                  </h3>
                                  <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed font-light">
                                    {latestArticles[23].excerpt}
                                  </p>
                                </Link>

                                {/* Artículo 2 */}
                                <Link to={`/articulo/${latestArticles[24].id}`} className="group block md:px-3 pb-6 md:pb-0 border-b md:border-b-0 border-gray-200">
                                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-3">
                                    <img
                                      src={latestArticles[24].image}
                                      alt={latestArticles[24].title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      loading="lazy"
                                    />
                                  </div>
                                  <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2 leading-snug text-sm mb-2">
                                    {latestArticles[24].title}
                                  </h3>
                                  <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed font-light">
                                    {latestArticles[24].excerpt}
                                  </p>
                                </Link>

                                {/* Artículo 3 */}
                                <Link to={`/articulo/${latestArticles[25].id}`} className="group block md:pl-3">
                                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-3">
                                    <img
                                      src={latestArticles[25].image}
                                      alt={latestArticles[25].title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      loading="lazy"
                                    />
                                  </div>
                                  <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2 leading-snug text-sm mb-2">
                                    {latestArticles[25].title}
                                  </h3>
                                  <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed font-light">
                                    {latestArticles[25].excerpt}
                                  </p>
                                </Link>
                              </div>
                            </div>

                            {/* Línea separadora gruesa después de Cultura */}
                            <div className="mt-8 border-t-2 border-gray-900"></div>

                            {/* Sección Más Noticias - 6 artículos en pares - Solo desktop */}
                            <div className="mt-8 hidden md:block">
                              <h3 className="text-xs font-bold text-gray-900 tracking-widest uppercase mb-6">
                                Más Noticias
                              </h3>

                              {/* Par 1 */}
                              {latestArticles.length > 27 && (
                                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-200 relative">
                                  <div className="absolute left-1/2 top-0 bottom-6 w-px bg-gray-200 -ml-[0.5px]"></div>
                                  <Link to={`/articulo/${latestArticles[26].id}`} className="group block">
                                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                                      <img
                                        src={latestArticles[26].image}
                                        alt={latestArticles[26].title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                      />
                                    </div>
                                    <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                      {latestArticles[26].title}
                                    </h4>
                                  </Link>
                                  {latestArticles.length > 28 && (
                                    <Link to={`/articulo/${latestArticles[27].id}`} className="group block">
                                      <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                                        <img
                                          src={latestArticles[27].image}
                                          alt={latestArticles[27].title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                          loading="lazy"
                                        />
                                      </div>
                                      <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                        {latestArticles[27].title}
                                      </h4>
                                    </Link>
                                  )}
                                </div>
                              )}

                              {/* Par 2 */}
                              {latestArticles.length > 29 && (
                                <div className="grid grid-cols-2 gap-6 py-6 border-b border-gray-200 relative">
                                  <div className="absolute left-1/2 top-6 bottom-6 w-px bg-gray-200 -ml-[0.5px]"></div>
                                  <Link to={`/articulo/${latestArticles[28].id}`} className="group block">
                                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                                      <img
                                        src={latestArticles[28].image}
                                        alt={latestArticles[28].title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                      />
                                    </div>
                                    <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                      {latestArticles[28].title}
                                    </h4>
                                  </Link>
                                  {latestArticles.length > 30 && (
                                    <Link to={`/articulo/${latestArticles[29].id}`} className="group block">
                                      <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                                        <img
                                          src={latestArticles[29].image}
                                          alt={latestArticles[29].title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                          loading="lazy"
                                        />
                                      </div>
                                      <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                        {latestArticles[29].title}
                                      </h4>
                                    </Link>
                                  )}
                                </div>
                              )}

                              {/* Par 3 */}
                              {latestArticles.length > 31 && (
                                <div className="grid grid-cols-2 gap-6 py-6 border-b border-gray-200 relative">
                                  <div className="absolute left-1/2 top-6 bottom-6 w-px bg-gray-200 -ml-[0.5px]"></div>
                                  <Link to={`/articulo/${latestArticles[30].id}`} className="group block">
                                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                                      <img
                                        src={latestArticles[30].image}
                                        alt={latestArticles[30].title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                      />
                                    </div>
                                    <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                      {latestArticles[30].title}
                                    </h4>
                                  </Link>
                                  {latestArticles.length >= 32 && (
                                    <Link to={`/articulo/${latestArticles[31].id}`} className="group block">
                                      <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                                        <img
                                          src={latestArticles[31].image}
                                          alt={latestArticles[31].title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                          loading="lazy"
                                        />
                                      </div>
                                      <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                        {latestArticles[31].title}
                                      </h4>
                                    </Link>
                                  )}
                                </div>
                              )}

                              {/* Par 4 */}
                              {latestArticles.length > 33 && (
                                <div className="grid grid-cols-2 gap-6 pt-6 relative">
                                  <div className="absolute left-1/2 top-6 bottom-0 w-px bg-gray-200 -ml-[0.5px]"></div>
                                  <Link to={`/articulo/${latestArticles[32].id}`} className="group block">
                                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                                      <img
                                        src={latestArticles[32].image}
                                        alt={latestArticles[32].title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                      />
                                    </div>
                                    <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                      {latestArticles[32].title}
                                    </h4>
                                  </Link>
                                  {latestArticles.length >= 34 && (
                                    <Link to={`/articulo/${latestArticles[33].id}`} className="group block">
                                      <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                                        <img
                                          src={latestArticles[33].image}
                                          alt={latestArticles[33].title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                          loading="lazy"
                                        />
                                      </div>
                                      <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                        {latestArticles[33].title}
                                      </h4>
                                    </Link>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Línea separadora gruesa después de Más Noticias */}
                            <div className="mt-8 border-t-2 border-gray-900"></div>
                          </>
                        )}
                  </div>
                </div>

                {/* Columna derecha - Artículos */}
                <div className="lg:col-span-4">
                  <div className="space-y-5">
                    {/* Primer artículo - Título + Imagen */}
                    <div className="group pb-5 border-b border-gray-200">
                      <Link to={`/articulo/${latestArticles[9].id}`}>
                        <div className="aspect-[16/9] overflow-hidden bg-gray-100 mb-2 rounded-sm">
                          <img
                            src={latestArticles[9].image}
                            alt={latestArticles[9].title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                          {latestArticles[9].title}
                        </h4>
                      </Link>
                    </div>

                    {/* Segundo artículo - Solo título */}
                    <div className="group pb-5 border-b border-gray-200">
                      <Link to={`/articulo/${latestArticles[10].id}`}>
                        <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                          {latestArticles[10].title}
                        </h4>
                      </Link>
                    </div>

                    {/* Tercer artículo - Título a la izquierda + Imagen a la derecha */}
                    {latestArticles.length >= 12 && (
                      <div className="group pb-5 border-b border-gray-200">
                        <Link to={`/articulo/${latestArticles[11].id}`}>
                          <div className="flex gap-3">
                            <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-5 leading-snug text-sm w-1/2">
                              {latestArticles[11].title}
                            </h4>
                            <div className="w-1/2 aspect-square overflow-hidden bg-gray-100 rounded-sm">
                              <img
                                src={latestArticles[11].image}
                                alt={latestArticles[11].title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}

                    {/* Cuarto artículo - Solo título */}
                    {latestArticles.length >= 13 && (
                      <div className="group pb-5 border-b border-gray-200">
                        <Link to={`/articulo/${latestArticles[12].id}`}>
                          <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                            {latestArticles[12].title}
                          </h4>
                        </Link>
                      </div>
                    )}

                    {/* Últimos 4 artículos - Grid 2x2 con títulos completos y separadores */}
                    {latestArticles.length >= 14 && (
                      <div className="grid grid-cols-2 gap-x-0">
                        {latestArticles.slice(13, 17).map((article, index) => (
                          <div
                            key={article.id}
                            className={`group ${index % 2 === 0 ? 'border-r border-gray-200 pr-3' : 'pl-3'} ${index < 2 ? 'pb-5 border-b border-gray-200' : 'pt-5'}`}
                          >
                            <Link to={`/articulo/${article.id}`}>
                              <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors leading-tight text-sm">
                                {article.title}
                              </h4>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Línea separadora más oscura */}
                  <div className="mt-8 border-t-2 border-gray-900"></div>

                  {/* Sección Argentinos hasta el tuétano */}
                  <div className="mt-8 text-center">
                    <img
                      src="/logos/Arg_tuetano.png"
                      alt="Argentinos hasta el tuétano"
                      className="w-full mx-auto mb-4"
                    />
                    <p className="text-sm font-bold text-gray-900 tracking-widest uppercase mb-4">
                      ARGENTINOS HASTA EL TUÉTANO
                    </p>
                  </div>

                  {/* Línea separadora más oscura */}
                  <div className="mt-4 border-t-2 border-gray-900"></div>

                  {/* NG Insights - Solo visible en DESKTOP */}
                  <div className="mt-8 hidden lg:block">
                    <h3 className="text-xs font-bold text-gray-900 tracking-widest uppercase mb-6">
                      NG Insights
                    </h3>
                    {ngInsightsLoading ? (
                      <LoadingSpinner className="py-10" />
                    ) : ngInsightsArticles.length > 0 && (
                      <div className="space-y-4">
                        {/* Primer artículo - Título + Extracto */}
                        <div className="group pb-4 border-b border-gray-200">
                          <Link to={`/articulo/${ngInsightsArticles[0].id}`}>
                            <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-base mb-2">
                              {ngInsightsArticles[0].title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed font-light">
                              {ngInsightsArticles[0].excerpt}
                            </p>
                          </Link>
                        </div>

                        {/* Segundo artículo - Solo título */}
                        {ngInsightsArticles.length >= 2 && (
                          <div className="group">
                            <Link to={`/articulo/${ngInsightsArticles[1].id}`}>
                              <h3 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                {ngInsightsArticles[1].title}
                              </h3>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Newsletter - estilo más minimalista */}
                  <div id="newsletter" className="border-t-2 border-gray-900 pt-4 scroll-mt-20">
                    <h3 className="text-base font-serif font-bold mb-3 text-gray-900">Newsletter Diario</h3>
                    <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                      Las noticias más importantes cada mañana en tu casilla
                    </p>
                    <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                      <input
                        type="email"
                        placeholder="tu@email.com"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        disabled={newsletterStatus === 'loading'}
                        className="w-full px-4 py-3 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <button
                        type="submit"
                        disabled={newsletterStatus === 'loading'}
                        className="w-full bg-gray-900 text-white font-semibold px-4 py-3 text-sm hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {newsletterStatus === 'loading' ? 'Suscribiendo...' : 'Suscribirme'}
                      </button>
                      {newsletterMessage && (
                        <p className={`text-xs text-center ${newsletterStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {newsletterMessage}
                        </p>
                      )}
                      {newsletterStatus !== 'success' && newsletterStatus !== 'error' && (
                        <p className="text-xs text-gray-500 text-center">Sin spam. Cancelá cuando quieras.</p>
                      )}
                    </form>
                  </div>

                  {/* Estado de Rutas - Vaca Muerta */}
                  <div className="mt-8">
                    <RoadStatusWidget />
                  </div>

                  {/* Banner publicitario */}
                  <div className="bg-gray-50 border border-gray-200 p-8 text-center mt-8 min-h-[600px] flex flex-col items-center justify-center">
                    <p className="text-gray-400 font-medium text-sm">Espacio Publicitario</p>
                    <p className="text-xs text-gray-300 mt-1">300x600</p>
                  </div>

                  {/* Espacios publicitarios adicionales */}
                  <div className="bg-gray-50 border border-gray-200 p-8 text-center mt-6 min-h-[250px] flex flex-col items-center justify-center">
                    <p className="text-gray-400 font-medium text-sm">Espacio Publicitario</p>
                    <p className="text-xs text-gray-300 mt-1">300x250</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-8 text-center mt-4 min-h-[250px] flex flex-col items-center justify-center">
                    <p className="text-gray-400 font-medium text-sm">Espacio Publicitario</p>
                    <p className="text-xs text-gray-300 mt-1">300x250</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-8 text-center mt-4 min-h-[250px] flex flex-col items-center justify-center">
                    <p className="text-gray-400 font-medium text-sm">Espacio Publicitario</p>
                    <p className="text-xs text-gray-300 mt-1">300x250</p>
                  </div>

                  {/* Sección Más Noticias - Solo mobile */}
                  <div className="mt-8 md:hidden">
                    <div className="border-t-2 border-gray-900 pt-6">
                      <h3 className="text-xs font-bold text-gray-900 tracking-widest uppercase mb-6">
                        Más Noticias
                      </h3>

                      {/* Par 1 */}
                      {latestArticles.length > 27 && (
                        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-200 relative">
                          <div className="absolute left-1/2 top-0 bottom-6 w-px bg-gray-200 -ml-[0.5px]"></div>
                          <Link to={`/articulo/${latestArticles[26].id}`} className="group block">
                            <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                              <img
                                src={latestArticles[26].image}
                                alt={latestArticles[26].title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                            <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                              {latestArticles[26].title}
                            </h4>
                          </Link>
                          {latestArticles.length > 28 && (
                            <Link to={`/articulo/${latestArticles[27].id}`} className="group block">
                              <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                                <img
                                  src={latestArticles[27].image}
                                  alt={latestArticles[27].title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                              </div>
                              <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                {latestArticles[27].title}
                              </h4>
                            </Link>
                          )}
                        </div>
                      )}

                      {/* Par 2 */}
                      {latestArticles.length > 29 && (
                        <div className="grid grid-cols-2 gap-4 py-6 border-b border-gray-200 relative">
                          <div className="absolute left-1/2 top-6 bottom-6 w-px bg-gray-200 -ml-[0.5px]"></div>
                          <Link to={`/articulo/${latestArticles[28].id}`} className="group block">
                            <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                              <img
                                src={latestArticles[28].image}
                                alt={latestArticles[28].title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                            <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                              {latestArticles[28].title}
                            </h4>
                          </Link>
                          {latestArticles.length > 30 && (
                            <Link to={`/articulo/${latestArticles[29].id}`} className="group block">
                              <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                                <img
                                  src={latestArticles[29].image}
                                  alt={latestArticles[29].title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                              </div>
                              <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                {latestArticles[29].title}
                              </h4>
                            </Link>
                          )}
                        </div>
                      )}

                      {/* Par 3 */}
                      {latestArticles.length > 31 && (
                        <div className="grid grid-cols-2 gap-4 pt-6 relative">
                          <div className="absolute left-1/2 top-6 bottom-0 w-px bg-gray-200 -ml-[0.5px]"></div>
                          <Link to={`/articulo/${latestArticles[30].id}`} className="group block">
                            <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                              <img
                                src={latestArticles[30].image}
                                alt={latestArticles[30].title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                            <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                              {latestArticles[30].title}
                            </h4>
                          </Link>
                          {latestArticles.length >= 32 && (
                            <Link to={`/articulo/${latestArticles[31].id}`} className="group block">
                              <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm mb-2">
                                <img
                                  src={latestArticles[31].image}
                                  alt={latestArticles[31].title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                              </div>
                              <h4 className="font-serif font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-3 leading-snug text-sm">
                                {latestArticles[31].title}
                              </h4>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Modal de información confidencial */}
      {showSecureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                    ¿Tenés alguna noticia confidencial?
                  </h2>
                  <p className="text-base text-gray-600">
                    ¿Tenés la próxima gran noticia? ¿Querés compartirla con josenizzo.info?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSecureModal(false);
                    setShowSecureForm(false);
                    setSecureFormData({ subject: '', message: '', contactMethod: '', files: [] });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido informativo */}
              <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
                <p>
                  Ofrecemos varias maneras de contactar y proporcionar materiales a nuestros periodistas. Ningún sistema de comunicación es completamente seguro, pero estas herramientas pueden ayudarte a proteger tu anonimato.
                </p>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm font-semibold text-yellow-800">Importante:</p>
                  <p className="text-sm text-yellow-700">
                    No envíes comentarios, ideas para artículos, propuestas ni comunicados de prensa a través de estos canales.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">¿Qué constituye una buena información?</h3>
                  <p className="mb-3">
                    Una buena noticia consta de varios componentes. La documentación o las pruebas son esenciales. Especular o tener una corazonada no alcanza el nivel de una noticia. Una buena noticia debe articular un problema o asunto claro y comprensible con consecuencias reales. Sé específico.
                  </p>
                  <p className="font-semibold mb-2">Algunos ejemplos de buenas informaciones incluyen:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Evidencia de que un representante del gobierno está violando la ley</li>
                    <li>Prueba de que una empresa actúa de manera poco ética</li>
                    <li>Documentación de irregularidades en procesos públicos</li>
                  </ul>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Métodos de contacto seguros</h3>

                  {/* Formulario encriptado */}
                  {!showSecureForm ? (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Formulario Encriptado</h4>
                          <p className="text-sm text-gray-700 mb-3">
                            Esta página utiliza cifrado para codificar cualquier información que compartas. El contenido del mensaje, incluidos los archivos adjuntos, solo podrá ser leído por josenizzo.info.
                          </p>
                          <p className="text-xs text-gray-600 mb-3">
                            <strong>Nota:</strong> Debes dejar un correo electrónico si deseas que nos pongamos en contacto con vos.
                          </p>
                          <button
                            onClick={() => setShowSecureForm(true)}
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition-colors text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Abrir formulario seguro
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
                      {!secureFormSubmitted ? (
                        <form onSubmit={handleSecureFormSubmit}>
                          <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <h4 className="font-bold text-gray-900">Formulario Encriptado</h4>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Asunto de la denuncia *
                              </label>
                              <input
                                type="text"
                                value={secureFormData.subject}
                                onChange={(e) => setSecureFormData({ ...secureFormData, subject: e.target.value })}
                                placeholder="Ej: Irregularidades en licitación pública"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Descripción detallada *
                              </label>
                              <textarea
                                value={secureFormData.message}
                                onChange={(e) => setSecureFormData({ ...secureFormData, message: e.target.value })}
                                rows={4}
                                placeholder="Proporciona todos los detalles que consideres relevantes..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Método de contacto (opcional)
                              </label>
                              <input
                                type="text"
                                value={secureFormData.contactMethod}
                                onChange={(e) => setSecureFormData({ ...secureFormData, contactMethod: e.target.value })}
                                placeholder="Email, WhatsApp, Signal, etc."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Adjuntar documentos (opcional)
                              </label>
                              <input
                                type="file"
                                multiple
                                onChange={(e) => setSecureFormData({ ...secureFormData, files: Array.from(e.target.files) })}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                              />
                              {secureFormData.files.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">{secureFormData.files.length} archivo(s) seleccionado(s)</p>
                              )}
                            </div>

                            <div className="flex items-start gap-2">
                              <input type="checkbox" required className="mt-1" id="secure-terms" />
                              <label htmlFor="secure-terms" className="text-xs text-gray-600">
                                Confirmo que la información es veraz y será tratada con confidencialidad.
                              </label>
                            </div>

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => setShowSecureForm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                              >
                                Volver
                              </button>
                              <button
                                type="submit"
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Enviar
                              </button>
                            </div>
                          </div>
                        </form>
                      ) : (
                        <div className="text-center py-6">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 mb-2">¡Información recibida!</h4>
                          <p className="text-sm text-gray-600">
                            Tu mensaje ha sido encriptado y enviado de forma segura.
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Código: <span className="font-mono font-bold">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* WhatsApp */}
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">WhatsApp</h4>
                        <p className="text-sm text-gray-700 mb-3">
                          Contactanos de forma directa y confidencial a través de WhatsApp. Podés enviar mensajes, fotos, videos y documentos.
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-green-900">
                            <a href="https://wa.me/5493425213071" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                              <span className="font-mono">+54 9 342 521 3071</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </p>
                          <p className="text-sm font-semibold text-green-900">
                            <a href="https://wa.me/5493424662109" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                              <span className="font-mono">+54 9 342 466 2109</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
