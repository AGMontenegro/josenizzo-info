import { useParams, Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useArticles } from '../hooks/useArticles';
import { categories } from '../data/articles';

// Crear mapeo inverso: valor normalizado -> nombre display
const categoryByValue = Object.entries(categories).reduce((acc, [key, value]) => {
  // Mapear por key en minúsculas (ej: "economia" -> "Economía")
  acc[key.toLowerCase()] = value;
  // Mapear por valor normalizado sin acentos (ej: "economia" -> "Economía")
  const normalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  acc[normalized] = value;
  // Mapear por valor en minúsculas con acentos (ej: "economía" -> "Economía")
  acc[value.toLowerCase()] = value;
  return acc;
}, {});

function Category() {
  const { category } = useParams();
  // Buscar primero por key, luego por valor normalizado
  const categoryKey = category.toUpperCase();
  const categoryName = categories[categoryKey] || categoryByValue[category.toLowerCase()];

  const { articles: categoryArticles, loading } = useArticles({
    category: categoryName,
    limit: 50
  });

  if (!categoryName) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Categoría no encontrada</h1>
        <Link to="/" className="text-red-600 hover:text-red-700 font-semibold">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/" className="text-red-600 hover:text-red-700">
          Inicio
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">{categoryName}</span>
      </nav>

      {/* Título de la categoría */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoryName}</h1>
        <div className="h-1 w-20 bg-red-600"></div>
      </div>

      {/* Artículos */}
      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : categoryArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryArticles.map((article) => (
            <ArticleCard key={article.id} article={article} hideCategory />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No hay artículos en esta categoría todavía.</p>
        </div>
      )}
    </div>
  );
}

export default Category;