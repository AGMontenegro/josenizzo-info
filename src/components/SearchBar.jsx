import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  // Buscar artículos usando el hook con debounce
  const { articles: results, loading } = useArticles({
    search: searchTerm.trim().length >= 2 ? searchTerm : '',
    limit: 8
  });

  // Cerrar búsqueda al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Botón de búsqueda */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
        aria-label="Buscar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Panel de búsqueda */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-screen max-w-md bg-white shadow-2xl rounded-lg border border-gray-200 z-50">
          {/* Input de búsqueda */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Buscar artículos..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Resultados */}
          <div className="max-h-96 overflow-y-auto">
            {searchTerm.trim().length < 2 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Escribe al menos 2 caracteres para buscar
              </div>
            ) : loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-sm">Buscando...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">No se encontraron resultados</p>
                <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {results.map((article) => (
                  <Link
                    key={article.id}
                    to={`/articulo/${article.slug}`}
                    onClick={clearSearch}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-3">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-600 font-medium mb-1">{article.category}</p>
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {article.author} • {new Date(article.date).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer con contador */}
          {results.length > 0 && (
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-600">
              {results.length === 8 ? 'Mostrando primeros 8 resultados' : `${results.length} resultado${results.length !== 1 ? 's' : ''}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
