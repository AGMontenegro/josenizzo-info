import { useState, useEffect } from 'react';

function ConferenciaPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('conferencia_popup_dismissed');
    const today = new Date().toDateString();
    if (dismissed === today) return;
    setShow(true);
  }, []);

  function handleClose() {
    const today = new Date().toDateString();
    localStorage.setItem('conferencia_popup_dismissed', today);
    setShow(false);
  }

  function handleImageClick() {
    window.open('https://wa.me/543424662109', '_blank');
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999 }}
      onClick={handleClose}
    >
      <div
        className="relative max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 z-10 bg-white text-gray-900 rounded-full w-8 h-8 flex items-center justify-center shadow-lg font-bold text-lg hover:bg-gray-100 transition-colors"
        >
          ×
        </button>
        <img
          src="/logos/conferencia2026.jpg"
          alt="Conferencia Encuentro 2026 - José Nizzo"
          className="w-full rounded-lg cursor-pointer shadow-2xl"
          onClick={handleImageClick}
        />
        <p className="text-center text-white text-xs mt-2 opacity-70">
          Tocá la imagen para reservar por WhatsApp
        </p>
      </div>
    </div>
  );
}

export default ConferenciaPopup;
