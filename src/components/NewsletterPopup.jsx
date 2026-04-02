import { useState, useEffect } from 'react';
import { newsletterAPI } from '../services/api';

function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // No mostrar si ya se suscribió o ya lo cerró esta semana
    const dismissed = localStorage.getItem('newsletter_popup_dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (dismissedDate > weekAgo) return;
    }

    const subscribed = localStorage.getItem('newsletter_subscribed');
    if (subscribed) return;

    // Mostrar después de 25 segundos
    const timer = setTimeout(() => {
      setVisible(true);
    }, 25000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('newsletter_popup_dismissed', new Date().toISOString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Por favor ingresá un email válido');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await newsletterAPI.subscribe(email);
      setStatus('success');
      setMessage('¡Suscripción exitosa! Revisá tu correo.');
      localStorage.setItem('newsletter_subscribed', '1');
      setTimeout(() => setVisible(false), 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Error al suscribirse. Intentá nuevamente.');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleDismiss}
      />

      {/* Popup */}
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-md shadow-2xl">
        {/* Franja superior */}
        <div className="bg-gray-900 dark:bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-white dark:text-gray-900 font-serif font-bold text-lg">josenizzo.info</span>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white dark:hover:text-gray-900 transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-6">
          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Las noticias del día, en tu email
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">
            Suscribite gratis al newsletter de El diario de la Patria y recibí los artículos más importantes cada día.
          </p>

          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="text-green-600 font-semibold text-base mb-1">¡Gracias por suscribirte!</div>
              <p className="text-gray-500 text-sm">Revisá tu casilla de correo.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold py-3 text-sm hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Suscribiendo...' : 'Suscribirme gratis'}
              </button>
              {message && (
                <p className={`text-xs text-center ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}
              <p className="text-xs text-gray-400 text-center">Sin spam. Cancelá cuando quieras.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewsletterPopup;
