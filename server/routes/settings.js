import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, requireAdmin } from './auth.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_FILE = path.join(__dirname, '..', 'data', 'settings.json');

function readSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      return { editorVideoUrl: '' };
    }
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  } catch {
    return { editorVideoUrl: '' };
  }
}

function writeSettings(data) {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
}

// GET /api/settings/editor-video - Público
router.get('/editor-video', (_req, res) => {
  const settings = readSettings();
  res.json({ editorVideoUrl: settings.editorVideoUrl || '' });
});

// PUT /api/settings/editor-video - Solo admin
router.put('/editor-video', verifyToken, requireAdmin, (req, res) => {
  const { editorVideoUrl } = req.body;
  if (typeof editorVideoUrl !== 'string') {
    return res.status(400).json({ error: 'URL inválida' });
  }
  const settings = readSettings();
  settings.editorVideoUrl = editorVideoUrl.trim();
  writeSettings(settings);
  res.json({ success: true, editorVideoUrl: settings.editorVideoUrl });
});

export default router;
