import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

function Header() {
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
    <header className="bg-white">
      {/* Top bar con fecha y utilidades - Mobile first */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 flex items-center justify-between">
          {/* Fecha corta en móvil, completa en desktop */}
          <p className="text-xs text-gray-600 capitalize">
            <span className="md:hidden">{shortDate}</span>
            <span className="hidden md:inline">{formattedDate}</span>
          </p>
          {/* Links y Radio - menos en móvil */}
          <div className="flex items-center gap-2 md:gap-4 text-xs text-gray-600">
            <a href="/#newsletter" className="hover:text-blue-600 transition-colors">Newsletter</a>
            <span className="text-gray-300">|</span>
            <Link to="/contacto" className="hidden sm:inline hover:text-blue-600 transition-colors">Contacto</Link>
            <span className="hidden sm:inline text-gray-300">|</span>
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
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="flex flex-col items-center justify-center py-4 md:py-8 border-b border-gray-100">
            <Link to="/" className="flex flex-col items-center hover:opacity-90 transition-opacity">
              <img
                src="/logos/logo_jn.png"
                alt="josenizzo.info - El diario de la Patria"
                className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto mb-2 md:mb-3"
              />
              <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 tracking-wide text-center">
                josenizzo.info <span className="hidden sm:inline text-xs md:text-sm text-gray-900 font-medium">EL DIARIO DE LA PATRIA</span>
              </p>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
