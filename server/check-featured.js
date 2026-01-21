import db from './config/database.js';

async function checkFeatured() {
  try {
    const stats = await db.getAsync(`
      SELECT
        COUNT(*) as total,
        SUM(featured) as featured,
        SUM(breaking) as breaking
      FROM articles
    `);

    console.log('📊 Estadísticas de artículos:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Featured: ${stats.featured || 0}`);
    console.log(`   Breaking: ${stats.breaking || 0}\n`);

    if (stats.featured === 0) {
      console.log('⚠️  No hay artículos marcados como featured');
      console.log('   Marcando los 5 artículos más recientes como featured...\n');

      await db.runAsync(`
        UPDATE articles
        SET featured = 1
        WHERE id IN (
          SELECT id FROM articles
          ORDER BY created_at DESC
          LIMIT 5
        )
      `);

      console.log('✅ 5 artículos marcados como featured\n');
    }

    if (stats.breaking === 0) {
      console.log('⚠️  No hay artículos marcados como breaking');
      console.log('   Marcando los 2 artículos más recientes como breaking...\n');

      await db.runAsync(`
        UPDATE articles
        SET breaking = 1
        WHERE id IN (
          SELECT id FROM articles
          ORDER BY created_at DESC
          LIMIT 2
        )
      `);

      console.log('✅ 2 artículos marcados como breaking\n');
    }

    // Mostrar artículos featured
    const featured = await db.allAsync('SELECT id, title, featured, breaking FROM articles WHERE featured = 1 LIMIT 5');
    console.log('📰 Artículos Featured:');
    featured.forEach(a => console.log(`   - ${a.title.substring(0, 60)}...`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkFeatured();
