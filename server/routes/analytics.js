import express from 'express';
import db from '../config/database.js';
import { verifyToken, requireAdmin } from './auth.js';

const router = express.Router();

// POST /api/analytics/track - Registrar pageview
router.post('/track', async (req, res) => {
  try {
    const { path, referrer, article_id, duration } = req.body;
    if (!path) return res.status(400).json({ error: 'Path requerido' });

    const ip = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.get('User-Agent') || '';

    await db.runAsync(
      'INSERT INTO page_views (path, referrer, article_id, ip_hash, user_agent, duration) VALUES (?, ?, ?, ?, ?, ?)',
      [
        path.substring(0, 500),
        (referrer || '').substring(0, 500),
        article_id || null,
        simpleHash(ip),
        userAgent.substring(0, 300),
        duration || 0
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    res.status(500).json({ error: 'Error al registrar' });
  }
});

// GET /api/analytics/stats - Dashboard de analytics (admin)
router.get('/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    // Vistas totales y únicas (por día)
    const dailyViews = await db.allAsync(
      `SELECT DATE(created_at) as date, COUNT(*) as views, COUNT(DISTINCT ip_hash) as unique_visitors
       FROM page_views
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [days]
    ).catch(() =>
      // SQLite fallback
      db.allAsync(
        `SELECT DATE(created_at) as date, COUNT(*) as views, COUNT(DISTINCT ip_hash) as unique_visitors
         FROM page_views
         WHERE created_at >= datetime('now', '-${days} days')
         GROUP BY DATE(created_at)
         ORDER BY date DESC`
      )
    );

    // Páginas más vistas
    const topPages = await db.allAsync(
      `SELECT path, COUNT(*) as views
       FROM page_views
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY path
       ORDER BY views DESC
       LIMIT 20`,
      [days]
    ).catch(() =>
      db.allAsync(
        `SELECT path, COUNT(*) as views
         FROM page_views
         WHERE created_at >= datetime('now', '-${days} days')
         GROUP BY path
         ORDER BY views DESC
         LIMIT 20`
      )
    );

    // Artículos más vistos
    const topArticles = await db.allAsync(
      `SELECT pv.article_id, a.title, a.slug, COUNT(*) as views
       FROM page_views pv
       JOIN articles a ON pv.article_id = a.id
       WHERE pv.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND pv.article_id IS NOT NULL
       GROUP BY pv.article_id
       ORDER BY views DESC
       LIMIT 10`,
      [days]
    ).catch(() =>
      db.allAsync(
        `SELECT pv.article_id, a.title, a.slug, COUNT(*) as views
         FROM page_views pv
         JOIN articles a ON pv.article_id = a.id
         WHERE pv.created_at >= datetime('now', '-${days} days') AND pv.article_id IS NOT NULL
         GROUP BY pv.article_id
         ORDER BY views DESC
         LIMIT 10`
      )
    );

    // Referrers principales
    const topReferrers = await db.allAsync(
      `SELECT referrer, COUNT(*) as visits
       FROM page_views
       WHERE referrer != '' AND referrer IS NOT NULL AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY referrer
       ORDER BY visits DESC
       LIMIT 10`,
      [days]
    ).catch(() =>
      db.allAsync(
        `SELECT referrer, COUNT(*) as visits
         FROM page_views
         WHERE referrer != '' AND referrer IS NOT NULL AND created_at >= datetime('now', '-${days} days')
         GROUP BY referrer
         ORDER BY visits DESC
         LIMIT 10`
      )
    );

    // Total resumen
    const summary = await db.getAsync(
      `SELECT COUNT(*) as total_views, COUNT(DISTINCT ip_hash) as unique_visitors
       FROM page_views
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    ).catch(() =>
      db.getAsync(
        `SELECT COUNT(*) as total_views, COUNT(DISTINCT ip_hash) as unique_visitors
         FROM page_views
         WHERE created_at >= datetime('now', '-${days} days')`
      )
    );

    res.json({
      period: `${days} days`,
      summary,
      dailyViews,
      topPages,
      topArticles,
      topReferrers
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export default router;
