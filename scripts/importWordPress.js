import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const WORDPRESS_XML_PATH = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', 'josenizzoinfo.WordPress.2025-12-27 (2).xml');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'articles.js');

// Mapeo de categorías de WordPress a categorías de josenizzo.info
const categoryMap = {
  'economía': 'Economía',
  'economia': 'Economía',
  'política': 'Política',
  'politica': 'Política',
  'tecnología': 'Tecnología',
  'tecnologia': 'Tecnología',
  'cultura': 'Cultura',
  'sociedad': 'Sociedad',
  'deportes': 'Deportes',
  'internacional': 'Internacional',
  'opinion': 'Opinión',
  'opinión': 'Opinión',
};

// Función para normalizar categorías
function normalizeCategory(wpCategory) {
  if (!wpCategory) return 'Sociedad';
  const category = wpCategory.toLowerCase().trim();
  return categoryMap[category] || 'Sociedad';
}

// Función para calcular tiempo de lectura
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Función para generar views aleatorias
function generateViews() {
  return Math.floor(Math.random() * 20000) + 1000;
}

// Función para asignar badges
function assignBadge(index, category) {
  if (category && category.toLowerCase().includes('opinión')) {
    return 'opinion';
  }

  // Asignar badges de forma distribuida
  if (index % 5 === 0) return 'exclusive';
  if (index % 7 === 0) return 'analysis';
  return null;
}

// Función para extraer CDATA
function extractCDATA(str) {
  if (!str) return '';
  const match = str.match(/<!\[CDATA\[(.*?)\]\]>/s);
  return match ? match[1] : str;
}

// Función para extraer texto de tags XML
function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}(?:[^>]*)>(.*?)<\/${tagName}>`, 's');
  const match = xml.match(regex);
  return match ? extractCDATA(match[1]).trim() : '';
}

// Función para limpiar HTML
function stripHTML(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Función para obtener imagen según categoría
function getImageByCategory(category) {
  const unsplashImages = {
    'Economía': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    'Política': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=450&fit=crop',
    'Tecnología': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    'Cultura': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=450&fit=crop',
    'Deportes': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop',
    'Internacional': 'https://images.unsplash.com/photo-1526666923127-b2970f64b422?w=800&h=450&fit=crop',
    'Opinión': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop',
    'Sociedad': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop'
  };

  return unsplashImages[category] || unsplashImages['Sociedad'];
}

// Función principal de importación usando regex
async function importWordPress() {
  try {
    console.log('🚀 Iniciando importación de WordPress...\n');

    // Verificar que existe el archivo XML
    if (!fs.existsSync(WORDPRESS_XML_PATH)) {
      throw new Error(`No se encontró el archivo XML en: ${WORDPRESS_XML_PATH}`);
    }

    console.log(`📄 Leyendo archivo: ${WORDPRESS_XML_PATH}`);
    const xmlContent = fs.readFileSync(WORDPRESS_XML_PATH, 'utf-8');

    console.log('🔍 Extrayendo items del XML...');

    // Buscar inicio y fin del contenido válido del XML
    // El archivo puede tener un item sin cerrar, busquemos el contenido entre <item> y donde empieza el error
    const itemStartIndex = xmlContent.indexOf('<item>');
    const errorStartIndex = xmlContent.indexOf('<!DOCTYPE html>');

    if (itemStartIndex === -1) {
      console.log('⚠️  No se encontró ningún tag <item> en el XML');
      return;
    }

    // Extraer solo la parte válida del XML (antes del error de WordPress)
    const validXmlEnd = errorStartIndex > 0 ? errorStartIndex : xmlContent.length;
    const validXml = xmlContent.substring(0, validXmlEnd);

    // Dividir el XML por tags <item> (puede haber múltiples)
    const itemParts = validXml.split(/<item>\s*/);

    console.log(`📊 Total de secciones encontradas: ${itemParts.length - 1}`); // -1 porque el primer split es antes del primer <item>

    // Diagnóstico: contar tipos de contenido
    const contentTypes = {};
    const statusTypes = {};

    itemParts.slice(1).forEach(itemXml => {
      const postType = extractTag(itemXml, 'wp:post_type');
      const status = extractTag(itemXml, 'wp:status');

      contentTypes[postType] = (contentTypes[postType] || 0) + 1;
      statusTypes[status] = (statusTypes[status] || 0) + 1;
    });

    console.log('\n📋 Tipos de contenido encontrados:');
    Object.entries(contentTypes).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`   • ${type || 'sin tipo'}: ${count}`);
    });

    console.log('\n📊 Estados de contenido:');
    Object.entries(statusTypes).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
      console.log(`   • ${status || 'sin estado'}: ${count}`);
    });

    // Procesar cada parte (excepto la primera que es el header)
    // Incluir tanto posts como pages que estén publicados
    const posts = itemParts.slice(1).filter(itemXml => {
      const postType = extractTag(itemXml, 'wp:post_type');
      const status = extractTag(itemXml, 'wp:status');
      // Aceptar posts y pages que estén publicados O en draft
      return (postType === 'post' || postType === 'page') && (status === 'publish' || status === 'draft');
    });

    console.log(`\n📝 Entradas y páginas encontradas: ${posts.length}\n`);

    if (posts.length === 0) {
      console.log('⚠️  No se encontraron entradas publicadas en el XML');
      return;
    }

    // Convertir posts de WordPress al formato de josenizzo.info
    const articles = posts.map((itemXml, index) => {

      // Extraer datos básicos
      const title = extractTag(itemXml, 'title');
      const content = extractTag(itemXml, 'content:encoded');
      const excerpt = extractTag(itemXml, 'excerpt:encoded');
      const pubDateStr = extractTag(itemXml, 'pubDate');
      const author = extractTag(itemXml, 'dc:creator');

      // Extraer categoría
      const categoryMatch = itemXml.match(/<category domain="category"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/);
      const wpCategory = categoryMatch ? categoryMatch[1] : '';
      const category = normalizeCategory(wpCategory);

      // Crear fecha
      const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();

      // Crear excerpt si no existe
      const finalExcerpt = excerpt || (content ? stripHTML(content).substring(0, 200) + '...' : 'Artículo sin descripción');

      return {
        id: index + 1,
        title: title || 'Sin título',
        excerpt: finalExcerpt,
        content: content,
        category: category,
        author: author || 'José Nizzo',
        date: pubDate.toISOString(),
        image: getImageByCategory(category),
        featured: index < 3, // Los primeros 3 como destacados
        breaking: index === 0, // El primero como breaking news
        badge: assignBadge(index, category),
        readTime: calculateReadTime(content || ''),
        views: generateViews()
      };
    });

    console.log('✅ Conversión completada. Generando archivo articles.js...\n');

    // Generar el contenido del archivo articles.js
    const articlesFileContent = `// Artículos importados desde WordPress
