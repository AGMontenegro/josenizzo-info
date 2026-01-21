import { useState, useRef, useEffect } from 'react';

function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(null);

  // URL del streaming de FM Lo Nuestro 93.5 - Sauce Viejo, Santa Fe
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
        audioRef.current.play().catch(err => {
          console.error('Error al reproducir:', err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <>
      {/* Audio element oculto */}
      <audio
        ref={audioRef}
        src={streamUrl}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      {/* Botón flotante */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Panel expandido */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64 mb-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <img src="/logos/FM_93.5.png" alt="FM Lo Nuestro 93.5" className="h-8 w-auto object-contain flex-shrink-0" />
                <h4 className="font-bold text-gray-800 text-sm self-center">FM Lo Nuestro 93.5</h4>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Estado de reproducción */}
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={togglePlay}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isPlaying
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white shadow-md`}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isPlaying ? 'text-green-600' : 'text-gray-600'}`}>
                  {isPlaying ? 'En vivo' : 'Detenido'}
                </p>
                {isPlaying && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 h-5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                    <span className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                )}
              </div>
            </div>

            {/* Control de volumen */}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        )}

        {/* Botón principal flotante */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 ${
            isPlaying
              ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse'
              : 'bg-gradient-to-r from-blue-600 to-blue-700'
          } text-white`}
          title="FM Lo Nuestro 93.5"
        >
          {isPlaying ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        {/* Indicador "93.5" pequeño */}
        <span className="absolute -top-1 -left-1 bg-yellow-400 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
          93.5
        </span>
      </div>
    </>
  );
}

export default RadioPlayer;
