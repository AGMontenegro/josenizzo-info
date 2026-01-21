import { useState, useEffect } from 'react';

function ZenMode({ children }) {
  const [zenMode, setZenMode] = useState(false);

  useEffect(() => {
    if (zenMode) {
      document.body.style.overflow = 'auto';
    }
  }, [zenMode]);

  if (!zenMode) {
    return (
      <>
        {children}
        <button
          onClick={() => setZenMode(true)}
          className="fixed right-6 bottom-6 z-40 group"
          title="Modo Lectura Inmersiva"
        >
          <div className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Modo Zen
          </span>
        </button>
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      {/* Barra superior minimalista */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-medium">Modo Lectura Inmersiva</span>
          </div>
          <button
            onClick={() => setZenMode(false)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>Salir</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenido centrado y limpio */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="prose prose-lg prose-gray max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ZenMode;
