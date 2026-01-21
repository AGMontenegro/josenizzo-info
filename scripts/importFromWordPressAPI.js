import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const WORDPRESS_API_URL = 'https://josenizzo.info/wp-json/wp/v2';
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'articles.js');

// Mapeo de categorías
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

function normalizeCategory(wpCategory) {
  if (!wpCategory) return 'Sociedad';
  const category = wpCategory.toLowerCase().trim();
  return categoryMap[category] || 'Sociedad';
}

function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function generateViews() {
  return Math.floor(Math.random() * 20000) + 1000;
}

function assignBadge(index, categoryName) {
  if (categoryName && categoryName.toLowerCase().includes('opinión')) {
    return 'opinion';
  }
  if (index % 5 === 0) return 'exclusive';
  if (index % 7 === 0) return 'analysis';
  return null;
}

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

function stripHTML(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

async function fetchAllPosts() {
  console.log('🚀 Iniciando importación desde WordPress API...\n');

  const allPosts = [];
  let page = 1;
  let hasMore = true;

  try {
    // Primero, obtener el total de posts
    const initialResponse = await fetch(`${WORDPRESS_API_URL}/posts?per_page=100`);
    const totalPosts = parseInt(initialResponse.headers.get('X-WP-Total'));
    const totalPagesHeader = parseInt(initialResponse.headers.get('X-WP-TotalPages'));

    // Calcular correctamente el número de páginas
    const totalPages = Math.ceil(totalPosts / 100);

    console.log(`📊 Total de posts en WordPress: ${totalPosts}`);
    console.log(`📄 Total de páginas a descargar: ${totalPages} (100 posts por página)\n`);

    // Obtener todos los posts página por página (100 por página es el máximo)
    while (hasMore && page <= totalPages) {
      console.log(`📥 Descargando página ${page}/${totalPages}... (${allPosts.length}/${totalPosts} posts)`);

      const response = await fetch(`${WORDPRESS_API_URL}/posts?per_page=100&page=${page}&_embed`);

      if (!response.ok) {
        if (response.status === 400 && page > 1) {
          // No hay más páginas
          hasMore = false;
          break;
        }
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const posts = await response.json();

      if (posts.length === 0) {
        hasMore = false;
        break;
      }

      allPosts.push(...posts);
      page++;

      // Pequeña pausa para no sobrecargar el servidor
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n✅ Descargados ${allPosts.length} posts exitosamente\n`);

    return allPosts;

  } catch (error) {
    console.error('❌ Error al conectar con la API de WordPress:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verifica que la URL de tu WordPress sea correcta');
    console.log('   2. Asegúrate de que la API REST esté habilitada en tu WordPress');
    console.log('   3. Verifica que no haya restricciones de CORS');
    console.log('\n🔧 Puedes probar manualmente en tu navegador:');
    console.log(`   ${WORDPRESS_API_URL}/posts?per_page=1\n`);
    throw error;
  }
}

async function fetchCategories() {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/categories?per_page=100`);
    if (!response.ok) return {};

    const categories = await response.json();
    const categoryNameMap = {};

    categories.forEach(cat => {
      categoryNameMap[cat.id] = cat.name;
    });

    return categoryNameMap;
  } catch (error) {
    console.log('⚠️  No se pudieron obtener las categorías, usando valores por defecto');
    return {};
  }
}

async function importFromAPI() {
  try {
    // Obtener categorías primero
    console.log('🏷️  Obteniendo categorías...');
    const wpCategories = await fetchCategories();
    console.log(`   ✅ ${Object.keys(wpCategories).length} categorías obtenidas\n`);

    // Obtener todos los posts
    const wpPosts = await fetchAllPosts();

    if (wpPosts.length === 0) {
      console.log('⚠️  No se encontraron posts en WordPress');
      return;
    }

    console.log('🔄 Convirtiendo posts al formato josenizzo.info...\n');

    // Convertir posts al formato de josenizzo.info
    const articles = wpPosts.map((post, index) => {
      // Obtener nombre de categoría
      const categoryId = post.categories && post.categories[0];
      const categoryName = categoryId ? wpCategories[categoryId] : '';
      const category = normalizeCategory(categoryName);

      // Extraer imagen destacada
      let featuredImage = getImageByCategory(category);
      if (post.featured_media && post._embedded && post._embedded['wp:featuredmedia']) {
        const media = post._embedded['wp:featuredmedia'][0];
        if (media && media.source_url) {
          featuredImage = media.source_url;
        }
      }

      // Crear excerpt
      const excerpt = post.excerpt && post.excerpt.rendered
        ? stripHTML(post.excerpt.rendered).substring(0, 200) + '...'
        : stripHTML(post.content.rendered).substring(0, 200) + '...';

      return {
        id: index + 1,
        wpId: post.id,
        title: post.title.rendered || 'Sin título',
        excerpt: excerpt,
        content: post.content.rendered,
        category: category,
        author: 'José Nizzo',
        date: post.date,
        image: featuredImage,
        featured: index < 3,
        breaking: index === 0,
        badge: assignBadge(index, category),
        readTime: calculateReadTime(post.content.rendered),
        views: generateViews()
      };
    });

    console.log('✅ Conversión completada. Generando archivo articles.js...\n');

    // Generar archivo
    const articlesFileContent = `// Artículos importados desde WordPress API
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

    fs.writeFileSync(OUTPUT_PATH, articlesFileContent, 'utf-8');

    console.log(`✅ Archivo generado exitosamente en: ${OUTPUT_PATH}\n`);
    console.log('📊 Resumen de importación:');
    console.log(`   • Total de artículos importados: ${articles.length}`);
    console.log(`   • Artículos destacados: ${articles.filter(a => a.featured).length}`);
    console.log(`   • Breaking news: ${articles.filter(a => a.breaking).length}`);
    console.log(`   • Con badge "Exclusivo": ${articles.filter(a => a.badge === 'exclusive').length}`);
    console.log(`   • Con badge "Análisis": ${articles.filter(a => a.badge === 'analysis').length}`);
    console.log(`   • Con badge "Opinión": ${articles.filter(a => a.badge === 'opinion').length}`);

    // Distribución por categorías
    console.log('\n📂 Distribución por categorías:');
    const categoryCount = {};
    articles.forEach(article => {
      categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
    });
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`   • ${cat}: ${count} artículos`);
    });

    // Primeros artículos
    console.log('\n📰 Primeros 10 artículos importados:');
    articles.slice(0, 10).forEach((article, i) => {
      const titlePreview = article.title.substring(0, 60) + (article.title.length > 60 ? '...' : '');
      console.log(`   ${i + 1}. [${article.category}] ${titlePreview}`);
    });

    console.log('\n🎉 Importación completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
    process.exit(1);
  }
}

// Ejecutar importación
importFromAPI();
