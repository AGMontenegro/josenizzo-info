import SEO from '../components/SEO';

function About() {
  return (
    <>
      <SEO
        title="Sobre Nosotros"
        description="Conocé más sobre josenizzo.info, nuestro equipo y nuestra misión de informar con calidad y objetividad."
        url="/sobre-nosotros"
      />

      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="mb-12 border-b border-gray-200 pb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Sobre Nosotros
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Tu fuente confiable de información y análisis de actualidad
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Nuestra Misión
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                En <strong>josenizzo.info</strong>, nos dedicamos a entregar periodismo de calidad,
                objetivo y accesible. Creemos en el poder de la información para transformar sociedades
                y empoderar a las personas para tomar decisiones informadas.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Nuestro compromiso es con la verdad, la transparencia y el análisis profundo de los
                acontecimientos que moldean nuestro mundo, desde la economía y la política hasta la
                cultura, la tecnología y la sociedad.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Lo Que Hacemos
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Cobertura Integral
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Cubrimos las noticias más relevantes de Argentina y el mundo en múltiples categorías:
                    Economía, Política, Tecnología, Cultura, Deportes, Sociedad e Internacional.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Además, contamos con secciones especiales: <strong>Desafío Bienestar</strong> para que
                    te desafíes cotidianamente hacia una vida más saludable, <strong>Planeta Extremo</strong> sobre
                    los cambios que está viviendo nuestra Tierra, y <strong>NG Insights</strong>, nuestros
                    artículos de opinión y análisis editorial.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Análisis en Profundidad
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    No solo reportamos hechos, los contextualizamos y analizamos para que entiendas
                    el impacto real de cada acontecimiento.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Newsletter Diario
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Recibí cada mañana un resumen curado de las noticias más importantes directamente
                    en tu correo electrónico.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Nuestros Valores
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">
                    <strong>Objetividad:</strong> Presentamos los hechos sin sesgos políticos o comerciales
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">
                    <strong>Rigor:</strong> Verificamos cada información antes de publicarla
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">
                    <strong>Transparencia:</strong> Identificamos claramente las fuentes y los autores
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">
                    <strong>Accesibilidad:</strong> Contenido gratuito y sin barreras de acceso
                  </span>
                </li>
              </ul>
            </section>

            <section className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Contacto
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ¿Tenés una sugerencia, pregunta o querés reportar un error? Estamos acá para escucharte.
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Email:</strong> <a href="mailto:josenizzo@gmail.com" className="text-blue-600 hover:underline">josenizzo@gmail.com</a>
                </p>
                <p className="text-gray-700">
                  <strong>Newsletter:</strong> Suscribite desde nuestra <a href="/" className="text-blue-600 hover:underline">página principal</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;
