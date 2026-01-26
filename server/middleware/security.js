/**
 * Security Middleware for josenizzo.info
 * Comprehensive protection against common web attacks
 */

import { body, param, query, validationResult } from 'express-validator';
import crypto from 'crypto';

// ========== INPUT SANITIZATION ==========

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#x60;');
}

/**
 * Deep sanitize object properties
 */
export function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[sanitizeString(key)] = sanitizeObject(value);
  }
  return sanitized;
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    // Don't sanitize HTML content for articles (but do validate it server-side)
    const skipFields = ['content']; // Article HTML content

    for (const [key, value] of Object.entries(req.body)) {
      if (!skipFields.includes(key)) {
        req.body[key] = sanitizeObject(value);
      }
    }
  }
  next();
}

// ========== SQL INJECTION PROTECTION ==========

/**
 * Validate that a string doesn't contain SQL injection patterns
 */
export function isSqlSafe(str) {
  if (typeof str !== 'string') return true;

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
    /(--)/,
    /(;.*--)/,
    /(\bOR\b\s+\d+\s*=\s*\d+)/i,
    /(\bAND\b\s+\d+\s*=\s*\d+)/i,
    /(\bOR\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
    /('.*--)/,
    /(\/\*.*\*\/)/,
  ];

  return !sqlPatterns.some(pattern => pattern.test(str));
}

/**
 * Middleware to check for SQL injection attempts
 */
export function sqlInjectionCheck(req, res, next) {
  const checkValue = (value, path) => {
    if (typeof value === 'string' && !isSqlSafe(value)) {
      console.warn(`🚨 SQL Injection attempt detected from ${req.ip}: ${path}`);
      return false;
    }
    if (typeof value === 'object' && value !== null) {
      for (const [key, val] of Object.entries(value)) {
        if (!checkValue(val, `${path}.${key}`)) return false;
      }
    }
    return true;
  };

  const allParams = { ...req.query, ...req.params, ...req.body };

  if (!checkValue(allParams, 'request')) {
    logSecurityEvent(req, 'SQL_INJECTION_ATTEMPT');
    return res.status(400).json({ error: 'Solicitud inválida' });
  }

  next();
}

// ========== XSS PROTECTION ==========

/**
 * Remove dangerous HTML tags but allow safe content for articles
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string') return html;

  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, 'data-blocked:')
    .replace(/<iframe(?!.*(?:youtube\.com|platform\.twitter\.com))[^>]*>/gi, '');
}

/**
 * Validate article content for XSS
 */
export function validateArticleContent(content) {
  if (typeof content !== 'string') return { valid: false, message: 'Contenido inválido' };

  // Check for dangerous patterns
  const dangerous = [
    /<script/i,
    /javascript:/i,
    /on(click|load|error|mouse|key)/i,
    /document\.(cookie|write)/i,
    /window\.(location|open)/i,
    /eval\s*\(/i,
    /new\s+Function/i,
  ];

  for (const pattern of dangerous) {
    if (pattern.test(content)) {
      return { valid: false, message: 'Contenido potencialmente peligroso detectado' };
    }
  }

  return { valid: true };
}

// ========== RATE LIMITING ENHANCED ==========

const requestCounts = new Map();
const blockedIPs = new Map();

/**
 * Check if IP is blocked
 */
export function isIPBlocked(ip) {
  const blocked = blockedIPs.get(ip);
  if (blocked && Date.now() < blocked.until) {
    return true;
  }
  blockedIPs.delete(ip);
  return false;
}

/**
 * Block an IP temporarily
 */
export function blockIP(ip, minutes = 60) {
  blockedIPs.set(ip, {
    until: Date.now() + (minutes * 60 * 1000),
    blockedAt: new Date().toISOString()
  });
  console.warn(`🚫 IP bloqueada: ${ip} por ${minutes} minutos`);
}

/**
 * Track suspicious behavior
 */
export function trackSuspiciousActivity(ip) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxSuspicious = 10;

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip);
  requests.push(now);

  // Clean old entries
  const filtered = requests.filter(time => now - time < windowMs);
  requestCounts.set(ip, filtered);

  if (filtered.length > maxSuspicious) {
    blockIP(ip, 60);
    return true;
  }

  return false;
}

/**
 * Middleware to check blocked IPs
 */
export function checkBlockedIP(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';

  if (isIPBlocked(ip)) {
    logSecurityEvent(req, 'BLOCKED_IP_ACCESS');
    return res.status(403).json({ error: 'Acceso denegado temporalmente' });
  }

  next();
}

