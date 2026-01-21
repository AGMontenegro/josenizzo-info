import { useState } from 'react';

function TopicTracker({ topic }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <>
      <button
        onClick={handleFollow}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          isFollowing
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isFollowing ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Siguiendo "{topic}"
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Seguir "{topic}"
          </>
        )}
      </button>

      {/* Notificación */}
      {showNotification && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-lg shadow-2xl max-w-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-sm">
                  {isFollowing ? '¡Tema agregado!' : 'Tema removido'}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  {isFollowing
                    ? `Te notificaremos cuando haya novedades sobre "${topic}"`
                    : `Ya no seguirás "${topic}"`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TopicTracker;
