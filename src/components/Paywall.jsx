import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Paywall({ article }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative mt-8">
      {/* Gradiente de fade */}
      <div className="absolute inset-x-0 -top-20 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />

      {/* Contenedor del paywall */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl p-8 text-center shadow-lg">
        {/* Icono de candado */}
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Título */}
        <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-3">
          Contenido Exclusivo
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
          Este artículo es parte de nuestro contenido premium.
          Suscribite para acceder a todos los artículos de{' '}
          <span className="font-semibold text-blue-600 dark:text-blue-400">Guerra Espiritual</span> y{' '}
          <span className="font-semibold text-purple-600 dark:text-purple-400">Planeta Extremo</span>.
        </p>

        {/* Beneficios */}
        <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
          <ul className="text-left text-sm space-y-2">
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Acceso ilimitado a contenido exclusivo
            </li>
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Sin publicidad en artículos premium
            </li>
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Apoyás el periodismo independiente
            </li>
          </ul>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isAuthenticated ? (
            <Link
              to="/suscripcion"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
            >
              Ver Planes de Suscripción
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <>
              <Link
                to="/registro"
                state={{ from: { pathname: `/articulo/${article?.slug}` } }}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
              >
                Registrate Gratis
              </Link>
              <Link
                to="/login"
                state={{ from: { pathname: `/articulo/${article?.slug}` } }}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
              >
                Ya tengo cuenta
              </Link>
            </>
          )}
        </div>

        {/* Precio */}
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Desde <span className="font-semibold text-gray-900 dark:text-white">$2.999/mes</span>
        </p>
      </div>
    </div>
  );
}

export default Paywall;
