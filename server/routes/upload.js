import express from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import os from 'os';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const router = express.Router();

// Configurar FFmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

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

// Filtrar imágenes y videos
const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const videoTypes = /mp4|mov|avi|webm|mkv/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (imageTypes.test(ext) || imageTypes.test(file.mimetype)) {
    req.fileType = 'image';
    return cb(null, true);
  } else if (videoTypes.test(ext) || file.mimetype.startsWith('video/')) {
    req.fileType = 'video';
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp) y videos (mp4, mov, avi, webm)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB máximo para videos antes de compresión
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

  return { buffer: optimized, fileName, contentType: 'image/webp' };
}

// Función para comprimir video con FFmpeg
function compressVideo(inputBuffer, originalName) {
  return new Promise((resolve, reject) => {
    const tempInputPath = path.join(os.tmpdir(), `input-${Date.now()}${path.extname(originalName)}`);
    const tempOutputPath = path.join(os.tmpdir(), `output-${Date.now()}.mp4`);

    // Escribir buffer a archivo temporal
    fs.writeFileSync(tempInputPath, inputBuffer);

    // Comprimir video a max 20MB
    // Calculamos bitrate aproximado: 20MB * 8 bits / duración estimada
    ffmpeg(tempInputPath)
      .outputOptions([
        '-c:v libx264',      // Codec de video H.264
        '-preset medium',    // Balance velocidad/compresión
        '-crf 28',           // Calidad (18-28 es bueno, mayor = más compresión)
        '-c:a aac',          // Codec de audio AAC
        '-b:a 128k',         // Bitrate de audio
        '-movflags +faststart', // Optimizar para streaming
        '-vf scale=\'min(1280,iw)\':\'min(720,ih)\':force_original_aspect_ratio=decrease' // Max 720p
      ])
      .output(tempOutputPath)
      .on('end', () => {
        try {
          const outputBuffer = fs.readFileSync(tempOutputPath);

          // Limpiar archivos temporales
          fs.unlinkSync(tempInputPath);
          fs.unlinkSync(tempOutputPath);

          const nameWithoutExt = path.basename(originalName, path.extname(originalName))
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const fileName = `videos/${nameWithoutExt}-${uniqueSuffix}.mp4`;

          resolve({ buffer: outputBuffer, fileName, contentType: 'video/mp4' });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => {
        // Limpiar archivos temporales en caso de error
        try {
          if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
          if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
        } catch (e) {}
        reject(err);
      })
      .run();
  });
}

// POST /api/upload - Subir imagen o video
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    let processedFile;
    const isVideo = req.fileType === 'video' || req.file.mimetype.startsWith('video/');

    if (isVideo) {
      // Comprimir video
      console.log(`📹 Comprimiendo video: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)}MB)`);
      processedFile = await compressVideo(req.file.buffer, req.file.originalname);
      console.log(`✅ Video comprimido: ${(processedFile.buffer.length / 1024 / 1024).toFixed(2)}MB`);

      // Verificar que no supere 20MB después de compresión
      if (processedFile.buffer.length > 20 * 1024 * 1024) {
        return res.status(400).json({
          error: `El video comprimido (${(processedFile.buffer.length / 1024 / 1024).toFixed(1)}MB) supera el límite de 20MB. Intenta con un video más corto.`
        });
      }
    } else {
      // Optimizar imagen
      console.log(`🖼️ Optimizando imagen: ${req.file.originalname} (${(req.file.size / 1024).toFixed(0)}KB)`);
      processedFile = await optimizeImage(req.file.buffer, req.file.originalname);
      console.log(`✅ Imagen optimizada: ${(processedFile.buffer.length / 1024).toFixed(0)}KB (WebP)`);
    }

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
      message: isVideo ? 'Video comprimido y subido exitosamente' : 'Imagen optimizada y subida exitosamente',
      url: fileUrl,
      filename: processedFile.fileName,
      originalSize: req.file.size,
      optimizedSize: processedFile.buffer.length,
      savings: `${((1 - processedFile.buffer.length / req.file.size) * 100).toFixed(1)}%`
    });
  } catch (error) {
    console.error('Error al procesar archivo:', error);
    res.status(500).json({ error: 'Error al procesar el archivo: ' + error.message });
  }
});

// POST /api/upload/video - Endpoint específico para videos (acepta archivos más grandes)
router.post('/video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún video' });
    }

    console.log(`📹 Comprimiendo video: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)}MB)`);
    const processedFile = await compressVideo(req.file.buffer, req.file.originalname);
    console.log(`✅ Video comprimido: ${(processedFile.buffer.length / 1024 / 1024).toFixed(2)}MB`);

    // Verificar que no supere 20MB después de compresión
    if (processedFile.buffer.length > 20 * 1024 * 1024) {
      return res.status(400).json({
        error: `El video comprimido (${(processedFile.buffer.length / 1024 / 1024).toFixed(1)}MB) supera el límite de 20MB. Intenta con un video más corto.`
      });
    }

    // Subir a DigitalOcean Spaces
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: processedFile.fileName,
      Body: processedFile.buffer,
      ContentType: processedFile.contentType,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    const fileUrl = `https://${BUCKET_NAME}.nyc3.cdn.digitaloceanspaces.com/${processedFile.fileName}`;

    res.json({
      success: true,
      message: 'Video comprimido y subido exitosamente',
      url: fileUrl,
      filename: processedFile.fileName,
      originalSize: req.file.size,
      optimizedSize: processedFile.buffer.length,
      savings: `${((1 - processedFile.buffer.length / req.file.size) * 100).toFixed(1)}%`
    });
  } catch (error) {
    console.error('Error al procesar video:', error);
    res.status(500).json({ error: 'Error al procesar el video: ' + error.message });
  }
});

// Error handler para multer
router.use((error, req, res, next) => {
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
