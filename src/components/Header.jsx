import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const { dark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume] = useState(0.8);
  const audioRef = useRef(null);
  const streamUrl = 'https://streaming2.locucionar.com/proxy/lonuestro?mp=/stream';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error('Error:', err));
      }
      setIsPlaying(!isPlaying);
    }
  };
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(today);

  // Formato corto para móvil
  const shortDate = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short'
  }).format(today);

  return (
    <header className="bg-white dark:bg-gray-950">
      {/* Top bar con fecha y utilidades - Mobile first */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 flex items-center justify-between">
          {/* Fecha corta en móvil, completa en desktop */}
          <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
            <span className="md:hidden">{shortDate}</span>
            <span className="hidden md:inline">{formattedDate}</span>
          </p>
          {/* Links y Radio - menos en móvil */}
          <div className="flex items-center gap-2 md:gap-4 text-xs text-gray-600 dark:text-gray-400">
            <Link to="/suscripcion" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Suscripción</Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            {isAuthenticated ? (
              <Link to="/perfil" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{user?.name || 'Mi cuenta'}</Link>
            ) : (
              <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Ingresar</Link>
            )}
            <span className="text-gray-300 dark:text-gray-700">|</span>
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              aria-label={dark ? 'Modo claro' : 'Modo oscuro'}
              title={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              {dark ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            {/* Radio Player - Solo visible en desktop (en móvil está en Navigation) */}
            <audio ref={audioRef} src={streamUrl} className="hidden md:block" />
            <button
              onClick={togglePlay}
              className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-full transition-all ${
                isPlaying
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title="FM Lo Nuestro 93.5"
            >
              {isPlaying ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              <span className="font-medium">FM Lo Nuestro 93.5</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logo - Mobile first: más compacto en móvil */}
      <div className="bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="flex flex-col items-center justify-center py-4 md:py-8 border-b border-gray-100 dark:border-gray-800">
            <Link to="/" className="flex flex-col items-center hover:opacity-90 transition-opacity">
              <img
                src="/logos/logo_jn.png"
                alt="josenizzo.info - El diario de la Patria"
                className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto mb-2 md:mb-3"
              />
              <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300 tracking-wide text-center">
                josenizzo.info <span className="text-xs md:text-sm text-gray-900 dark:text-gray-100 font-medium">EL DIARIO DE LA PATRIA</span>
              </p>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
