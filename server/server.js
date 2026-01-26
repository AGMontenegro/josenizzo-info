import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// Security middleware
import {
  checkBlockedIP,
  securityHeaders,
  sqlInjectionCheck,
  logSecurityEvent,
  getSecurityLogs
} from './middleware/security.js';

// Rutas
import articleRoutes from './routes/articles.js';
import authRoutes from './routes/auth.js';
import newsletterRoutes from './routes/newsletter.js';
import commentRoutes from './routes/comments.js';
import uploadRoutes from './routes/upload.js';
import marketRoutes from './routes/market.js';
import roadsRoutes from './routes/roads.js';
import contactRoutes from './routes/contact.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// ========== SEGURIDAD ==========

// Verificar IPs bloqueadas
app.use(checkBlockedIP);

// Headers de seguridad adicionales
app.use(securityHeaders);

// Protección contra SQL injection
app.use(sqlInjectionCheck);

// Helmet - Headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://platform.twitter.com", "https://syndication.twitter.com"],
      frameSrc: ["'self'", "https://platform.twitter.com", "https://www.youtube.com"],
      connectSrc: ["'self'", "https://api.twitter.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Para permitir embeds de Twitter/YouTube
}));

// Rate limiting general - 100 requests por minuto
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo en un minuto' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting estricto para auth - 5 intentos por 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: { error: 'Demasiados intentos de inicio de sesión. Espera 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos
});

// Rate limiting para formularios sensibles
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo en un minuto' },
});

// Aplicar rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/contact', sensitiveLimiter);
app.use('/api/newsletter/subscribe', sensitiveLimiter);

// CORS configurado
const allowedOrigins = [
  'https://josenizzo.info',
  'https://www.josenizzo.info',
  process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null,
  process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : null,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como apps móviles o curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // En producción, permitir por ahora pero loguear
      console.warn('CORS: Origen no permitido:', origin);
    }
  },
  credentials: true,
}));

// ========== MIDDLEWARE BÁSICO ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (para imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir el frontend compilado (dist) en producción
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Rutas API
app.use('/api/articles', articleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/roads', roadsRoutes);
app.use('/api/contact', contactRoutes);

// Ruta de salud
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'josenizzo.info API funcionando' });
});

// Ruta de logs de seguridad (solo admin, requiere token)
app.get('/api/security/logs', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  // Solo permitir en desarrollo o con JWT válido (verificar en producción)
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const logs = getSecurityLogs(100);
  res.json({ logs, count: logs.length });
});

// Manejo de errores global
app.use((err, req, res, _next) => {
  // Log security event for server errors
  logSecurityEvent(req, 'SERVER_ERROR', { message: err.message });

  console.error(err.stack);
  res.status(500).json({
    error: 'Error del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Todas las demás rutas sirven el frontend (SPA)
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor josenizzo.info corriendo en puerto ${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Frontend servido desde /dist\n`);
});

export default app;
