import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// GET /api/articles - Obtener todos los artículos (con paginación)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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
router.get('/breaking', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.get('/slug/:slug', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Artículo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar artículo' });
  }
});

export default router;
