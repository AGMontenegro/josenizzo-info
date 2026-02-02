/**
 * Open Graph Middleware
 * Inyecta meta tags de Open Graph en el HTML para crawlers de redes sociales.
 * Esto permite que WhatsApp, Facebook, Twitter, etc. muestren miniatura,
 * título y descripción al compartir un link de artículo.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://josenizzo.info';
const SITE_NAME = 'josenizzo.info';
const DEFAULT_IMAGE = `${SITE_URL}/vite.svg`;
const DEFAULT_DESCRIPTION = 'Noticias de última hora, análisis y cobertura en profundidad de política, economía, deportes y más.';

// User agents de crawlers de redes sociales
const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'WhatsApp',
  'LinkedInBot',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Googlebot',
  'bingbot',
  'Embedly',
  'Quora Link Preview',
  'Showyoubot',
  'outbrain',
  'pinterest',
  'vkShare',
  'W3C_Validator',
];

/**
 * Detecta si el request viene de un crawler de redes sociales
 */
function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some(bot => ua.includes(bot.toLowerCase()));
}

/**
 * Escapa caracteres HTML en atributos
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Genera las meta tags de Open Graph para un artículo
 */
function generateArticleOGTags(article) {
  const title = escapeHtml(article.title);
  const description = escapeHtml(article.excerpt || article.title);
  const image = article.image
    ? (article.image.startsWith('http') ? article.image : `${SITE_URL}${article.image}`)
    : DEFAULT_IMAGE;
  const url = `${SITE_URL}/articulo/${article.slug}`;
  const publishedTime = article.created_at || '';
  const author = escapeHtml(article.author_name || SITE_NAME);

  return `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="es_AR" />
    <meta property="article:published_time" content="${publishedTime}" />
    <meta property="article:author" content="${author}" />
    <meta property="article:section" content="${escapeHtml(article.category || '')}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
  `;
}

/**
 * Genera las meta tags de Open Graph para la página principal
 */
function generateDefaultOGTags(reqPath) {
  const url = `${SITE_URL}${reqPath || '/'}`;

  return `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${SITE_NAME} - El diario de la Patria" />
    <meta property="og:description" content="${DEFAULT_DESCRIPTION}" />
    <meta property="og:image" content="${DEFAULT_IMAGE}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="es_AR" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${SITE_NAME} - El diario de la Patria" />
    <meta name="twitter:description" content="${DEFAULT_DESCRIPTION}" />
    <meta name="twitter:image" content="${DEFAULT_IMAGE}" />
  `;
}

// Cache del template HTML
let htmlTemplate = null;

function getHtmlTemplate() {
  if (!htmlTemplate) {
    const htmlPath = path.join(__dirname, '..', '..', 'dist', 'index.html');
    htmlTemplate = fs.readFileSync(htmlPath, 'utf-8');
  }
  return htmlTemplate;
}

/**
 * Middleware principal: inyecta OG tags para crawlers
 */
export async function openGraphMiddleware(req, res, next) {
  const userAgent = req.headers['user-agent'] || '';

  // Solo procesar para crawlers
  if (!isCrawler(userAgent)) {
    return next();
  }

  try {
    let ogTags = '';
    let pageTitle = `${SITE_NAME} - El diario de la Patria`;

    // Detectar si es una URL de artículo: /articulo/:slug
    const articleMatch = req.path.match(/^\/articulo\/([a-z0-9-]+)$/);

    if (articleMatch) {
      const slug = articleMatch[1];
      const article = await db.getAsync('SELECT * FROM articles WHERE slug = ?', [slug]);

      if (article) {
        ogTags = generateArticleOGTags(article);
        pageTitle = `${article.title} - ${SITE_NAME}`;
      } else {
        ogTags = generateDefaultOGTags(req.path);
      }
    } else {
      ogTags = generateDefaultOGTags(req.path);
    }

    // Inyectar las meta tags en el HTML
    let html = getHtmlTemplate();
    html = html.replace('<title>josenizzo.info - El diario de la Patria</title>', `<title>${escapeHtml(pageTitle)}</title>`);
    html = html.replace('</head>', `${ogTags}\n  </head>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (error) {
    console.error('Error en Open Graph middleware:', error);
    return next();
  }
}

/**
 * Invalida el cache del template HTML (llamar después de hacer build)
 */
export function invalidateHtmlTemplate() {
  htmlTemplate = null;
}
