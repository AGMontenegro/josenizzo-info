const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Leer artículos nuevos
const newArticlesPath = path.join(__dirname, 'new-articles.json');
const newArticles = JSON.parse(fs.readFileSync(newArticlesPath, 'utf-8'));

// Conectar a la base de datos
const dbPath = path.join(__dirname, '..', 'server', 'database.sqlite');
const db = new Database(dbPath);

console.log(`Base de datos: ${dbPath}`);
console.log(`Artículos nuevos a sincronizar: ${newArticles.length}`);

// Mapear categorías
const categoryMap = {
  'ARGENTINA': 'Sociedad',
  'INFO GENERAL': 'Sociedad',
  'ECONOMÍA': 'Economía',
  'MUNDO': 'Internacional',
  'POLÍTICA': 'Política',
  'CIENCIA': 'Tecnología',
  'DEPORTES': 'Deportes',
  'AGRO': 'Sociedad',
  'SANTA FE': 'Sociedad',
  'PLANETA EXTREMO': 'Sociedad',
  'OPINIÓN': 'NG Insights',
  'Sin categoría': 'Sociedad'
};

// Función para generar slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Función para limpiar contenido
function cleanContent(content) {
  return content
    .replace(/<!-- wp:[^>]*-->/g, '')
    .replace(/<!-- \/wp:[^>]*-->/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Calcular tiempo de lectura
function calculateReadTime(content) {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Verificar wpIds existentes
const existingWpIds = db.prepare('SELECT wp_id FROM articles WHERE wp_id IS NOT NULL').all().map(r => r.wp_id);
console.log(`Artículos existentes con wpId: ${existingWpIds.length}`);

// Preparar statement de inserción
const insertStmt = db.prepare(`
  INSERT INTO articles (
    wp_id, title, slug, excerpt, content, category, author,
    image, featured, breaking, badge, read_time, views, published, created_at, updated_at
  ) VALUES (
    @wp_id, @title, @slug, @excerpt, @content, @category, @author,
    @image, @featured, @breaking, @badge, @read_time, @views, 1, @created_at, @updated_at
  )
`);

// Insertar artículos nuevos
let inserted = 0;
let skipped = 0;

const insertMany = db.transaction((articles) => {
  for (const article of articles) {
    // Verificar si ya existe
    if (existingWpIds.includes(article.wpId)) {
      skipped++;
      continue;
    }

    // Determinar categoría
    let category = 'Sociedad';
    for (const cat of article.categories) {
      if (categoryMap[cat]) {
        category = categoryMap[cat];
        break;
      }
    }

    const slug = generateSlug(article.title);
    const cleanedContent = cleanContent(article.content);
    const readTime = calculateReadTime(cleanedContent);

    try {
      insertStmt.run({
        wp_id: article.wpId,
        title: article.title,
        slug: slug,
        excerpt: article.excerpt || '',
        content: cleanedContent,
        category: category,
        author: 'José Nizzo',
        image: article.image || 'https://josenizzo.info/wp-content/uploads/2025/09/default-article.webp',
        featured: inserted < 3 ? 1 : 0,
        breaking: inserted === 0 ? 1 : 0,
        badge: inserted === 0 ? 'exclusive' : null,
        read_time: readTime,
        views: Math.floor(Math.random() * 15000) + 5000,
        created_at: article.date.replace(' ', 'T'),
        updated_at: article.date.replace(' ', 'T')
      });
      inserted++;
    } catch (err) {
      console.error(`Error insertando artículo ${article.wpId}:`, err.message);
    }
  }
});

insertMany(newArticles);

console.log(`\nResultados:`);
console.log(`- Insertados: ${inserted}`);
console.log(`- Omitidos (duplicados): ${skipped}`);

// Verificar total
const total = db.prepare('SELECT COUNT(*) as count FROM articles').get();
console.log(`- Total artículos en DB: ${total.count}`);

// Mostrar los 5 más recientes
const recent = db.prepare('SELECT title, created_at FROM articles ORDER BY created_at DESC LIMIT 5').all();
console.log(`\n5 artículos más recientes:`);
recent.forEach((a, i) => {
  console.log(`${i + 1}. [${a.created_at}] ${a.title.substring(0, 50)}...`);
});

db.close();
