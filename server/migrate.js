import db from './config/database.js';
import { articles } from '../src/data/articles.js';

// Función para crear slug desde título
function createSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]+/g, '-')      // Reemplazar caracteres especiales con -
    .replace(/^-+|-+$/g, '');         // Remover - al inicio y final
}

async function migrateArticles() {
  console.log('🚀 Iniciando migración de artículos...\n');

  try {
    let migrated = 0;
    let errors = 0;

    for (const article of articles) {
      try {
        const slug = createSlug(article.title);

        await db.runAsync(
          `INSERT INTO articles (
            title, slug, excerpt, content, image, category, author_name,
            featured, breaking, badge, read_time, views, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            article.title,
            slug,
            article.excerpt,
            article.content,
            article.image,
            article.category,
            article.author || 'José Nizzo',
            article.featured ? 1 : 0,
            article.breaking ? 1 : 0,
            article.badge || null,
            article.readTime || 5,
            article.views || 0,
            article.date
          ]
        );

        migrated++;
        if (migrated % 100 === 0) {
          console.log(`✅ Migrados ${migrated}/${articles.length} artículos...`);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error migrando artículo "${article.title}":`, error.message);
      }
    }

    console.log(`\n🎉 Migración completada!`);
    console.log(`   ✅ Artículos migrados: ${migrated}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📊 Total: ${articles.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateArticles();
