import express from 'express';
import { sendSecureTipNotification } from '../services/emailService.js';

const router = express.Router();

// POST /api/contact/secure-tip - Recibir denuncia confidencial
router.post('/secure-tip', async (req, res) => {
  try {
    const { subject, message, contactMethod } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Asunto y mensaje son requeridos' });
    }

    // Enviar notificación por email
    const result = await sendSecureTipNotification({
      subject,
      message,
      contactMethod
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Denuncia recibida correctamente',
        referenceCode: Math.random().toString(36).substr(2, 9).toUpperCase()
      });
    } else {
      console.error('Error al procesar denuncia:', result.error);
      res.status(500).json({ error: 'Error al procesar la denuncia' });
    }
  } catch (error) {
    console.error('Error en /secure-tip:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
