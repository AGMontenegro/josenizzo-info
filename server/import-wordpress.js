import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Importar conexión a base de datos
import db from './config/database.js';

// Fecha mínima para importar (artículos posteriores a esta fecha)
const MIN_DATE = '2026-01-19';

// Función para parsear el XML de WordPress (sin dependencias externas)
function parseWordPressXML(xmlContent) {
  const articles = [];

  // Regex para extraer cada item (artículo)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlContent)) !== null) {
    const itemContent = match[1];

    // Extraer campos del artículo
    const title = extractCDATA(itemContent, 'title');
    const content = extractCDATA(itemContent, 'content:encoded');
    const excerpt = extractCDATA(itemContent, 'excerpt:encoded');
    const postDate = extractCDATA(itemContent, 'wp:post_date');
    const postName = extractCDATA(itemContent, 'wp:post_name');
    const status = extractCDATA(itemContent, 'wp:status');
    const postType = extractTag(itemContent, 'wp:post_type');

    // Solo importar posts publicados
    if (status !== 'publish' || postType !== 'post') {
      continue;
    }

    // Verificar fecha mínima
    if (postDate < MIN_DATE) {
      continue;
    }

    // Extraer imagen destacada (thumbnail)
    let image = '';
    const thumbnailMatch = itemContent.match(/<wp:postmeta>[\s\S]*?<wp:meta_key><!\[CDATA\[_thumbnail_id\]\]><\/wp:meta_key>[\s\S]*?<wp:meta_value><!\[CDATA\[(\d+)\]\]><\/wp:meta_value>[\s\S]*?<\/wp:postmeta>/);

    // Buscar imagen en el contenido si no hay thumbnail
    // Saltar fotos de autor (firmas pequeñas)
    if (!image && content) {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let imgMatch;
      while ((imgMatch = imgRegex.exec(content)) !== null) {
        const imgUrl = imgMatch[1];
        // Saltar fotos de autor (Analía Montenegro o José Nizzo)
        if (imgUrl.includes('Analia_photo') || imgUrl.includes('José_Nizzo') || imgUrl.includes('Jose_Nizzo')) {
          continue;
        }
        image = imgUrl;
        break;
      }
    }

    // Extraer categoría
    let category = 'Sociedad'; // Default
    const categoryMatch = itemContent.match(/<category domain="category"[^>]*><!\[CDATA\[([^\]]+)\]\]><\/category>/);
    if (categoryMatch) {
      category = categoryMatch[1];
    }

    // Determinar autor
    const creator = extractCDATA(itemContent, 'dc:creator');
    let authorName = 'José Nizzo';
    if (creator && creator.toLowerCase().includes('analia')) {
      authorName = 'Analía Montenegro';
    }

    // Calcular tiempo de lectura
    const wordCount = content ? content.split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    articles.push({
      title: title || '',
      slug: postName || '',
      excerpt: excerpt || '',
      content: content || '',
      image: image,
      category: category,
      author_name: authorName,
      featured: 0,
      breaking: 0,
      badge: '',
      read_time: readTime,
      views: 0,
      published: 1,
      created_at: postDate
    });
  }

  return articles;
}

function extractCDATA(content, tagName) {
  const regex = new RegExp(`<${tagName}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`);
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function extractTag(content, tagName) {
  const regex = new RegExp(`<${tagName}><!\\[CDATA\\[([^\\]]+)\\]\\]><\\/${tagName}>`);
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

// Función para limpiar HTML de WordPress
function cleanWordPressContent(content) {
  if (!content) return '';

  let cleaned = content;

  // 1. Remover comentarios de WordPress blocks
  cleaned = cleaned.replace(/<!-- \/?wp:[^>]+ -->/g, '');

  // 2. Limpiar múltiples saltos de línea consecutivos
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

  return cleaned;
}

async function importArticles() {
  const xmlPath = process.argv[2] || 'C:\\Users\\admin\\Downloads\\josenizzoinfo.WordPress.2026-01-22.xml';

  console.log(`\n📖 Leyendo archivo: ${xmlPath}`);

  if (!fs.existsSync(xmlPath)) {
    console.error('❌ Archivo no encontrado:', xmlPath);
    process.exit(1);
  }

  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
  console.log(`📄 Archivo leído: ${(xmlContent.length / 1024).toFixed(2)} KB`);

  console.log(`\n🔍 Parseando artículos (fecha >= ${MIN_DATE})...`);
  const articles = parseWordPressXML(xmlContent);
  console.log(`📰 Artículos encontrados: ${articles.length}`);

  if (articles.length === 0) {
    console.log('⚠️  No hay artículos nuevos para importar.');
    process.exit(0);
  }

  console.log('\n📝 Artículos a importar:');
  articles.forEach((a, i) => {
    console.log(`   ${i + 1}. [${a.created_at}] ${a.title.substring(0, 60)}...`);
  });

  console.log('\n🔄 Importando a la base de datos...\n');

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const article of articles) {
    try {
      // Verificar si ya existe por slug
      const existing = await db.getAsync(
        'SELECT id FROM articles WHERE slug = ?',
        [article.slug]
      );

      if (existing) {
        console.log(`⏭️  Ya existe: ${article.title.substring(0, 50)}...`);
        skipped++;
        continue;
      }

      // Limpiar contenido
      const cleanedContent = cleanWordPressContent(article.content);

      // Insertar artículo
      await db.runAsync(
        `INSERT INTO articles (
          title, slug, excerpt, content, image, category, author_name,
          featured, breaking, badge, read_time, views, published, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          article.title,
          article.slug,
          article.excerpt,
          cleanedContent,
          article.image,
          article.category,
          article.author_name,
          article.featured,
          article.breaking,
          article.badge,
          article.read_time,
          article.views,
          article.published,
          article.created_at
        ]
      );

      console.log(`✅ Importado: ${article.title.substring(0, 50)}...`);
      imported++;
    } catch (error) {
      console.error(`❌ Error: ${article.title.substring(0, 30)}... - ${error.message}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE IMPORTACIÓN');
  console.log('='.repeat(50));
  console.log(`✅ Importados: ${imported}`);
  console.log(`⏭️  Ya existían: ${skipped}`);
  console.log(`❌ Errores: ${errors}`);
  console.log('='.repeat(50) + '\n');

  process.exit(0);
}

importArticles().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
