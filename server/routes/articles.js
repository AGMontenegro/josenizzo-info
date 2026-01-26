import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import db from '../config/database.js';
import socialMediaService from '../services/socialMediaService.js';
import { validateArticleContent, logSecurityEvent } from '../middleware/security.js';

const router = express.Router();

// Middleware to handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
  }
  next();
};

// GET /api/articles - Obtener todos los artículos (con paginación)
router.get('/',
  query('page').optional().isInt({ min: 1, max: 1000 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('category').optional().trim().escape(),
  query('search').optional().trim().escape().isLength({ max: 200 }),
  handleValidation,
  async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    let query = 'SELECT * FROM articles WHERE published = 1';
    let params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ? OR excerpt LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const articles = await db.allAsync(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM articles WHERE published = 1';
    let countParams = [];
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    if (search) {
      countQuery += ' AND (title LIKE ? OR content LIKE ? OR excerpt LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const { total } = await db.getAsync(countQuery, countParams);

    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    res.status(500).json({ error: 'Error al obtener artículos' });
  }
});

// GET /api/articles/featured - Artículos destacados
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const articles = await db.allAsync(
      `SELECT * FROM articles WHERE featured = 1 AND published = 1 ORDER BY created_at DESC LIMIT ${limit}`
    );
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener artículos destacados' });
  }
});

// GET /api/articles/breaking - Breaking news
router.get('/breaking', async (_req, res) => {
  try {
    const articles = await db.allAsync(
      'SELECT * FROM articles WHERE breaking = 1 AND published = 1 ORDER BY created_at DESC LIMIT 3'
    );
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener breaking news' });
  }
});

// GET /api/articles/trending - Artículos trending
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const articles = await db.allAsync(
      `SELECT * FROM articles WHERE published = 1 ORDER BY views DESC LIMIT ${limit}`
    );
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener artículos trending' });
  }
});

// GET /api/articles/:id - Obtener artículo por ID
router.get('/:id',
  param('id').isInt({ min: 1 }),
  handleValidation,
  async (req, res) => {
  try {
    const article = await db.getAsync('SELECT * FROM articles WHERE id = ?', [req.params.id]);

    if (!article) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    // Incrementar vistas
    await db.runAsync('UPDATE articles SET views = views + 1 WHERE id = ?', [req.params.id]);
    article.views += 1;

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener artículo' });
  }
});

// GET /api/articles/slug/:slug - Obtener artículo por slug
router.get('/slug/:slug',
  param('slug').matches(/^[a-z0-9-]+$/).isLength({ min: 1, max: 300 }),
  handleValidation,
  async (req, res) => {
  try {
    const article = await db.getAsync('SELECT * FROM articles WHERE slug = ?', [req.params.slug]);

    if (!article) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    // Incrementar vistas
    await db.runAsync('UPDATE articles SET views = views + 1 WHERE id = ?', [article.id]);
    article.views += 1;

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener artículo' });
  }
});

// POST /api/articles - Crear nuevo artículo (requiere autenticación)
router.post('/',
  body('title').trim().isLength({ min: 5, max: 300 }).withMessage('Título debe tener entre 5 y 300 caracteres'),
  body('slug').matches(/^[a-z0-9-]+$/).isLength({ min: 5, max: 300 }).withMessage('Slug inválido'),
  body('excerpt').optional().trim().isLength({ max: 500 }),
  body('content').isLength({ min: 10 }).custom((value) => {
    const validation = validateArticleContent(value);
    if (!validation.valid) throw new Error(validation.message);
    return true;
  }),
  body('image').optional().trim(),
  body('category').trim().isLength({ min: 1, max: 100 }),
  body('author_name').optional().trim().isLength({ max: 100 }),
  handleValidation,
  async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      image,
      category,
      author_name,
      featured,
      breaking,
      badge,
      read_time,
      published
    } = req.body;

    // Log article creation
    logSecurityEvent(req, 'ARTICLE_CREATE', { title, slug });

    // Verificar si el slug ya existe
    const existingSlug = await db.getAsync('SELECT id FROM articles WHERE slug = ?', [slug]);
    if (existingSlug) {
      return res.status(400).json({ error: 'Ya existe un artículo con ese slug. Por favor, modifica el título o el slug.' });
    }

    // Insertar artículo
    const result = await db.runAsync(
      `INSERT INTO articles (title, slug, excerpt, content, image, category, author_name, featured, breaking, badge, read_time, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, excerpt, content, image, category, author_name, featured ? 1 : 0, breaking ? 1 : 0, badge || null, read_time || 5, published ? 1 : 0]
    );

    // MySQL usa insertId, SQLite usa lastID
    const articleId = result.insertId || result.lastID;

    const article = await db.getAsync('SELECT * FROM articles WHERE id = ?', [articleId]);
    res.status(201).json(article);
  } catch (error) {
    console.error('Error al crear artículo:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ error: 'Ya existe un artículo con ese slug' });
    } else {
      res.status(500).json({ error: 'Error al crear artículo: ' + error.message });
    }
  }
});

// PUT /api/articles/:id - Actualizar artículo
router.put('/:id',
  param('id').isInt({ min: 1 }),
  body('title').trim().isLength({ min: 5, max: 300 }),
  body('excerpt').optional().trim().isLength({ max: 500 }),
  body('content').isLength({ min: 10 }).custom((value) => {
    const validation = validateArticleContent(value);
    if (!validation.valid) throw new Error(validation.message);
    return true;
  }),
  handleValidation,
  async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      image,
      category,
      featured,
      breaking,
      badge
    } = req.body;

    logSecurityEvent(req, 'ARTICLE_UPDATE', { id: req.params.id, title });

    await db.runAsync(
      `UPDATE articles
       SET title = ?, excerpt = ?, content = ?, image = ?, category = ?,
           featured = ?, breaking = ?, badge = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, excerpt, content, image, category, featured, breaking, badge, req.params.id]
    );

    const article = await db.getAsync('SELECT * FROM articles WHERE id = ?', [req.params.id]);
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar artículo' });
  }
});

// DELETE /api/articles/:id - Eliminar artículo
router.delete('/:id',
  param('id').isInt({ min: 1 }),
  handleValidation,
  async (req, res) => {
  try {
    logSecurityEvent(req, 'ARTICLE_DELETE', { id: req.params.id });
    await db.runAsync('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Artículo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar artículo' });
  }
});

// POST /api/articles/:id/share - Publicar artículo en redes sociales
router.post('/:id/share', async (req, res) => {
  try {
    const article = await db.getAsync('SELECT * FROM articles WHERE id = ?', [req.params.id]);

    if (!article) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    const results = await socialMediaService.publishToAll(article);

    res.json({
      message: 'Publicación en redes sociales procesada',
      results
    });
  } catch (error) {
    console.error('Error al publicar en redes sociales:', error);
    res.status(500).json({ error: 'Error al publicar en redes sociales' });
  }
});

export default router;
