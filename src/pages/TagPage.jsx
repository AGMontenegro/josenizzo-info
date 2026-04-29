import { useParams, Link } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import SEO from '../components/SEO';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';

function TagPage() {
  const { tag } = useParams();
  const { articles, loading } = useArticles({ tag, limit: 20 });

  return (
    <>
      <SEO
        title={`#${tag}`}
        description={`Artículos etiquetados con "${tag}" en josenizzo.info`}
        url={`/tag/${tag}`}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8 pb-6 border-b-2 border-gray-900 dark:border-gray-100">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Etiqueta</p>
          <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-gray-100">#{tag}</h1>
        </div>

        {loading ? (
          <LoadingSpinner className="py-20" />
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No hay artículos con esta etiqueta.</p>
            <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">Volver al inicio</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default TagPage;
