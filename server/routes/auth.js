import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const router = express.Router();

// JWT_SECRET debe estar configurado en producción
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('⚠️ ADVERTENCIA: JWT_SECRET no configurado en producción!');
}
const SECRET = JWT_SECRET || 'dev-secret-change-in-production';

// Middleware para verificar token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar rol admin
const requireAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validar datos
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el email ya existe
    const existingUser = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await db.runAsync(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    // Generar token
    const token = jwt.sign(
      { id: result.lastID, email, role: 'reader' },
      SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: result.lastID,
        email,
        name,
        role: 'reader'
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: '24h' } // Reducido a 24h por seguridad
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// GET /api/auth/me - Obtener usuario actual
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await db.getAsync(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// PUT /api/auth/change-password - Cambiar contraseña
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validar datos
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    // Validar longitud mínima
    if (newPassword.length < 12) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 12 caracteres' });
    }

    // Validar complejidad
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return res.status(400).json({
        error: 'La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales'
      });
    }

    // Obtener usuario actual
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hash de la nueva contraseña con salt más alto
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña
    await db.runAsync(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    console.log(`🔐 Contraseña cambiada para usuario: ${user.email}`);
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
});

// POST /api/auth/logout - Invalidar sesión (para tracking)
router.post('/logout', verifyToken, (req, res) => {
  // En JWT stateless no podemos invalidar el token,
  // pero registramos el logout para auditoría
  console.log(`👋 Logout: ${req.user.email}`);
  res.json({ message: 'Sesión cerrada' });
});

export default router;
