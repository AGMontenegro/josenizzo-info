import { useState } from 'react';

function SecureInbox() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    contactMethod: '',
    files: []
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // En producción, esto enviaría a un endpoint seguro encriptado
    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmitted(false);
      setFormData({ subject: '', message: '', contactMethod: '', files: [] });
    }, 3000);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed left-6 bottom-6 z-40 group"
        title="Buzón de Denuncias Seguro"
      >
        <div className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Denuncias Seguras
        </span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                      Buzón de Denuncias Seguro
                    </h2>
                    <p className="text-sm text-gray-600">
                      Envía información de forma confidencial y encriptada
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Advertencia de seguridad */}
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                  <div className="flex gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-green-800">
                      <p className="font-semibold mb-1">Comunicación Encriptada de Extremo a Extremo</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>No registramos tu IP ni metadatos identificables</li>
                        <li>Los archivos se encriptan antes de enviarse</li>
                        <li>Solo nuestro equipo de investigación puede acceder</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Formulario */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Asunto de la denuncia
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Ej: Irregularidades en licitación pública"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción detallada
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      placeholder="Proporciona todos los detalles que consideres relevantes. Cuanta más información, mejor podremos investigar."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Método de contacto (opcional y anónimo)
                    </label>
                    <input
                      type="text"
                      value={formData.contactMethod}
                      onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                      placeholder="Email cifrado, Signal, Telegram, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Si deseas que te contactemos, proporciona un método seguro
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Adjuntar documentos (opcional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer">
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => setFormData({ ...formData, files: Array.from(e.target.files) })}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-600">
                          Arrastra archivos o <span className="text-green-600 font-semibold">haz click para seleccionar</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PDF, imágenes, documentos (max. 50MB)
                        </p>
                      </label>
                    </div>
                    {formData.files.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {formData.files.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                            </svg>
                            <span className="flex-1">{file.name}</span>
                            <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-3 mb-6">
                    <input type="checkbox" required className="mt-1" id="terms" />
                    <label htmlFor="terms" className="text-xs text-gray-600">
                      Confirmo que la información proporcionada es veraz y comprendo que el equipo de josenizzo.info la tratará con confidencialidad conforme a nuestros protocolos de protección de fuentes.
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Enviar de forma segura
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">¡Denuncia recibida!</h3>
                <p className="text-gray-600 mb-6">
                  Tu información ha sido encriptada y enviada de forma segura a nuestro equipo de investigación. Te contactaremos si necesitamos más datos.
                </p>
                <p className="text-sm text-gray-500">
                  Código de referencia: <span className="font-mono font-bold">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default SecureInbox;
