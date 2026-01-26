import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// GET /sitemap.xml - Sitemap dinámico para SEO
router.get('/', async (_req, res) => {
  try {
    const siteUrl = 'https://josenizzo.info';

    // Obtener todos los artículos publicados
    const articles = await db.allAsync(
      'SELECT slug, updated_at, created_at, category FROM articles WHERE published = 1 ORDER BY created_at DESC'
    );

    // Obtener categorías únicas
    const categories = await db.allAsync(
      'SELECT DISTINCT category FROM articles WHERE published = 1 AND category IS NOT NULL'
    );

    // Generar XML del sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    // Página principal
    xml += `  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>\n`;

    // Páginas estáticas
    const staticPages = [
      { path: '/contacto', priority: '0.5', changefreq: 'monthly' },
      { path: '/privacidad', priority: '0.3', changefreq: 'yearly' },
      { path: '/terminos', priority: '0.3', changefreq: 'yearly' }
    ];

    for (const page of staticPages) {
      xml += `  <url>
    <loc>${siteUrl}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
    }

    // Páginas de categorías
    for (const cat of categories) {
      if (cat.category) {
        xml += `  <url>
    <loc>${siteUrl}/categoria/${cat.category.toLowerCase()}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
      }
    }

    // Artículos
    for (const article of articles) {
      const lastmod = article.updated_at || article.created_at;
      const formattedDate = new Date(lastmod).toISOString().split('T')[0];

      // Determinar prioridad basada en antigüedad
      const articleDate = new Date(article.created_at);
      const daysSincePublished = (Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24);
      let priority = '0.6';
      if (daysSincePublished < 1) priority = '0.9';
      else if (daysSincePublished < 7) priority = '0.8';
      else if (daysSincePublished < 30) priority = '0.7';

      xml += `  <url>
    <loc>${siteUrl}/articulo/${article.slug}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>\n`;
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache 1 hora
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// GET /robots.txt - Robots.txt dinámico
router.get('/robots', (_req, res) => {
  const siteUrl = 'https://josenizzo.info';

  const robotsTxt = `# josenizzo.info - Robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Bloquear admin
Disallow: /admin/
Disallow: /api/

# Permitir crawlers de noticias
User-agent: Googlebot-News
Allow: /

User-agent: Googlebot
Allow: /
Crawl-delay: 1
`;

  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

// GET /news-sitemap.xml - Sitemap específico para Google News (últimas 48hs)
router.get('/news', async (_req, res) => {
  try {
    const siteUrl = 'https://josenizzo.info';

    // Google News solo indexa artículos de las últimas 48 horas
    const articles = await db.allAsync(
      `SELECT slug, title, created_at, category
       FROM articles
       WHERE published = 1
         AND created_at >= datetime('now', '-2 days')
       ORDER BY created_at DESC
       LIMIT 1000`
    );

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

    for (const article of articles) {
      const pubDate = new Date(article.created_at).toISOString();

      xml += `  <url>
    <loc>${siteUrl}/articulo/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>josenizzo.info</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>
    </news:news>
  </url>\n`;
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=900'); // Cache 15 minutos
    res.send(xml);
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    res.status(500).send('Error generating news sitemap');
  }
});

export default router;
