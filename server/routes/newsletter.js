import express from 'express';
import db from '../config/database.js';
import { sendWelcomeEmail, sendNewsletter } from '../services/emailService.js';
import { getAvailableTemplates } from '../templates/index.js';

const router = express.Router();

// POST /api/newsletter/subscribe - Suscribirse al newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email válido es requerido' });
    }

    // Verificar si ya está suscrito
    const existing = await db.getAsync('SELECT * FROM newsletter WHERE email = ?', [email]);

    if (existing) {
      if (existing.active) {
        return res.status(400).json({ error: 'Este email ya está suscrito' });
      } else {
        // Reactivar suscripción
        await db.runAsync('UPDATE newsletter SET active = 1 WHERE email = ?', [email]);

        // Enviar email de bienvenida al reactivar
        await sendWelcomeEmail(email);

        return res.json({ message: 'Suscripción reactivada exitosamente' });
      }
    }

    // Nueva suscripción
    await db.runAsync('INSERT INTO newsletter (email) VALUES (?)', [email]);

    // Enviar email de bienvenida
    const emailResult = await sendWelcomeEmail(email);

    if (!emailResult.success) {
      console.error('Error al enviar email de bienvenida:', emailResult.error);
      // No fallamos la suscripción, solo logueamos el error
    }

    res.status(201).json({ message: 'Suscripción exitosa al newsletter' });
  } catch (error) {
    console.error('Error al suscribir:', error);
    res.status(500).json({ error: 'Error al procesar suscripción' });
  }
});

// POST /api/newsletter/unsubscribe - Cancelar suscripción
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    await db.runAsync('UPDATE newsletter SET active = 0 WHERE email = ?', [email]);

    res.json({ message: 'Suscripción cancelada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar suscripción' });
  }
});

// GET /api/newsletter/subscribers - Obtener todos los suscriptores (para admin)
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await db.allAsync('SELECT id, email, active, created_at FROM newsletter ORDER BY created_at DESC');

    const stats = {
      total: subscribers.length,
      active: subscribers.filter(s => s.active).length,
      inactive: subscribers.filter(s => !s.active).length,
    };

    res.json({ subscribers, stats });
  } catch (error) {
    console.error('Error al obtener suscriptores:', error);
    res.status(500).json({ error: 'Error al obtener suscriptores' });
  }
});

// POST /api/newsletter/send - Enviar newsletter masivo
router.post('/send', async (req, res) => {
  try {
    const { articleIds, template = 'default', customTitle } = req.body;

    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return res.status(400).json({ error: 'Debe seleccionar al menos un artículo' });
    }

    // Obtener suscriptores activos
    const subscribers = await db.allAsync('SELECT id, email FROM newsletter WHERE active = 1');

    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No hay suscriptores activos' });
    }

    // Obtener artículos seleccionados
    const placeholders = articleIds.map(() => '?').join(',');
    const articles = await db.allAsync(
      `SELECT id, title, excerpt, image, category, created_at FROM articles WHERE id IN (${placeholders})`,
      articleIds
    );

    if (articles.length === 0) {
      return res.status(400).json({ error: 'No se encontraron los artículos seleccionados' });
    }

    // Crear registro de envío para tracking
    const sendTimestamp = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO newsletter_sends (sent_at, article_count, subscriber_count) VALUES (?, ?, ?)',
      [sendTimestamp, articles.length, subscribers.length]
    );
    const sendId = await db.getAsync('SELECT last_insert_rowid() as id');

    // Enviar newsletter con tracking y opciones de template
    console.log(`Enviando newsletter con ${articles.length} artículos a ${subscribers.length} suscriptores...`);
    const result = await sendNewsletter(subscribers, articles, sendId.id, { template, customTitle });

    res.json({
      message: 'Newsletter enviado exitosamente',
      successful: result.successful,
      failed: result.failed,
      total: subscribers.length,
      sendId: sendId.id
    });
  } catch (error) {
    console.error('Error al enviar newsletter:', error);
    res.status(500).json({ error: 'Error al enviar newsletter' });
  }
});

// GET /api/newsletter/track/:subscriberId/:sendId - Tracking pixel para métricas
router.get('/track/:subscriberId/:sendId', async (req, res) => {
  try {
    const { subscriberId, sendId } = req.params;

    // Registrar apertura
    await db.runAsync(
      'INSERT OR IGNORE INTO newsletter_opens (subscriber_id, send_id, opened_at) VALUES (?, ?, ?)',
      [subscriberId, sendId, new Date().toISOString()]
    );

    // Devolver pixel transparente 1x1
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(pixel);
  } catch (error) {
    console.error('Error al registrar tracking:', error);
    res.status(200).end(); // Devolver 200 para no romper el email
  }
});

// GET /api/newsletter/stats - Obtener estadísticas de envíos
router.get('/stats', async (req, res) => {
  try {
    const sends = await db.allAsync(
      'SELECT * FROM newsletter_sends ORDER BY sent_at DESC LIMIT 10'
    );

    const stats = await Promise.all(sends.map(async (send) => {
      const opens = await db.allAsync(
        'SELECT COUNT(DISTINCT subscriber_id) as unique_opens FROM newsletter_opens WHERE send_id = ?',
        [send.id]
      );

      return {
        ...send,
        unique_opens: opens[0].unique_opens,
        open_rate: send.subscriber_count > 0
          ? ((opens[0].unique_opens / send.subscriber_count) * 100).toFixed(1)
          : 0
      };
    }));

    res.json({ sends: stats });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/newsletter/templates - Obtener templates disponibles
router.get('/templates', (req, res) => {
  try {
    const templates = getAvailableTemplates();
    res.json({ templates });
  } catch (error) {
    console.error('Error al obtener templates:', error);
    res.status(500).json({ error: 'Error al obtener templates' });
  }
});

export default router;
