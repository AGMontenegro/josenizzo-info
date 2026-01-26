import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Formato personalizado para logs legibles
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;

  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  return msg;
});

// Crear el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat()
  ),
  defaultMeta: { service: 'josenizzo-api' },
  transports: [
    // Archivo para errores
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Archivo para todos los logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Archivo específico para accesos HTTP
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/access.log'),
      level: 'http',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// En desarrollo, también mostrar en consola con colores
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      customFormat
    )
  }));
}

// Middleware para logging de requests HTTP
export const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent')?.substring(0, 100)
    };

    // Log level basado en status code
    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request error', logData);
    } else {
      logger.http('Request completed', logData);
    }
  });

  next();
};

// Helper functions para diferentes tipos de logs
export const logInfo = (message, meta = {}) => logger.info(message, meta);
export const logError = (message, meta = {}) => logger.error(message, meta);
export const logWarn = (message, meta = {}) => logger.warn(message, meta);
export const logDebug = (message, meta = {}) => logger.debug(message, meta);

// Log específico para seguridad
export const logSecurity = (event, details = {}) => {
  logger.warn(`SECURITY: ${event}`, {
    type: 'security',
    event,
    ...details
  });
};

// Log específico para base de datos
export const logDB = (operation, details = {}) => {
  logger.info(`DB: ${operation}`, {
    type: 'database',
    operation,
    ...details
  });
};

// Log específico para uploads
export const logUpload = (action, details = {}) => {
  logger.info(`UPLOAD: ${action}`, {
    type: 'upload',
    action,
    ...details
  });
};

export default logger;
