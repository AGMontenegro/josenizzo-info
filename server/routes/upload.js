import express from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { validateFileMagicBytes, scanFileForMalware, logSecurityEvent } from '../middleware/security.js';
import { verifyToken, requireAdmin } from './auth.js';

const router = express.Router();

// Configurar cliente S3 para DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com',
  region: process.env.DO_SPACES_REGION || 'nyc3',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
  forcePathStyle: false,
});

const BUCKET_NAME = process.env.DO_SPACES_BUCKET || 'josenizzo-uploads';

// Configurar multer para memoria
const storage = multer.memoryStorage();

// Filtrar solo imágenes (para portada)
const fileFilter = (_req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (imageTypes.test(ext) || imageTypes.test(file.mimetype)) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo para imágenes de portada
  },
  fileFilter: fileFilter
});

// Función para optimizar imagen con Sharp
async function optimizeImage(buffer, originalName) {
  const optimized = await sharp(buffer)
    .resize(1200, null, { // Max 1200px de ancho, mantener aspect ratio
      withoutEnlargement: true,
      fit: 'inside'
    })
    .webp({
      quality: 80,
      effort: 4 // Balance entre velocidad y compresión
    })
    .toBuffer();

  // Generar nombre con extensión .webp
  const nameWithoutExt = path.basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const fileName = `uploads/${nameWithoutExt}-${uniqueSuffix}.webp`;

  // Generar blur placeholder (20px de ancho, base64)
  const blurBuffer = await sharp(buffer)
    .resize(20, null, { fit: 'inside' })
    .webp({ quality: 40 })
    .toBuffer();
  const blurBase64 = blurBuffer.toString('base64');

  return { buffer: optimized, fileName, contentType: 'image/webp', blurBase64 };
}

// POST /api/upload - Subir imagen de portada
router.post('/', verifyToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Security: Scan file for malware
    const malwareScan = scanFileForMalware(req.file.buffer, req.file.originalname);
    if (!malwareScan.safe) {
      logSecurityEvent(req, 'MALWARE_UPLOAD_ATTEMPT', { filename: req.file.originalname });
      return res.status(400).json({ error: 'Archivo rechazado por seguridad' });
    }

    // Security: Validate magic bytes
    const ext = path.extname(req.file.originalname).toLowerCase().slice(1);
    if (['jpeg', 'jpg', 'png', 'gif', 'webp'].includes(ext)) {
      const validMagic = validateFileMagicBytes(req.file.buffer, ext === 'jpg' ? 'jpeg' : ext);
      if (!validMagic) {
        logSecurityEvent(req, 'INVALID_FILE_TYPE', { filename: req.file.originalname, claimedType: ext });
        return res.status(400).json({ error: 'El archivo no coincide con su extensión' });
      }
    }

    logSecurityEvent(req, 'FILE_UPLOAD', { filename: req.file.originalname, size: req.file.size });

    // Optimizar imagen
    console.log(`🖼️ Optimizando imagen: ${req.file.originalname} (${(req.file.size / 1024).toFixed(0)}KB)`);
    const processedFile = await optimizeImage(req.file.buffer, req.file.originalname);
    console.log(`✅ Imagen optimizada: ${(processedFile.buffer.length / 1024).toFixed(0)}KB (WebP)`);

    // Subir a DigitalOcean Spaces
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: processedFile.fileName,
      Body: processedFile.buffer,
      ContentType: processedFile.contentType,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    // URL pública del archivo (usando CDN)
    const fileUrl = `https://${BUCKET_NAME}.nyc3.cdn.digitaloceanspaces.com/${processedFile.fileName}`;

    res.json({
      success: true,
      message: 'Imagen optimizada y subida exitosamente',
      url: fileUrl,
      filename: processedFile.fileName,
      originalSize: req.file.size,
      optimizedSize: processedFile.buffer.length,
      savings: `${((1 - processedFile.buffer.length / req.file.size) * 100).toFixed(1)}%`,
      blurBase64: processedFile.blurBase64 || null
    });
  } catch (error) {
    console.error('Error al procesar archivo:', error);
    res.status(500).json({ error: 'Error al procesar el archivo: ' + error.message });
  }
});