// Fecha de importación: ${new Date().toLocaleString('es-AR')}
// Total de artículos: ${articles.length}

export const categories = {
  ECONOMIA: 'Economía',
  POLITICA: 'Política',
  TECNOLOGIA: 'Tecnología',
  CULTURA: 'Cultura',
  SOCIEDAD: 'Sociedad',
  DEPORTES: 'Deportes',
  INTERNACIONAL: 'Internacional',
  OPINION: 'Opinión'
};

export const articles = ${JSON.stringify(articles, null, 2)};

// Funciones auxiliares
export const getFeaturedArticles = (limit = 3) => {
  return articles.filter(article => article.featured).slice(0, limit);
};

export const getBreakingNews = () => {
  return articles.filter(article => article.breaking);
};

export const getLatestArticles = (limit = 10) => {
  return [...articles]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

export const getArticlesByCategory = (category, limit) => {
  const filtered = articles.filter(article => article.category === category);
  return limit ? filtered.slice(0, limit) : filtered;
};

export const getTrendingArticles = (limit = 5) => {
  return [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

export const getArticleById = (id) => {
  return articles.find(article => article.id === parseInt(id));
};
`;

    // Guardar archivo
    fs.writeFileSync(OUTPUT_PATH, articlesFileContent, 'utf-8');

    console.log(`✅ Archivo generado exitosamente en: ${OUTPUT_PATH}\n`);
    console.log('📊 Resumen de importación:');
    console.log(`   • Total de artículos importados: ${articles.length}`);
    console.log(`   • Artículos destacados: ${articles.filter(a => a.featured).length}`);
    console.log(`   • Breaking news: ${articles.filter(a => a.breaking).length}`);
    console.log(`   • Con badge "Exclusivo": ${articles.filter(a => a.badge === 'exclusive').length}`);
    console.log(`   • Con badge "Análisis": ${articles.filter(a => a.badge === 'analysis').length}`);
    console.log(`   • Con badge "Opinión": ${articles.filter(a => a.badge === 'opinion').length}`);

    // Mostrar distribución por categorías
    console.log('\n📂 Distribución por categorías:');
    const categoryCount = {};
    articles.forEach(article => {
      categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
    });
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`   • ${cat}: ${count} artículos`);
    });

    // Mostrar primeros 5 títulos importados
    console.log('\n📰 Primeros artículos importados:');
    articles.slice(0, 5).forEach((article, i) => {
      console.log(`   ${i + 1}. [${article.category}] ${article.title.substring(0, 60)}${article.title.length > 60 ? '...' : ''}`);
    });

    console.log('\n🎉 Importación completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
    throw error;
  }
}

// Ejecutar importación
importWordPress().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
