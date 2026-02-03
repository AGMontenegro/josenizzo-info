import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente invisible que trackea pageviews.
 * Se monta en MainLayout para capturar cada navegación.
 */
function Analytics() {
  const location = useLocation();
  const startTime = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const duration = now - startTime.current;
    startTime.current = now;

    // Extraer article_id del path si es un artículo
    const articleMatch = location.pathname.match(/^\/articulo\//);

    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const payload = {
      path: location.pathname,
      referrer: document.referrer || '',
      duration: duration > 1000 ? Math.round(duration / 1000) : 0
    };

    // Si es primera carga, no enviar duración
    if (duration < 500) {
      payload.duration = 0;
    }

    // Usar sendBeacon si disponible, sino fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        `${API_URL}/analytics/track`,
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      );
    } else {
      fetch(`${API_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  }, [location.pathname]);

  return null;
}

export default Analytics;
