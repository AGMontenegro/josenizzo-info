import { useState } from 'react';

function PremiumComments({ articleId }) {
  const [isSubscriber] = useState(true); // En producción vendría del estado de autenticación
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'María Rodríguez',
      avatar: 'MR',
      date: 'Hace 2 horas',
      content: 'Excelente análisis. Me parece fundamental que se aborde este tema con la profundidad que merece.',
      likes: 12,
      verified: true
    },
    {
      id: 2,
      author: 'Carlos Fernández',
      avatar: 'CF',
      date: 'Hace 5 horas',
      content: 'Muy buen artículo. Sería interesante conocer más sobre las implicancias a largo plazo.',
      likes: 8,
      verified: true
    }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      author: 'Usuario Premium',
      avatar: 'UP',
      date: 'Justo ahora',
      content: newComment,
      likes: 0,
      verified: true
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  if (!isSubscriber) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Debate Premium
          </h3>
          <p className="text-gray-600 mb-6">
            Los comentarios están disponibles solo para suscriptores. Únete a nuestra comunidad de lectores premium para participar en debates de alto nivel.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg transition-colors">
            Suscribirse ahora
          </button>
          <p className="text-sm text-gray-500 mt-4">
            {comments.length} comentarios verificados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Debate Premium</h3>
            <p className="text-blue-100 text-sm">
              Espacio exclusivo para suscriptores verificados
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold">{comments.length} comentarios</span>
          </div>
        </div>
      </div>

      {/* Formulario de nuevo comentario */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              UP
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Comparte tu análisis con la comunidad premium..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Usuario verificado</span>
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Lista de comentarios */}
      <div className="divide-y divide-gray-200">
        {comments.map((comment) => (
          <div key={comment.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {comment.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                  {comment.verified && (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-sm text-gray-500">• {comment.date}</span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {comment.content}
                </p>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>{comment.likes}</span>
                  </button>
                  <button className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Responder
                  </button>
                  <button className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    Reportar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-6 bg-gray-50 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          Este espacio está moderado. Mantengamos un debate respetuoso y constructivo.
        </p>
      </div>
    </div>
  );
}

export default PremiumComments;
