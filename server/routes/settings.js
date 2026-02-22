import express from 'express';
import db from '../config/database.js';
import { verifyToken, requireAdmin } from './auth.js';

const router = express.Router();

async function ensureTable() {
  try {
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key_name VARCHAR(100) PRIMARY KEY,
        value VARCHAR(2000) NOT NULL DEFAULT '',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('Error creando tabla site_settings:', err.message);
  }
}
ensureTable();

// GET /api/settings/editor-video - Público
router.get('/editor-video', async (_req, res) => {
  try {
    const row = await db.getAsync(
      'SELECT value FROM site_settings WHERE key_name = ?',
      ['editor_video_url']
    );
    res.set('Cache-Control', 'no-store');
    res.json({ editorVideoUrl: row?.value || '' });
  } catch (err) {
    console.error('Error leyendo setting:', err.message);
    res.json({ editorVideoUrl: '' });
  }
});

// PUT /api/settings/editor-video - Solo admin
router.put('/editor-video', verifyToken, requireAdmin, async (req, res) => {
  const { editorVideoUrl } = req.body;
  if (typeof editorVideoUrl !== 'string') {
    return res.status(400).json({ error: 'URL inválida' });
  }
  try {
    await ensureTable();
    await db.runAsync(
      `INSERT INTO site_settings (key_name, value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value)`,
      ['editor_video_url', editorVideoUrl.trim()]
    );
    res.json({ success: true, editorVideoUrl: editorVideoUrl.trim() });
  } catch (err) {
    console.error('Error guardando setting:', err.message);
    res.status(500).json({ error: 'Error al guardar: ' + err.message });
  }
});

export default router;
