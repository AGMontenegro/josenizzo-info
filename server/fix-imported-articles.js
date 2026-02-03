import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Importar conexión a base de datos
import db from './config/database.js';

// IDs de los artículos a corregir (los que importamos el 21-22 de enero)
const ARTICLE_IDS = [3507, 3508, 3509, 3510];

// Función para limpiar el contenido
function cleanArticleContent(content) {
  if (!content) return content;

  let cleaned = content;

  // 1. Remover la figura con la foto del autor (Analía o José)
  // Patrón: <figure class="wp-block-image..."><a href="...Analia_photo_JN.jpeg..."><img .../></a></figure>
  cleaned = cleaned.replace(
    /<figure class="wp-block-image[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:Analia_photo_JN|José_Nizzo)[^>]*>[\s\S]*?<\/figure>/gi,
    ''
  );

  // 2. Remover el párrafo "Por [Autor] | josenizzo.info"
  cleaned = cleaned.replace(
    /<p>Por\s+(?:Analía Montenegro|José Nizzo)\s*\|\s*josenizzo\.info<\/p>/gi,
    ''
  );

  // 3. Remover comentarios de WordPress blocks
  cleaned = cleaned.replace(/<!-- \/?wp:[^>]+ -->/g, '');

  // 4. Limpiar múltiples saltos de línea consecutivos
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

  // 5. Trim espacios al inicio y final
  cleaned = cleaned.trim();

  return cleaned;
}

async function fixArticles() {
  console.log('\n🔧 Corrigiendo artículos importados...\n');

  try {
    // Esperar a que la base de datos esté lista
    await new Promise(resolve => setTimeout(resolve, 2000));

    for (const id of ARTICLE_IDS) {
      console.log(`📝 Procesando artículo ID ${id}...`);

      // Obtener el artículo
      const article = await db.getAsync(
        'SELECT id, title, content FROM articles WHERE id = ?',
        [id]
      );

      if (!article) {
        console.log(`   ⚠️  Artículo ${id} no encontrado`);
        continue;
      }

      // Limpiar el contenido
      const cleanedContent = cleanArticleContent(article.content);

      // Verificar si hubo cambios
      if (cleanedContent === article.content) {
        console.log(`   ⏭️  Sin cambios necesarios: ${article.title.substring(0, 40)}...`);
        continue;
      }

      // Actualizar en la base de datos
      await db.runAsync(
        'UPDATE articles SET content = ? WHERE id = ?',
        [cleanedContent, id]
      );

      console.log(`   ✅ Corregido: ${article.title.substring(0, 40)}...`);
    }

    console.log('\n✅ Corrección completada!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixArticles();
