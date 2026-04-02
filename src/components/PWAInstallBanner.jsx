import { useState, useEffect } from 'react';

function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // No mostrar si ya instaló o ya lo descartó
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('pwa_install_dismissed', '1');
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('pwa_install_dismissed', '1');
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg px-4 py-3 flex items-center gap-3 sm:hidden">
      <img src="/logos/JN_fondo_negro.png" alt="josenizzo.info" className="w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">josenizzo.info</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Instalá la app en tu celular</p>
      </div>
      <button
        onClick={handleDismiss}
        className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1 flex-shrink-0"
      >
        ×
      </button>
      <button
        onClick={handleInstall}
        className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold px-3 py-2 flex-shrink-0 hover:bg-gray-700 transition-colors"
      >
        Instalar
      </button>
    </div>
  );
}

export default PWAInstallBanner;
