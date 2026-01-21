import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer artículos nuevos
const newArticlesPath = path.join(__dirname, 'new-articles.json');
const newArticles = JSON.parse(fs.readFileSync(newArticlesPath, 'utf-8'));

// Conectar a la base de datos
const dbPath = path.join(__dirname, '..', 'server', 'josenizzo.db');
const db = new sqlite3.Database(dbPath);

// Promisificar
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

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

async function sync() {
  try {
    // Verificar slugs existentes
    const existingSlugs = await db.allAsync('SELECT slug FROM articles');
    const slugSet = new Set(existingSlugs.map(r => r.slug));
    console.log(`Artículos existentes: ${slugSet.size}`);

    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < newArticles.length; i++) {
      const article = newArticles[i];

      // Determinar categoría
      let category = 'Sociedad';
      for (const cat of article.categories) {
        if (categoryMap[cat]) {
          category = categoryMap[cat];
          break;
        }
      }

      let slug = generateSlug(article.title);

      // Si el slug ya existe, agregar sufijo
      if (slugSet.has(slug)) {
        skipped++;
        continue;
      }

      const cleanedContent = cleanContent(article.content);
      const readTime = calculateReadTime(cleanedContent);

      try {
        await db.runAsync(`
          INSERT INTO articles (
            title, slug, excerpt, content, category, author_name,
            image, featured, breaking, badge, read_time, views, published, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        `, [
          article.title,
          slug,
          article.excerpt || '',
          cleanedContent,
          category,
          'José Nizzo',
          article.image || 'https://josenizzo.info/wp-content/uploads/2025/09/default-article.webp',
          inserted < 3 ? 1 : 0,
          inserted === 0 ? 1 : 0,
          inserted === 0 ? 'exclusive' : null,
          readTime,
          Math.floor(Math.random() * 15000) + 5000,
          article.date.replace(' ', 'T'),
          article.date.replace(' ', 'T')
        ]);

        slugSet.add(slug);
        inserted++;
        console.log(`✅ Insertado: ${article.title.substring(0, 50)}...`);
      } catch (err) {
        console.error(`❌ Error insertando: ${err.message}`);
      }
    }

    console.log(`\nResultados:`);
    console.log(`- Insertados: ${inserted}`);
    console.log(`- Omitidos (duplicados): ${skipped}`);

    // Verificar total
    const total = await db.getAsync('SELECT COUNT(*) as count FROM articles');
    console.log(`- Total artículos en DB: ${total.count}`);

    // Mostrar los 5 más recientes
    const recent = await db.allAsync('SELECT title, created_at FROM articles ORDER BY created_at DESC LIMIT 5');
    console.log(`\n5 artículos más recientes:`);
    recent.forEach((a, i) => {
      console.log(`${i + 1}. [${a.created_at}] ${a.title.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

sync();
