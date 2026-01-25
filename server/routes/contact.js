import express from 'express';
import multer from 'multer';
import { sendSecureTipNotification } from '../services/emailService.js';

const router = express.Router();

// Configurar multer para archivos en memoria (para adjuntar al email)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
    files: 5 // Máximo 5 archivos
  },
  fileFilter: (req, file, cb) => {
    // Permitir documentos, imágenes, audio y video
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'video/mp4', 'video/webm', 'video/quicktime'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
    }
  }
});

// POST /api/contact/secure-tip - Recibir denuncia confidencial
router.post('/secure-tip', upload.array('files', 5), async (req, res) => {
  try {
    const { subject, message, contactMethod } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Asunto y mensaje son requeridos' });
    }

    // Preparar archivos adjuntos para el email
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype
    })) : [];

    // Enviar notificación por email
    const result = await sendSecureTipNotification({
      subject,
      message,
      contactMethod,
      attachments
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
