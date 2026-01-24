import { useState, useEffect, useRef, useCallback } from 'react';

function AudioPlayer({ articleTitle, articleContent }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const chunksRef = useRef([]);
  const currentChunkRef = useRef(0);
  const utteranceRef = useRef(null);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const loadingTimeoutRef = useRef(null);

  // Extraer texto plano del HTML
  const getPlainText = useCallback((html) => {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    temp.querySelectorAll('script, style').forEach(el => el.remove());
    return temp.textContent || temp.innerText || '';
  }, []);

  // Dividir texto en chunks pequeños (por oraciones)
  const splitIntoChunks = useCallback((text) => {
    // Dividir por oraciones (punto, signo de interrogación, exclamación)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      // Si agregar esta oración excede 200 caracteres, guardar chunk actual
      if (currentChunk.length + sentence.length > 200 && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  }, []);

  // Cargar voces disponibles
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();

      // Buscar voz en español
      const spanishVoice = availableVoices.find(v => v.lang === 'es-AR') ||
                          availableVoices.find(v => v.lang === 'es-ES') ||
                          availableVoices.find(v => v.lang === 'es-MX') ||
                          availableVoices.find(v => v.lang.startsWith('es')) ||
                          availableVoices[0];

      if (spanishVoice) {
        setSelectedVoice(spanishVoice);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Calcular duración estimada
  useEffect(() => {
    if (articleContent) {
      const text = getPlainText(articleContent);
      const wordCount = text.split(/\s+/).length;
      const estimatedSeconds = Math.ceil((wordCount / 150) * 60);
      setDuration(estimatedSeconds);
    }
  }, [articleContent, getPlainText]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, []);

  // Reproducir siguiente chunk
  const playNextChunk = useCallback(() => {
    if (currentChunkRef.current >= chunksRef.current.length) {
      // Terminó todo
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTime(duration);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const chunk = chunksRef.current[currentChunkRef.current];
    utteranceRef.current = new SpeechSynthesisUtterance(chunk);
    utteranceRef.current.lang = 'es-AR';
    utteranceRef.current.rate = speed;

    if (selectedVoice) {
      utteranceRef.current.voice = selectedVoice;
    }

    utteranceRef.current.onstart = () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setIsLoading(false);
      setIsPlaying(true);
      setError(null);
    };

    utteranceRef.current.onend = () => {
      currentChunkRef.current++;
      playNextChunk();
    };

    utteranceRef.current.onerror = (event) => {
      console.error('Speech error:', event.error);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Si es error de interrupción, intentar siguiente chunk
      if (event.error === 'interrupted' || event.error === 'canceled') {
        return;
      }

      // Intentar siguiente chunk si falla uno
      currentChunkRef.current++;
      if (currentChunkRef.current < chunksRef.current.length) {
        setTimeout(() => playNextChunk(), 100);
      } else {
        setError('Error de audio');
        setIsPlaying(false);
        setIsLoading(false);
      }
    };

    speechSynthesis.speak(utteranceRef.current);
  }, [speed, selectedVoice, duration]);

  const startTimeTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current && speechSynthesis.speaking && !speechSynthesis.paused) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setCurrentTime(Math.min(elapsed / speed, duration));
      }
    }, 100);
  }, [speed, duration]);

  const togglePlay = useCallback(() => {
    if (!isSupported || !articleContent) return;

    setError(null);

    if (isPlaying) {
      // Pausar
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else if (isPaused) {
      // Reanudar
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      startTimeTracking();
    } else {
      // Iniciar nueva lectura
      setIsLoading(true);
      speechSynthesis.cancel();

      // Preparar chunks
      const text = getPlainText(articleContent);
      const fullText = `${articleTitle}. ${text}`;
      chunksRef.current = splitIntoChunks(fullText);
      currentChunkRef.current = 0;

      // Timeout de seguridad
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = setTimeout(() => {
        if (!speechSynthesis.speaking) {
          setIsLoading(false);
          setError('No se pudo iniciar el audio');
        }
      }, 5000);

      startTimeRef.current = Date.now();
      startTimeTracking();
      playNextChunk();
    }
  }, [isSupported, articleContent, isPlaying, isPaused, articleTitle, getPlainText, splitIntoChunks, startTimeTracking, playNextChunk]);

  const handleSpeedChange = useCallback((newSpeed) => {
    setSpeed(newSpeed);
    if (isPlaying || isPaused) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTime(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isPlaying, isPaused]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
    currentChunkRef.current = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const speeds = [0.75, 1, 1.25, 1.5, 2];

  if (!isSupported) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="border-t border-b border-gray-200 py-4">
      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          disabled={!articleContent || isLoading}
          className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Info y progreso */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : isLoading ? (
                'Cargando...'
              ) : isPlaying ? (
                'Reproduciendo...'
              ) : isPaused ? (
                'En pausa'
              ) : (
                'Escuchar este artículo'
              )}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="relative h-1 bg-gray-200 rounded-full">
            <div
              className="absolute h-full bg-gray-900 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Velocidad */}
        <div className="relative group flex-shrink-0">
          <button className="text-xs font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded transition-colors">
            {speed}x
          </button>
          <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block z-10">
            <div className="bg-white border border-gray-200 rounded shadow-lg py-1">
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`block w-full text-left px-3 py-1 text-xs hover:bg-gray-100 ${
                    speed === s ? 'font-bold text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stop */}
        {(isPlaying || isPaused) && (
          <button
            onClick={stop}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            title="Detener"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default AudioPlayer;
