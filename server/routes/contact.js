import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { sendSecureTipNotification } from '../services/emailService.js';
import { scanFileForMalware, logSecurityEvent } from '../middleware/security.js';

const router = express.Router();

// Configurar multer para archivos en memoria (para adjuntar al email)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
    files: 5 // Máximo 5 archivos
  },
  fileFilter: (_req, file, cb) => {
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

// Middleware to handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
  }
  next();
};

// POST /api/contact/secure-tip - Recibir denuncia confidencial
router.post('/secure-tip',
  upload.array('files', 5),
  body('subject').trim().isLength({ min: 3, max: 200 }).escape(),
  body('message').trim().isLength({ min: 10, max: 10000 }),
  body('contactMethod').optional().trim().isLength({ max: 500 }),
  handleValidation,
  async (req, res) => {
  try {
    const { subject, message, contactMethod } = req.body;

    logSecurityEvent(req, 'SECURE_TIP_RECEIVED', { hasFiles: req.files?.length > 0 });

    // Scan files for malware
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const scan = scanFileForMalware(file.buffer, file.originalname);
        if (!scan.safe) {
          logSecurityEvent(req, 'MALWARE_IN_TIP', { filename: file.originalname });
          return res.status(400).json({ error: 'Archivo rechazado por seguridad' });
        }
      }
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
        referenceCode: Math.random().toString(36).substring(2, 11).toUpperCase()
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
