import express from 'express';
import webpush from 'web-push';
import db from '../config/database.js';
import { verifyToken, requireAdmin } from './auth.js';

const router = express.Router();

// Configurar VAPID
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(
    'mailto:info@josenizzo.info',
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );
}

// GET /api/notifications/vapid-key - Obtener clave pública VAPID
router.get('/vapid-key', (_req, res) => {
  if (!VAPID_PUBLIC) {
    return res.status(503).json({ error: 'Push notifications no configuradas' });
  }
  res.json({ publicKey: VAPID_PUBLIC });
});

// POST /api/notifications/subscribe - Suscribirse a notificaciones
router.post('/subscribe', async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Suscripción inválida' });
    }

    // Guardar o actualizar suscripción
    const existing = await db.getAsync(
      'SELECT id FROM push_subscriptions WHERE endpoint = ?',
      [endpoint]
    );

    if (existing) {
      await db.runAsync(
        'UPDATE push_subscriptions SET p256dh = ?, auth = ?, updated_at = CURRENT_TIMESTAMP WHERE endpoint = ?',
        [keys.p256dh, keys.auth, endpoint]
      );
    } else {
      await db.runAsync(
        'INSERT INTO push_subscriptions (endpoint, p256dh, auth) VALUES (?, ?, ?)',
        [endpoint, keys.p256dh, keys.auth]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ error: 'Error al suscribirse' });
  }
});

// POST /api/notifications/unsubscribe - Desuscribirse
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint requerido' });
    }

    await db.runAsync('DELETE FROM push_subscriptions WHERE endpoint = ?', [endpoint]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Error al desuscribirse' });
  }
});

// POST /api/notifications/send - Enviar notificación (admin)
router.post('/send', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, body, url, icon } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Título y cuerpo requeridos' });
    }

    const subscriptions = await db.allAsync('SELECT * FROM push_subscriptions');

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      icon: icon || '/logos/logo_jn.png'
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err) {
        failed++;
        // Eliminar suscripciones inválidas (410 Gone, 404)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.runAsync('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]);
        }
      }
    }

    res.json({ success: true, sent, failed, total: subscriptions.length });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ error: 'Error al enviar notificaciones' });
  }
});

/**
 * Enviar notificación de breaking news automáticamente.
 * Se llama internamente desde articles.js al crear un artículo con breaking=true.
 */
export async function sendBreakingNotification(article) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  try {
    const subscriptions = await db.allAsync('SELECT * FROM push_subscriptions');
    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({
      title: 'ÚLTIMA HORA',
      body: article.title,
      url: `/articulo/${article.slug}`,
      icon: '/logos/logo_jn.png'
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.runAsync('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]);
        }
      }
    }
  } catch (error) {
    console.error('Error sending breaking notification:', error);
  }
}

export default router;
