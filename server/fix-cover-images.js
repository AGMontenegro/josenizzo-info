import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import db from './config/database.js';

const ARTICLES_TO_FIX = [3511, 3512, 3513];

async function fixCoverImages() {
  console.log('\n🔧 Corrigiendo imágenes de portada...\n');

  try {
    await new Promise(resolve => setTimeout(resolve, 2000));

    for (const id of ARTICLES_TO_FIX) {
      const article = await db.getAsync(
        'SELECT id, title, content, image FROM articles WHERE id = ?',
        [id]
      );

      if (!article) {
        console.log(`⚠️  Artículo ${id} no encontrado`);
        continue;
      }

      // Buscar primera imagen que no sea foto de autor
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      let newImage = '';

      while ((match = imgRegex.exec(article.content)) !== null) {
        const imgUrl = match[1];
        // Saltar fotos de autor
        if (imgUrl.includes('Analia_photo') || imgUrl.includes('José_Nizzo') || imgUrl.includes('Jose_Nizzo')) {
          continue;
        }
        newImage = imgUrl;
        break;
      }

      if (newImage && newImage !== article.image) {
        await db.runAsync('UPDATE articles SET image = ? WHERE id = ?', [newImage, id]);
        console.log(`✅ ID ${id}: ${article.title.substring(0, 40)}...`);
        console.log(`   Nueva imagen: ${newImage.substring(0, 60)}...`);
      } else if (!newImage) {
        console.log(`⚠️  ID ${id}: Sin imagen de portada disponible`);
      } else {
        console.log(`⏭️  ID ${id}: Ya tiene imagen correcta`);
      }
    }

    console.log('\n✅ Corrección completada!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixCoverImages();
