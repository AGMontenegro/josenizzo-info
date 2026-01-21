import SEO from '../components/SEO';

function Privacy() {
  return (
    <>
      <SEO
        title="Política de Privacidad"
        description="Conocé cómo josenizzo.info protege tu privacidad y maneja tus datos personales."
        url="/privacidad"
      />

      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="mb-12 border-b border-gray-200 pb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Política de Privacidad
            </h1>
            <p className="text-sm text-gray-600">
              Última actualización: {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Introducción
              </h2>
              <p className="text-gray-700 leading-relaxed">
                En <strong>josenizzo.info</strong>, respetamos tu privacidad y nos comprometemos a proteger
                tus datos personales. Esta política de privacidad describe cómo recopilamos, usamos y
                protegemos tu información cuando visitás nuestro sitio web.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Información que Recopilamos
              </h2>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">
                Información que proporcionás voluntariamente
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Suscripción al Newsletter:</strong> Dirección de correo electrónico</li>
                <li><strong>Formularios de contacto:</strong> Nombre, email y mensaje</li>
                <li><strong>Comentarios:</strong> Nombre, email y contenido del comentario (si está habilitado)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">
                Información recopilada automáticamente
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Dirección IP</li>
                <li>Tipo de navegador y dispositivo</li>
                <li>Páginas visitadas y tiempo de permanencia</li>
                <li>Fecha y hora de acceso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Cómo Usamos tu Información
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Utilizamos la información recopilada para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Enviar nuestro newsletter diario a suscriptores</li>
                <li>Responder a consultas y mensajes de contacto</li>
                <li>Mejorar la experiencia de usuario en el sitio</li>
                <li>Analizar el tráfico y comportamiento de usuarios (de forma anónima)</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Compartir tu Información
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>NO vendemos, alquilamos ni compartimos</strong> tu información personal con terceros
                con fines comerciales. Solo compartimos información cuando:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Es requerido por ley o por autoridades competentes</li>
                <li>Es necesario para proteger nuestros derechos legales</li>
                <li>Contamos con tu consentimiento explícito</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Cookies y Tecnologías Similares
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia en el sitio,
                recordar tus preferencias y analizar el uso del sitio. Podés configurar tu navegador
                para rechazar cookies, aunque esto puede afectar algunas funcionalidades del sitio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Seguridad de los Datos
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información
                contra acceso no autorizado, pérdida o alteración. Sin embargo, ningún sistema de
                transmisión por Internet es 100% seguro.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Tus Derechos
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Tenés derecho a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Acceder</strong> a tus datos personales que tenemos</li>
                <li><strong>Rectificar</strong> información incorrecta o incompleta</li>
                <li><strong>Eliminar</strong> tus datos personales (derecho al olvido)</li>
                <li><strong>Oponerte</strong> al procesamiento de tus datos</li>
                <li><strong>Revocar</strong> tu consentimiento en cualquier momento</li>
                <li><strong>Desuscribirte</strong> del newsletter mediante el enlace en cada email</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Para ejercer estos derechos, contactanos a:{' '}
                <a href="mailto:privacidad@josenizzo.info" className="text-blue-600 hover:underline">
                  privacidad@josenizzo.info
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Retención de Datos
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Conservamos tus datos personales solo durante el tiempo necesario para cumplir con los
                propósitos descritos en esta política, o según lo requiera la ley aplicable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Enlaces a Sitios de Terceros
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nuestro sitio puede contener enlaces a sitios web de terceros. No somos responsables
                de las prácticas de privacidad de esos sitios. Te recomendamos revisar sus políticas
                de privacidad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Cambios a esta Política
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre
                cambios significativos mediante un aviso en nuestro sitio web. La fecha de última
                actualización siempre aparecerá al inicio de esta página.
              </p>
            </section>

            <section className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Contacto
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Si tenés preguntas sobre esta política de privacidad o sobre cómo manejamos tus datos,
                contactanos:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacidad@josenizzo.info" className="text-blue-600 hover:underline">
                    privacidad@josenizzo.info
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong>Contacto general:</strong>{' '}
                  <a href="mailto:contacto@josenizzo.info" className="text-blue-600 hover:underline">
                    contacto@josenizzo.info
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export default Privacy;