// ========== SECURITY HEADERS ==========

/**
 * Additional security headers middleware
 */
export function securityHeaders(_req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Remove server identification
  res.removeHeader('X-Powered-By');

  next();
}

// ========== REQUEST VALIDATION ==========

/**
 * Handle validation errors
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logSecurityEvent(req, 'VALIDATION_ERROR', errors.array());
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: process.env.NODE_ENV === 'development' ? errors.array() : undefined
    });
  }
  next();
}

/**
 * Common validation rules
 */
export const validators = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),

  password: body('password')
    .isLength({ min: 12 })
    .withMessage('La contraseña debe tener al menos 12 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe incluir mayúsculas')
    .matches(/[a-z]/)
    .withMessage('La contraseña debe incluir minúsculas')
    .matches(/\d/)
    .withMessage('La contraseña debe incluir números')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('La contraseña debe incluir caracteres especiales'),

  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID inválido'),

  slug: param('slug')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug inválido')
    .isLength({ max: 200 })
    .withMessage('Slug demasiado largo'),

  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido'),
  ],

  articleTitle: body('title')
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage('El título debe tener entre 5 y 300 caracteres'),

  articleContent: body('content')
    .isLength({ min: 50 })
    .withMessage('El contenido debe tener al menos 50 caracteres')
    .custom((value) => {
      const validation = validateArticleContent(value);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      return true;
    }),
};

// ========== SECURITY LOGGING ==========

const securityLogs = [];
const MAX_LOGS = 1000;

/**
 * Log security events
 */
export function logSecurityEvent(req, eventType, details = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    ip: req.ip || req.socket?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'],
    path: req.path,
    method: req.method,
    userId: req.user?.id || null,
    details: details ? JSON.stringify(details).substring(0, 500) : null
  };

  securityLogs.push(logEntry);

  // Keep only recent logs in memory
  if (securityLogs.length > MAX_LOGS) {
    securityLogs.shift();
  }

  // Log to console for serious events
  const seriousEvents = ['SQL_INJECTION_ATTEMPT', 'BLOCKED_IP_ACCESS', 'AUTH_FAILURE', 'UNAUTHORIZED_ACCESS'];
  if (seriousEvents.includes(eventType)) {
    console.warn(`🚨 SECURITY EVENT: ${eventType}`, logEntry);
  }
}

/**
 * Get recent security logs (admin only)
 */
export function getSecurityLogs(limit = 100) {
  return securityLogs.slice(-limit);
}

// ========== FILE UPLOAD SECURITY ==========

/**
 * Validate file magic bytes (not just extension)
 */
export function validateFileMagicBytes(buffer, expectedType) {
  const magicBytes = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    gif: [0x47, 0x49, 0x46],
    webp: [0x52, 0x49, 0x46, 0x46], // RIFF header
    pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
    mp4: [0x00, 0x00, 0x00], // ftyp follows
  };

  const expected = magicBytes[expectedType];
  if (!expected) return true; // Unknown type, allow

  const bufferStart = Array.from(buffer.slice(0, expected.length));
  return expected.every((byte, index) => bufferStart[index] === byte);
}

/**
 * Scan file for malicious content
 */
export function scanFileForMalware(buffer, filename) {
  const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1000));

  const malwarePatterns = [
    /<\?php/i,
    /<%.*%>/,
    /<script/i,
    /eval\s*\(/i,
    /exec\s*\(/i,
    /system\s*\(/i,
    /shell_exec/i,
    /passthru/i,
    /base64_decode/i,
  ];

  for (const pattern of malwarePatterns) {
    if (pattern.test(content)) {
      console.warn(`🚨 Malware detectado en archivo: ${filename}`);
      return { safe: false, reason: 'Contenido malicioso detectado' };
    }
  }

  return { safe: true };
}

// ========== AUTHENTICATION SECURITY ==========

/**
 * Generate secure token
 */
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data
 */
export function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Constant-time string comparison (prevent timing attacks)
 */
export function secureCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// ========== EXPORT COMBINED MIDDLEWARE ==========

/**
 * Apply all security middleware
 */
export function applySecurityMiddleware(app) {
  app.use(checkBlockedIP);
  app.use(securityHeaders);
  app.use(sqlInjectionCheck);
  // sanitizeBody is applied selectively to non-article routes
}
