import { useState, useEffect } from 'react';

function NotificationBanner() {
  const [show, setShow] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // No mostrar si no soporta notificaciones o ya se cerró/suscribió
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission === 'granted') {
      // Ya tiene permiso, intentar suscribir silenciosamente
      subscribeToPush().then(ok => setSubscribed(ok));
      return;
    }
    if (Notification.permission === 'denied') return;
    if (sessionStorage.getItem('push_banner_dismissed')) return;

    // Mostrar banner después de 10 segundos
    const timer = setTimeout(() => setShow(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  async function subscribeToPush() {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${API_URL}/notifications/vapid-key`);
      if (!res.ok) return false;
      const { publicKey } = await res.json();

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      const subJson = subscription.toJSON();
      await fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys
        })
      });

      return true;
    } catch (err) {
      console.error('Push subscription error:', err);
      return false;
    }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function handleAllow() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const ok = await subscribeToPush();
      setSubscribed(ok);
    }
    setShow(false);
    sessionStorage.setItem('push_banner_dismissed', '1');
  }

  function handleDismiss() {
    setShow(false);
    sessionStorage.setItem('push_banner_dismissed', '1');
  }

  if (!show || subscribed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-900 text-white rounded-lg shadow-2xl p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm mb-1">Noticias de última hora</p>
          <p className="text-xs text-gray-300">Activá las notificaciones para recibir alertas de noticias importantes.</p>
        </div>
        <button onClick={handleDismiss} className="text-gray-400 hover:text-white flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleAllow}
          className="flex-1 bg-white text-gray-900 font-bold text-xs py-2 rounded hover:bg-gray-100 transition-colors"
        >
          Activar
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 border border-gray-600 text-gray-300 font-bold text-xs py-2 rounded hover:border-gray-400 transition-colors"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}

export default NotificationBanner;
