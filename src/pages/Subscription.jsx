import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

function Subscription() {
  const { isAuthenticated, isSubscribed, user } = useAuth();

  const plans = [
    {
      id: 'monthly',
      name: 'Mensual',
      price: 10,
      currency: 'USD',
      period: '/mes',
      description: 'Perfecto para probar',
      features: [
        'Acceso a Guerra Espiritual',
        'Acceso a Planeta Extremo',
        'Sin publicidad en contenido premium',
        'Cancelá cuando quieras'
      ],
      popular: false
    },
    {
      id: 'yearly',
      name: 'Anual',
      price: 100,
      currency: 'USD',
      period: '/año',
      description: '2 meses gratis',
      features: [
        'Acceso a Guerra Espiritual',
        'Acceso a Planeta Extremo',
        'Sin publicidad en contenido premium',
        'Ahorrás USD $20 al año',
        'Soporte prioritario'
      ],
      popular: true
    }
  ];

  const handleSubscribe = (planId) => {
    const message = `Hola! Quiero suscribirme al plan ${planId === 'monthly' ? 'Mensual' : 'Anual'} de josenizzo.info${user ? `. Mi email es: ${user.email}` : ''}`;
    const whatsappUrl = `https://wa.me/5493425213071?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <SEO
        title="Suscripción Premium"
        description="Suscribite a josenizzo.info y accede a contenido exclusivo de Guerra Espiritual y Planeta Extremo"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">
              Contenido Premium
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Accede a nuestras secciones exclusivas con análisis profundos y contenido que no encontrarás en ningún otro lugar.
            </p>
          </div>

          {/* Status si ya está suscrito */}
          {isSubscribed && (
            <div className="max-w-md mx-auto mb-12">
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  Ya sos suscriptor Premium
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Tenés acceso completo a todo el contenido exclusivo.
                </p>
                <Link
                  to="/perfil"
                  className="mt-4 inline-block text-green-600 dark:text-green-400 font-medium hover:underline"
                >
                  Ver mi perfil →
                </Link>
              </div>
            </div>
          )}

          {/* Secciones Premium */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">Guerra Espiritual</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Reflexiones profundas sobre fe, espiritualidad y el combate espiritual en el mundo moderno. Análisis bíblicos y perspectivas únicas.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">Planeta Extremo</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Fenómenos naturales extraordinarios, eventos climáticos extremos y misterios del planeta que desafían nuestra comprensión.
              </p>
            </div>
          </div>

          {/* Planes */}
          {!isSubscribed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 ${
                    plan.popular
                      ? 'border-blue-500 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-700'
                  } p-8`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                        Más popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{plan.description}</p>
                  </div>

                  <div className="text-center mb-6">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      USD ${plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {isAuthenticated ? (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                      }`}
                    >
                      Suscribirme
                    </button>
                  ) : (
                    <Link
                      to="/registro"
                      className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                      }`}
                    >
                      Crear cuenta
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FAQ */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Preguntas Frecuentes
            </h2>

            <div className="space-y-4">
              <details className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <summary className="px-6 py-4 cursor-pointer font-medium text-gray-900 dark:text-white">
                  ¿Cómo funciona el pago?
                </summary>
                <p className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                  Por ahora procesamos los pagos de forma manual a través de WhatsApp o transferencia bancaria.
                  Próximamente habilitaremos pagos con tarjeta a través de Mercado Pago.
                </p>
              </details>

              <details className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <summary className="px-6 py-4 cursor-pointer font-medium text-gray-900 dark:text-white">
                  ¿Puedo cancelar en cualquier momento?
                </summary>
                <p className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                  Sí, podés cancelar tu suscripción cuando quieras. Mantendrás el acceso hasta el final del período pagado.
                </p>
              </details>

              <details className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <summary className="px-6 py-4 cursor-pointer font-medium text-gray-900 dark:text-white">
                  ¿Qué métodos de pago aceptan?
                </summary>
                <p className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                  Aceptamos transferencia bancaria, Mercado Pago y efectivo.
                  Contactanos por WhatsApp para coordinar el método que prefieras.
                </p>
              </details>
            </div>
          </div>

          {/* CTA final */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              ¿Tenés dudas? Escribinos
            </p>
            <a
              href="https://wa.me/5493425213071"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-green-600 dark:text-green-400 font-medium hover:underline"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Subscription;
