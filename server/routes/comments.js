import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// GET /api/comments/:articleId - Obtener comentarios de un artículo
router.get('/:articleId', async (req, res) => {
  try {
    const comments = await db.allAsync(
      `SELECT c.*, u.name as user_name, u.email as user_email
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.article_id = ? AND c.approved = 1
       ORDER BY c.created_at DESC`,
      [req.params.articleId]
    );

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

// POST /api/comments - Crear nuevo comentario
router.post('/', async (req, res) => {
  try {
    const { article_id, user_id, content } = req.body;

    if (!article_id || !user_id || !content) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const result = await db.runAsync(
      'INSERT INTO comments (article_id, user_id, content) VALUES (?, ?, ?)',
      [article_id, user_id, content]
    );

    const comment = await db.getAsync(
      `SELECT c.*, u.name as user_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      message: 'Comentario enviado. Pendiente de aprobación.',
      comment
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: 'Error al crear comentario' });
  }
});

// PUT /api/comments/:id/approve - Aprobar comentario (admin)
router.put('/:id/approve', async (req, res) => {
  try {
    await db.runAsync('UPDATE comments SET approved = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Comentario aprobado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al aprobar comentario' });
  }
});

// DELETE /api/comments/:id - Eliminar comentario
router.delete('/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Comentario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar comentario' });
  }
});

export default router;