// POST /api/upload/video/presign - Generar URL pre-firmada para subir video directamente a Spaces
router.post('/video/presign', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { fileName: originalName, fileSize } = req.body;

    if (!originalName) {
      return res.status(400).json({ error: 'Se requiere el nombre del archivo' });
    }

    if (fileSize && fileSize > 100 * 1024 * 1024) {
      return res.status(400).json({ error: 'El video no puede superar los 100MB' });
    }

    // Generar nombre sanitizado (mismo patrón que compressVideo)
    const ext = path.extname(originalName).toLowerCase() || '.mp4';
    const nameWithoutExt = path.basename(originalName, path.extname(originalName))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const key = `videos/${nameWithoutExt}-${uniqueSuffix}${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: `video/${ext.slice(1)}`,
      ACL: 'public-read',
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 min

    const fileUrl = `https://${BUCKET_NAME}.nyc3.cdn.digitaloceanspaces.com/${key}`;

    logSecurityEvent(req, 'VIDEO_PRESIGN', { filename: originalName, size: fileSize });

    res.json({
      success: true,
      uploadUrl,
      fileUrl,
      fileName: key,
    });
  } catch (error) {
    console.error('Error al generar URL pre-firmada:', error);
    res.status(500).json({ error: 'Error al generar URL de subida: ' + error.message });
  }
});

// POST /api/upload/image/presign - URL pre-firmada para subir imagen directamente a Spaces
router.post('/image/presign', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { fileName: originalName, fileSize, fileType } = req.body;

    if (!originalName) {
      return res.status(400).json({ error: 'Se requiere el nombre del archivo' });
    }

    if (fileSize && fileSize > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'La imagen no puede superar los 5MB' });
    }

    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const nameWithoutExt = path.basename(originalName, path.extname(originalName))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const key = `uploads/${nameWithoutExt}-${uniqueSuffix}${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType || `image/${ext.slice(1)}`,
      ACL: 'public-read',
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 min
    const fileUrl = `https://${BUCKET_NAME}.nyc3.cdn.digitaloceanspaces.com/${key}`;

    logSecurityEvent(req, 'IMAGE_PRESIGN', { filename: originalName, size: fileSize });

    res.json({ success: true, uploadUrl, fileUrl, fileName: key });
  } catch (error) {
    console.error('Error al generar URL pre-firmada para imagen:', error);
    res.status(500).json({ error: 'Error al generar URL de subida: ' + error.message });
  }
});

// POST /api/upload/audio/presign - URL pre-firmada para subir audio directamente a Spaces
router.post('/audio/presign', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { fileName: originalName, fileSize, fileType } = req.body;

    if (!originalName) {
      return res.status(400).json({ error: 'Se requiere el nombre del archivo' });
    }

    if (fileSize && fileSize > 100 * 1024 * 1024) {
      return res.status(400).json({ error: 'El audio no puede superar los 100MB' });
    }

    const ext = path.extname(originalName).toLowerCase() || '.mp3';
    const nameWithoutExt = path.basename(originalName, path.extname(originalName))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const key = `audio/${nameWithoutExt}-${uniqueSuffix}${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType || `audio/${ext.slice(1)}`,
      ACL: 'public-read',
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 min
    const fileUrl = `https://${BUCKET_NAME}.nyc3.cdn.digitaloceanspaces.com/${key}`;

    logSecurityEvent(req, 'AUDIO_PRESIGN', { filename: originalName, size: fileSize });

    res.json({ success: true, uploadUrl, fileUrl, fileName: key });
  } catch (error) {
    console.error('Error al generar URL pre-firmada para audio:', error);
    res.status(500).json({ error: 'Error al generar URL de subida: ' + error.message });
  }
});

// Error handler para multer
router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 100MB para videos.' });
    }
    return res.status(400).json({ error: error.message });
  } else if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
});

export default router;
