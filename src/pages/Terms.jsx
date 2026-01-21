import SEO from '../components/SEO';

function Terms() {
  return (
    <>
      <SEO
        title="Términos y Condiciones"
        description="Términos y condiciones de uso del sitio web josenizzo.info"
        url="/terminos"
      />

      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="mb-12 border-b border-gray-200 pb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-sm text-gray-600">
              Última actualización: {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Aceptación de los Términos
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Al acceder y usar <strong>josenizzo.info</strong>, aceptás estos términos y condiciones
                en su totalidad. Si no estás de acuerdo con estos términos, no deberías usar este sitio web.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Uso del Sitio
              </h2>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">
                Uso Permitido
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Podés usar este sitio para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Leer y consumir contenido informativo</li>
                <li>Suscribirte al newsletter</li>
                <li>Compartir artículos en redes sociales</li>
                <li>Contactarnos mediante los formularios disponibles</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">
                Uso Prohibido
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                No está permitido:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Reproducir, distribuir o modificar el contenido sin autorización</li>
                <li>Usar el sitio para fines ilegales o no autorizados</li>
                <li>Intentar acceder a áreas restringidas del sitio</li>
                <li>Transmitir virus, malware o código malicioso</li>
                <li>Hacer scraping automatizado sin permiso expreso</li>
                <li>Suplantar la identidad de otra persona o entidad</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Propiedad Intelectual
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Todo el contenido publicado en josenizzo.info, incluyendo textos, imágenes, gráficos,
                logos, videos y código, está protegido por derechos de autor y otras leyes de propiedad
                intelectual.
              </p>
              <p className="text-gray-700 leading-relaxed">
                El uso no autorizado de cualquier material de este sitio puede violar leyes de derechos
                de autor, marcas registradas y otras leyes aplicables.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Contenido del Usuario
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Si envías comentarios, sugerencias o cualquier otro contenido al sitio:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Garantizás que tenés derecho a enviar ese contenido</li>
                <li>Nos otorgás una licencia no exclusiva para usar, modificar y publicar ese contenido</li>
                <li>Aceptás que podemos remover contenido inapropiado sin previo aviso</li>
                <li>No publicarás contenido ofensivo, difamatorio, ilegal o que infrinja derechos de terceros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Exactitud de la Información
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nos esforzamos por proporcionar información precisa y actualizada. Sin embargo, no
                garantizamos que toda la información sea completamente exacta, completa o actual.
                El contenido se proporciona "tal cual" sin garantías de ningún tipo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Enlaces a Sitios de Terceros
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nuestro sitio puede contener enlaces a sitios web de terceros. No controlamos ni somos
                responsables del contenido, políticas de privacidad o prácticas de sitios de terceros.
                El acceso a esos sitios es bajo tu propio riesgo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Limitación de Responsabilidad
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                En la máxima medida permitida por la ley, josenizzo.info no será responsable por:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Daños directos, indirectos, incidentales o consecuentes</li>
                <li>Pérdida de datos, ingresos o ganancias</li>
                <li>Interrupciones del servicio o errores técnicos</li>
                <li>Contenido de terceros o enlaces externos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Indemnización
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Aceptás indemnizar y mantener indemne a josenizzo.info, sus propietarios, empleados y
                colaboradores de cualquier reclamo, daño, pérdida o gasto (incluyendo honorarios legales)
                que surja de tu uso del sitio o violación de estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Modificaciones del Servicio
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nos reservamos el derecho de modificar, suspender o discontinuar cualquier parte del
                sitio en cualquier momento sin previo aviso. No seremos responsables ante vos ni ante
                terceros por cualquier modificación, suspensión o discontinuación del sitio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Cambios a los Términos
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos actualizar estos términos ocasionalmente. Los cambios entrarán en vigor
                inmediatamente después de su publicación en el sitio. Tu uso continuado del sitio
                después de los cambios constituye tu aceptación de los nuevos términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Ley Aplicable
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa
                relacionada con estos términos será resuelta en los tribunales competentes de Argentina.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Terminación
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos terminar o suspender tu acceso al sitio inmediatamente, sin previo aviso o
                responsabilidad, por cualquier razón, incluyendo si violás estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Divisibilidad
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Si alguna disposición de estos términos se considera inválida o inaplicable, las
                disposiciones restantes continuarán en pleno vigor y efecto.
              </p>
            </section>

            <section className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Contacto
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Si tenés preguntas sobre estos términos y condiciones, contactanos:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:legal@josenizzo.info" className="text-blue-600 hover:underline">
                    legal@josenizzo.info
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

export default Terms;
