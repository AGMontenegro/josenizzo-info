import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ArticleCard from '../components/ArticleCard';
import ReadingTime from '../components/ReadingTime';
import Badge from '../components/Badge';
import AuthorInfo from '../components/AuthorInfo';
import ZenMode from '../components/ZenMode';
import TopicTracker from '../components/TopicTracker';
import FactCheck from '../components/FactCheck';
import AudioPlayer from '../components/AudioPlayer';
import ShareButtons from '../components/ShareButtons';
import SEO from '../components/SEO';
import LoadingSpinner from '../components/LoadingSpinner';
import { useArticle, useArticles } from '../hooks/useArticles';

function ArticleDetail() {
  const { id } = useParams();
  const { article, loading, error } = useArticle(id);
  const { articles: relatedArticles } = useArticles({
    category: article?.category,
    limit: 3
  });

  // Reload Twitter widgets after article content is rendered
  useEffect(() => {
    if (!article) return;

    const loadTwitterWidgets = () => {
      if (window.twttr && window.twttr.widgets) {
        console.log('Loading Twitter widgets...');
        window.twttr.widgets.load();
      } else {
        console.log('Twitter widgets not ready, retrying...');
        // Retry after a short delay if Twitter script isn't loaded yet
        setTimeout(loadTwitterWidgets, 500);
      }
    };

    // Wait a bit for content to be in DOM, then load widgets
    const timer = setTimeout(loadTwitterWidgets, 300);

    return () => clearTimeout(timer);
  }, [article]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingSpinner className="py-20" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {error || 'Artículo no encontrado'}
        </h1>
        <Link to="/" className="text-red-600 hover:text-red-700 font-semibold">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const filteredRelatedArticles = relatedArticles.filter(a => a.id !== article.id).slice(0, 3);

  const date = article.date || article.created_at;
  const formattedDate = format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <div className="bg-white">
      <SEO
        title={article.title}
        description={article.excerpt}
        image={article.image}
        article={true}
        author={article.author || article.author_name}
        publishedTime={date}
        category={article.category}
        url={`/articulo/${article.id}`}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm flex items-center gap-2">
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Inicio
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              to={`/categoria/${article.category.toLowerCase()}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {article.category}
            </Link>
          </nav>

          {/* Badges */}
          {article.badge && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge type={article.badge}>
                {article.badge === 'exclusive' && 'Exclusivo'}
                {article.badge === 'analysis' && 'Análisis'}
                {article.badge === 'opinion' && 'Opinión'}
                {article.badge === 'live' && 'En Vivo'}
              </Badge>
            </div>
          )}

          {/* Título */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6 leading-[1.1]">
            {article.title}
          </h1>

          {/* Bajada/Excerpt */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed font-serif">
            {article.excerpt}
          </p>

          {/* Autor y fecha */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <AuthorInfo
              author={article.author || article.author_name}
              date={formattedDate}
              readTime={article.readTime || article.read_time}
            />
          </div>

          {/* Imagen principal */}
          <div className="mb-8">
            <img
              src={article.image}
              alt={article.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Contenido del artículo */}
          <ZenMode>
            <div
              className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-lg prose-img:max-w-full prose-img:h-auto prose-img:mx-auto prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-6 prose-ol:my-6 [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto [&_img]:block [&_img]:my-6"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </ZenMode>

          {/* Compartir artículo */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <ShareButtons article={article} />
          </div>

          {/* Seguir tema */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">¿Te interesa este tema?</h3>
                <p className="text-xs text-gray-500">Recibí notificaciones de nuevos artículos</p>
              </div>
              <TopicTracker topic={article.category} />
            </div>
          </div>

          {/* Audio Player */}
          <div className="mt-8">
            <AudioPlayer articleTitle={article.title} articleContent={article.content} />
          </div>


        </article>

        {/* Sidebar */}
        <aside className="space-y-8">

          {/* Artículos relacionados */}
          {filteredRelatedArticles.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-600">
                Artículos Relacionados
              </h3>
              <div className="space-y-4">
                {filteredRelatedArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="horizontal" />
                ))}
              </div>
            </div>
          )}

          {/* Banner publicitario */}
          <div className="bg-gray-100 border border-gray-200 p-8 text-center rounded-lg sticky top-24">
            <p className="text-gray-500 font-semibold">Espacio Publicitario</p>
            <p className="text-sm text-gray-400 mt-2">300x600</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ArticleDetail;
