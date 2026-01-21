import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Badge from './Badge';
import AuthorInfo from './AuthorInfo';

function ArticleCard({ article, featured = false, variant = 'default', hideCategory = false }) {
  const date = article.date || article.created_at;
  const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });

  if (featured) {
    return (
      <Link to={`/articulo/${article.id}`} className="group block">
        <article className="relative overflow-hidden bg-white">
          <div className="aspect-[3/2] relative overflow-hidden bg-gray-100">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              loading="lazy"
            />
            {article.badge && (
              <div className="absolute top-4 left-4">
                <Badge type={article.badge}>
                  {article.badge === 'exclusive' && 'Exclusivo'}
                  {article.badge === 'analysis' && 'Análisis'}
                  {article.badge === 'opinion' && 'Opinión'}
                  {article.badge === 'live' && 'En Vivo'}
                </Badge>
              </div>
            )}
          </div>
          <div className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-700 text-xs font-bold uppercase tracking-widest">
                {article.category}
              </span>
              {(article.readTime || article.read_time) && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{article.readTime || article.read_time} min de lectura</span>
                </>
              )}
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-[1.05] group-hover:text-gray-700 transition-colors duration-200">
              {article.title}
            </h2>
            <p className="text-gray-600 text-xl mb-5 line-clamp-3 leading-relaxed font-light">
              {article.excerpt}
            </p>
            <AuthorInfo author={article.author || article.author_name} date={timeAgo} compact />
          </div>
        </article>
      </Link>
    );
  }

  if (variant === 'editorial') {
    return (
      <Link to={`/articulo/${article.id}`} className="group block">
        <article>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-700 text-xs font-bold uppercase tracking-widest">
              {article.category}
            </span>
            {article.badge && (
              <Badge type={article.badge}>
                {article.badge === 'exclusive' && 'Exclusivo'}
                {article.badge === 'analysis' && 'Análisis'}
                {article.badge === 'opinion' && 'Opinión'}
              </Badge>
            )}
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-3 leading-tight group-hover:text-gray-700 transition-colors duration-200">
            {article.title}
          </h3>
          <p className="text-gray-600 text-base mb-4 line-clamp-3 leading-relaxed font-light">
            {article.excerpt}
          </p>
          <AuthorInfo author={article.author || article.author_name} date={timeAgo} readTime={article.readTime || article.read_time} compact />
        </article>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/articulo/${article.id}`} className="group block">
        <article className="py-2">
          <span className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
            {article.category}
          </span>
          <h3 className="font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-200 line-clamp-3 mt-2 leading-snug text-base">
            {article.title}
          </h3>
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <span>{timeAgo}</span>
          </div>
        </article>
      </Link>
    );
  }

  // Variante 'secondary' - Estilo NYT con imagen pequeña al lado
  if (variant === 'secondary') {
    return (
      <Link to={`/articulo/${article.id}`} className="group block">
        <article className="flex gap-4">
          <div className="flex-1 min-w-0">
            <span className="text-gray-700 text-xs font-bold uppercase tracking-wider">
              {article.category}
            </span>
            <h3 className="font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-200 line-clamp-3 mt-2 mb-2 leading-snug text-lg">
              {article.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-2">
              {article.excerpt}
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <span>{timeAgo}</span>
            </div>
          </div>
          <div className="flex-shrink-0 w-32 h-32">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/articulo/${article.id}`} className="group block">
      <article className="overflow-hidden bg-white pb-6">
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 mb-4">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            loading="lazy"
          />
          {article.badge && (
            <div className="absolute top-3 left-3">
              <Badge type={article.badge}>
                {article.badge === 'exclusive' && 'Exclusivo'}
                {article.badge === 'analysis' && 'Análisis'}
                {article.badge === 'opinion' && 'Opinión'}
                {article.badge === 'live' && 'En Vivo'}
              </Badge>
            </div>
          )}
        </div>
        <div>
          {!hideCategory && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-700 text-xs font-bold uppercase tracking-widest">
                {article.category}
              </span>
              {(article.readTime || article.read_time) && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{article.readTime || article.read_time} min</span>
                </>
              )}
            </div>
          )}
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-200 line-clamp-3 leading-tight">
            {article.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed font-light">
            {article.excerpt}
          </p>
          <AuthorInfo author={article.author || article.author_name} date={timeAgo} compact />
        </div>
      </article>
    </Link>
  );
}

export default ArticleCard;
