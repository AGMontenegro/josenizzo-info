import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { verifyToken, requireAdmin } from './auth.js';

const router = express.Router();

// Middleware para manejar errores de validación
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
  }
  next();
};

// Planes disponibles
const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Mensual',
    price: 2999,
    currency: 'ARS',
    duration_days: 30,
    description: 'Acceso completo por 1 mes'
  },
  yearly: {
    id: 'yearly',
    name: 'Anual',
    price: 29990,
    currency: 'ARS',
    duration_days: 365,
    description: 'Acceso completo por 1 año (2 meses gratis)'
  }
};

// GET /api/subscriptions/plans - Obtener planes disponibles
router.get('/plans', (req, res) => {
  res.json({ plans: Object.values(PLANS) });
});

// GET /api/subscriptions/status - Estado de suscripción del usuario actual
router.get('/status', verifyToken, async (req, res) => {
  try {
    const subscription = await db.getAsync(`
      SELECT * FROM subscriptions
      WHERE user_id = ? AND status = 'active' AND expires_at > NOW()
      ORDER BY expires_at DESC
      LIMIT 1
    `, [req.user.id]);

    if (subscription) {
      res.json({
        isSubscribed: true,
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
          expires_at: subscription.expires_at,
          starts_at: subscription.starts_at
        }
      });
    } else {
      res.json({
        isSubscribed: false,
        subscription: null
      });
    }
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ error: 'Error al verificar suscripción' });
  }
});

// POST /api/subscriptions/create - Crear suscripción (admin manual o futuro pago)
router.post('/create',
  verifyToken,
  requireAdmin,
  body('user_id').isInt({ min: 1 }),
  body('plan').isIn(['monthly', 'yearly']),
  body('payment_provider').optional().isString(),
  body('payment_id').optional().isString(),
  handleValidation,
  async (req, res) => {
    try {
      const { user_id, plan, payment_provider, payment_id } = req.body;
      const planData = PLANS[plan];

      if (!planData) {
        return res.status(400).json({ error: 'Plan no válido' });
      }

      // Verificar que el usuario existe
      const user = await db.getAsync('SELECT id FROM users WHERE id = ?', [user_id]);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + planData.duration_days * 24 * 60 * 60 * 1000);

      const result = await db.runAsync(`
        INSERT INTO subscriptions (user_id, plan, status, payment_provider, payment_id, amount, currency, starts_at, expires_at, created_at, updated_at)
        VALUES (?, ?, 'active', ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        user_id,
        plan,
        payment_provider || 'manual',
        payment_id || null,
        planData.price,
        planData.currency,
        now.toISOString().slice(0, 19).replace('T', ' '),
        expiresAt.toISOString().slice(0, 19).replace('T', ' ')
      ]);

      res.status(201).json({
        message: 'Suscripción creada exitosamente',
        subscription: {
          id: result.lastID || result.insertId,
          user_id,
          plan,
          status: 'active',
          starts_at: now,
          expires_at: expiresAt
        }
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Error al crear suscripción' });
    }
  }
);

// POST /api/subscriptions/cancel - Cancelar suscripción
router.post('/cancel', verifyToken, async (req, res) => {
  try {
    const result = await db.runAsync(`
      UPDATE subscriptions
      SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
      WHERE user_id = ? AND status = 'active'
    `, [req.user.id]);

    if (result.changes === 0 && result.affectedRows === 0) {
      return res.status(404).json({ error: 'No hay suscripción activa para cancelar' });
    }

    res.json({ message: 'Suscripción cancelada exitosamente' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Error al cancelar suscripción' });
  }
});

// GET /api/subscriptions/all - Listar todas las suscripciones (admin)
router.get('/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    const subscriptions = await db.allAsync(`
      SELECT s.*, u.email, u.name
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 100
    `);

    res.json({ subscriptions });
  } catch (error) {
    console.error('Error listing subscriptions:', error);
    res.status(500).json({ error: 'Error al listar suscripciones' });
  }
});

// Función auxiliar para verificar suscripción (usada por otros módulos)
export async function checkUserSubscription(userId) {
  try {
    const subscription = await db.getAsync(`
      SELECT id FROM subscriptions
      WHERE user_id = ? AND status = 'active' AND expires_at > NOW()
      LIMIT 1
    `, [userId]);
    return !!subscription;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

export default router;
