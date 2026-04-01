import db from '../config/database.js';

const SITE_URL = 'https://josenizzo.info';

// GET /sitemap.xml
export async function handleSitemap(_req, res) {
  try {
    const articles = await db.allAsync(
      'SELECT slug, updated_at, created_at, category FROM articles WHERE published = 1 ORDER BY created_at DESC LIMIT 500'
    );
    const categories = await db.allAsync(
      'SELECT DISTINCT category FROM articles WHERE published = 1 AND category IS NOT NULL'
    );

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    xml += `  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>\n`;

    const staticPages = [
      { path: '/contacto', priority: '0.5', changefreq: 'monthly' },
      { path: '/privacidad', priority: '0.3', changefreq: 'yearly' },
      { path: '/terminos', priority: '0.3', changefreq: 'yearly' }
    ];

    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
    }

    for (const cat of categories) {
      if (cat.category) {
        xml += `  <url>
    <loc>${SITE_URL}/categoria/${cat.category.toLowerCase()}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
      }
    }

    for (const article of articles) {
      const lastmod = article.updated_at || article.created_at;
      const formattedDate = new Date(lastmod).toISOString().split('T')[0];
      const articleDate = new Date(article.created_at);
      const daysSincePublished = (Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24);
      let priority = '0.6';
      if (daysSincePublished < 1) priority = '0.9';
      else if (daysSincePublished < 7) priority = '0.8';
      else if (daysSincePublished < 30) priority = '0.7';

      xml += `  <url>
    <loc>${SITE_URL}/articulo/${article.slug}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>\n`;
    }

    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

// GET /news-sitemap.xml
export async function handleNewsSitemap(_req, res) {
  try {
    const articles = await db.allAsync(
      `SELECT slug, title, created_at, category
       FROM articles
       WHERE published = 1
         AND created_at >= DATE_SUB(NOW(), INTERVAL 2 DAY)
       ORDER BY created_at DESC
       LIMIT 1000`
    ).catch(() =>
      db.allAsync(
        `SELECT slug, title, created_at, category
         FROM articles
         WHERE published = 1
           AND created_at >= datetime('now', '-2 days')
         ORDER BY created_at DESC
         LIMIT 1000`
      )
    );

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

    for (const article of articles) {
      const pubDate = new Date(article.created_at).toISOString();
      xml += `  <url>
    <loc>${SITE_URL}/articulo/${article.slug}</loc>
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
    res.header('Cache-Control', 'public, max-age=900');
    res.send(xml);
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    res.status(500).send('Error generating news sitemap');
  }
}

// GET /robots.txt
export function handleRobots(_req, res) {
  const robotsTxt = `# josenizzo.info - Robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/news-sitemap.xml

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
}

// GET /feed.xml
export async function handleFeed(_req, res) {
  try {
    const articles = await db.allAsync(
      `SELECT slug, title, excerpt, category, created_at, image
       FROM articles
       WHERE published = 1
       ORDER BY created_at DESC
       LIMIT 50`
    );

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n';
    xml += '  <channel>\n';
    xml += `    <title>josenizzo.info</title>\n`;
    xml += `    <link>${SITE_URL}</link>\n`;
    xml += `    <description>Noticias de última hora, análisis y cobertura en profundidad de política, economía, deportes y más.</description>\n`;
    xml += `    <language>es-ar</language>\n`;
    xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
    xml += `    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />\n`;

    for (const article of articles) {
      const pubDate = new Date(article.created_at).toUTCString();
      const link = `${SITE_URL}/articulo/${article.slug}`;
      const title = article.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const description = (article.excerpt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      xml += '    <item>\n';
      xml += `      <title>${title}</title>\n`;
      xml += `      <link>${link}</link>\n`;
      xml += `      <guid isPermaLink="true">${link}</guid>\n`;
      xml += `      <pubDate>${pubDate}</pubDate>\n`;
      xml += `      <description>${description}</description>\n`;
      if (article.category) xml += `      <category>${article.category}</category>\n`;
      if (article.image) {
        const imageUrl = article.image.startsWith('http') ? article.image : `${SITE_URL}${article.image}`;
        xml += `      <media:content url="${imageUrl}" medium="image" />\n`;
      }
      xml += '    </item>\n';
    }

    xml += '  </channel>\n';
    xml += '</rss>';
    res.header('Content-Type', 'application/rss+xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=1800');
    res.send(xml);
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    res.status(500).send('Error generating RSS feed');
  }
}
