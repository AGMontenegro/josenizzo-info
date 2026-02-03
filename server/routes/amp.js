import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// GET /amp/articulo/:slug - Genera página AMP para un artículo
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Validar slug
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).send('Slug inválido');
    }

    const article = await db.getAsync(
      'SELECT * FROM articles WHERE slug = ? AND published = 1',
      [slug]
    );

    if (!article) {
      return res.status(404).send('Artículo no encontrado');
    }

    const siteUrl = 'https://josenizzo.info';
    const canonicalUrl = `${siteUrl}/articulo/${article.slug}`;
    const date = article.date || article.created_at;
    const author = article.author_name || 'Redacción josenizzo.info';
    const image = article.image || `${siteUrl}/logos/josenizzo-og.png`;
    const category = article.category || 'Noticias';

    // Limpiar HTML del contenido para AMP (remover scripts, estilos inline, atributos prohibidos)
    let ampContent = (article.content || '')
      // Reemplazar <img> por <amp-img>
      .replace(/<img([^>]*)>/gi, (match, attrs) => {
        const srcMatch = attrs.match(/src=["']([^"']+)["']/);
        const altMatch = attrs.match(/alt=["']([^"']+)["']/);
        const src = srcMatch ? srcMatch[1] : '';
        const alt = altMatch ? altMatch[1] : article.title;
        if (!src) return '';
        return `<amp-img src="${src}" alt="${alt}" width="800" height="450" layout="responsive"></amp-img>`;
      })
      // Reemplazar <video> por <amp-video>
      .replace(/<video([^>]*)>[\s\S]*?<\/video>/gi, (match, attrs) => {
        const srcMatch = attrs.match(/src=["']([^"']+)["']/);
        if (!srcMatch) return '';
        return `<amp-video src="${srcMatch[1]}" width="800" height="450" layout="responsive" controls></amp-video>`;
      })
      // Reemplazar iframes de YouTube por amp-youtube
      .replace(/<iframe[^>]*src=["'](?:https?:)?\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)[^"']*["'][^>]*>[\s\S]*?<\/iframe>/gi, (match, videoId) => {
        return `<amp-youtube data-videoid="${videoId}" width="800" height="450" layout="responsive"></amp-youtube>`;
      })
      // Remover iframes restantes (no soportados en AMP)
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      // Remover scripts
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      // Remover estilos inline
      .replace(/ style="[^"]*"/gi, '')
      // Remover atributos onclick y similares
      .replace(/ on\w+="[^"]*"/gi, '');

    // Generar JSON-LD
    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.excerpt || '',
      image: [image],
      datePublished: date,
      dateModified: article.updated_at || date,
      author: {
        '@type': 'Person',
        name: author
      },
      publisher: {
        '@type': 'Organization',
        name: 'josenizzo.info',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logos/josenizzo-logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl
      },
      articleSection: category
    });

    const ampHtml = `<!doctype html>
<html amp lang="es-AR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <link rel="canonical" href="${canonicalUrl}">
  <title>${escapeHtml(article.title)} | josenizzo.info</title>
  <meta name="description" content="${escapeHtml(article.excerpt || '')}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script type="application/ld+json">${jsonLd}</script>
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;animation:none}</style></noscript>
  <style amp-custom>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #1a1a1a; background: #fff; line-height: 1.6; }
    .header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 12px 16px; display: flex; align-items: center; justify-content: center; }
    .header a { color: #1a1a1a; text-decoration: none; font-size: 18px; font-weight: 700; }
    .container { max-width: 680px; margin: 0 auto; padding: 24px 16px; }
    .breadcrumb { font-size: 13px; color: #6b7280; margin-bottom: 16px; }
    .breadcrumb a { color: #2563eb; text-decoration: none; }
    .category { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #374151; margin-bottom: 12px; }
    h1 { font-family: 'Merriweather', Georgia, serif; font-size: 32px; line-height: 1.15; font-weight: 700; color: #111; margin-bottom: 16px; }
    .excerpt { font-size: 18px; color: #4b5563; line-height: 1.5; margin-bottom: 20px; font-family: 'Merriweather', Georgia, serif; }
    .meta { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6b7280; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; margin-bottom: 24px; }
    .meta strong { color: #111; }
    .hero-image { margin-bottom: 24px; }
    .content { font-family: 'Merriweather', Georgia, serif; font-size: 17px; line-height: 1.8; color: #374151; }
    .content p { margin-bottom: 20px; }
    .content h2 { font-size: 24px; font-weight: 700; color: #111; margin: 32px 0 16px; }
    .content h3 { font-size: 20px; font-weight: 700; color: #111; margin: 24px 0 12px; }
    .content a { color: #2563eb; text-decoration: none; }
    .content a:hover { text-decoration: underline; }
    .content ul, .content ol { margin: 16px 0; padding-left: 24px; }
    .content li { margin-bottom: 8px; }
    .content blockquote { border-left: 3px solid #2563eb; padding: 12px 20px; margin: 20px 0; background: #f9fafb; color: #4b5563; font-style: italic; }
    .content amp-img { margin: 24px 0; border-radius: 8px; overflow: hidden; }
    .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; }
    .footer a { display: inline-block; background: #1a1a1a; color: #fff; font-weight: 600; padding: 12px 32px; font-size: 14px; text-decoration: none; }
    .site-footer { background: #111; color: #9ca3af; text-align: center; padding: 24px 16px; margin-top: 40px; font-size: 13px; }
    .site-footer a { color: #9ca3af; text-decoration: none; }
  </style>
</head>
<body>
  <header class="header">
    <a href="${siteUrl}">josenizzo.info</a>
  </header>

  <main class="container">
    <nav class="breadcrumb">
      <a href="${siteUrl}">Inicio</a> / <a href="${siteUrl}/categoria/${category.toLowerCase()}">${escapeHtml(category)}</a>
    </nav>

    <div class="category">${escapeHtml(category)}</div>

    <h1>${escapeHtml(article.title)}</h1>

    ${article.excerpt ? `<p class="excerpt">${escapeHtml(article.excerpt)}</p>` : ''}

    <div class="meta">
      <strong>${escapeHtml(author)}</strong>
      <span>&middot;</span>
      <time datetime="${date}">${formatDate(date)}</time>
      ${article.read_time ? `<span>&middot;</span><span>${article.read_time} min de lectura</span>` : ''}
    </div>

    ${article.image ? `
    <div class="hero-image">
      <amp-img src="${article.image}" alt="${escapeHtml(article.title)}" width="800" height="450" layout="responsive"></amp-img>
    </div>
    ` : ''}

    <div class="content">
      ${ampContent}
    </div>

    <div class="footer">
      <a href="${canonicalUrl}">Ver artículo completo en josenizzo.info</a>
    </div>
  </main>

  <footer class="site-footer">
    <p>&copy; ${new Date().getFullYear()} <a href="${siteUrl}">josenizzo.info</a> - Todos los derechos reservados</p>
  </footer>
</body>
</html>`;

    res.set('Content-Type', 'text/html');
    res.send(ampHtml);
  } catch (error) {
    console.error('Error generando AMP:', error);
    res.status(500).send('Error interno del servidor');
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export default router;
