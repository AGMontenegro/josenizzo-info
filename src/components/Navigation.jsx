import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/articles';
import SearchBar from './SearchBar';

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center py-3">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >
              Inicio
            </Link>
            {Object.entries(categories).map(([key, value]) => (
              <Link
                key={key}
                to={`/categoria/${key.toLowerCase()}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-300"
              >
                {value}
              </Link>
            ))}
            <SearchBar />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between py-3">
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Abrir menú"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <span className="ml-2 text-sm font-medium text-gray-700">Menú</span>
          </div>

          {/* Radio Player - Mobile */}
          <div className="flex items-center">
            <audio ref={audioRef} src={streamUrl} />
            <button
              onClick={togglePlay}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-all text-[10px] ${
                isPlaying
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
              title="FM Lo Nuestro 93.5"
            >
              {isPlaying ? (
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              <span className="font-medium">FM Lo Nuestro 93.5</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
              >
                Inicio
              </Link>
              {Object.entries(categories).map(([key, value]) => (
                <Link
                  key={key}
                  to={`/categoria/${key.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                >
                  {value}
                </Link>
              ))}
            </div>
            <div className="mt-4 px-4">
              <SearchBar />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
