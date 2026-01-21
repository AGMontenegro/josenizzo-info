import db from './config/database.js';

// Función para crear slug desde título
function createSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]+/g, '-')      // Reemplazar caracteres especiales con -
    .replace(/^-+|-+$/g, '');         // Remover - al inicio y final
}

async function fixDuplicateSlugs() {
  console.log('🔧 Buscando y corrigiendo slugs duplicados...\n');

  try {
    // Encontrar slugs duplicados
    const duplicates = await db.allAsync(`
      SELECT slug, COUNT(*) as count
      FROM articles
      GROUP BY slug
      HAVING count > 1
      ORDER BY count DESC
    `);

    if (duplicates.length === 0) {
      console.log('✅ No se encontraron slugs duplicados\n');
      process.exit(0);
    }

    console.log(`📊 Encontrados ${duplicates.length} slugs duplicados:\n`);

    let fixed = 0;
    let errors = 0;

    for (const dup of duplicates) {
      console.log(`   Slug: "${dup.slug}" - ${dup.count} artículos`);

      // Obtener todos los artículos con este slug
      const articles = await db.allAsync(
        'SELECT id, title, slug, created_at FROM articles WHERE slug = ? ORDER BY created_at ASC',
        [dup.slug]
      );

      // Mantener el primero con el slug original, renumerar los demás
      for (let i = 1; i < articles.length; i++) {
        const article = articles[i];
        const baseSlug = createSlug(article.title);

        // Intentar con fecha
        const date = new Date(article.created_at);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        let newSlug = `${baseSlug}-${dateStr}`;

        // Verificar si este slug ya existe
        let exists = await db.getAsync('SELECT id FROM articles WHERE slug = ?', [newSlug]);
        let counter = 1;

        // Si existe, agregar contador
        while (exists) {
          newSlug = `${baseSlug}-${dateStr}-${counter}`;
          exists = await db.getAsync('SELECT id FROM articles WHERE slug = ?', [newSlug]);
          counter++;
        }

        try {
          await db.runAsync(
            'UPDATE articles SET slug = ? WHERE id = ?',
            [newSlug, article.id]
          );
          console.log(`      ✓ ID ${article.id}: ${dup.slug} → ${newSlug}`);
          fixed++;
        } catch (error) {
          console.log(`      ✗ Error en ID ${article.id}: ${error.message}`);
          errors++;
        }
      }
      console.log('');
    }

    console.log(`\n🎉 Proceso completado!`);
    console.log(`   ✅ Slugs corregidos: ${fixed}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📊 Total procesados: ${duplicates.length} grupos\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

fixDuplicateSlugs();
