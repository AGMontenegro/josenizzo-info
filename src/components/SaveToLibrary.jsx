import { useState } from 'react';

function SaveToLibrary({ articleId, articleTitle }) {
  const [isSaved, setIsSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <button
        onClick={handleToggleSave}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
          isSaved
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
        }`}
        title={isSaved ? 'Guardado en tu biblioteca' : 'Guardar en biblioteca'}
      >
        {isSaved ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            Guardado
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Guardar
          </>
        )}
      </button>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-lg shadow-2xl max-w-sm flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isSaved ? 'bg-amber-500' : 'bg-gray-700'
            }`}>
              {isSaved ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1">
                {isSaved ? '¡Artículo guardado!' : 'Artículo removido'}
              </p>
              <p className="text-xs text-gray-300">
                {isSaved
                  ? 'Agregado a tu Biblioteca para leer después'
                  : 'Eliminado de tu Biblioteca'
                }
              </p>
              {isSaved && (
                <button className="text-xs text-amber-400 hover:text-amber-300 font-semibold mt-2">
                  Ver mi biblioteca →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SaveToLibrary;
