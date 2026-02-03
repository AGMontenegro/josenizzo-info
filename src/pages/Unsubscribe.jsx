import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { newsletterAPI } from '../services/api';

function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleUnsubscribe = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Por favor ingresá un email válido');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await newsletterAPI.unsubscribe(email);
      setStatus('success');
      setMessage('Tu suscripción ha sido cancelada exitosamente.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Error al cancelar la suscripción. Intentá nuevamente.');
    }
  };

  return (
    <>
      <SEO
        title="Cancelar Suscripción"
        description="Cancelá tu suscripción al newsletter de josenizzo.info"
        url="/desuscribirse"
      />

      <div className="bg-white dark:bg-gray-950 min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4">
              Cancelar Suscripción
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Lamentamos verte partir. Podés cancelar tu suscripción al newsletter aquí.
            </p>
          </div>

          {status === 'success' ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
              <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2">
                Suscripción Cancelada
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ya no recibirás emails de nuestro newsletter.
              </p>
              <a
                href="/"
                className="inline-block bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Volver al inicio
              </a>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8">
              <form onSubmit={handleUnsubscribe} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {message && status === 'error' && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
                    <p className="text-sm text-red-800 dark:text-red-300">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Cancelando...' : 'Cancelar Suscripción'}
                </button>

                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Si cambiás de opinión, siempre podés volver a suscribirte desde nuestra{' '}
                  <a href="/" className="text-gray-900 dark:text-gray-100 hover:underline font-semibold">
                    página principal
                  </a>
                  .
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Unsubscribe;
