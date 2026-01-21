import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTICLES_PATH = path.join(__dirname, '..', 'src', 'data', 'articles.js');

// Función para limpiar el contenido de WordPress
function cleanWordPressContent(content) {
  if (!content) return '';

  let cleaned = content;

  // 1. Remover comentarios de WordPress Gutenberg
  cleaned = cleaned.replace(/<!--\s*\/?wp:[^>]*-->/g, '');
  cleaned = cleaned.replace(/<!--\s*\/?[^>]*-->/g, '');

  // 2. Remover divs y clases innecesarias de WordPress
  cleaned = cleaned.replace(/<div class="wp-block-[^"]*">/g, '');
  cleaned = cleaned.replace(/<\/div>/g, '');

  // 3. Remover atributos de clase y style de WordPress
  cleaned = cleaned.replace(/\s+class="[^"]*"/g, '');
  cleaned = cleaned.replace(/\s+style="[^"]*"/g, '');
  cleaned = cleaned.replace(/\s+id="[^"]*"/g, '');

  // 4. Remover shortcodes de WordPress (excepto contenido visible)
  cleaned = cleaned.replace(/\[tdc_zone[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\[vc_row[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\[vc_column[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\[\/vc_row\]/g, '');
  cleaned = cleaned.replace(/\[\/vc_column\]/g, '');
  cleaned = cleaned.replace(/\[\/tdc_zone\]/g, '');
  cleaned = cleaned.replace(/\[tdb_[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\[\/tdb_[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\[tdm_block[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\[\/tdm_block[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\[tds_[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\[jetpack[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\[\/jetpack[^\]]*\]/g, '');

  // 5. Limpiar códigos base64 y datos codificados
  cleaned = cleaned.replace(/eyJ[A-Za-z0-9+/=]+/g, '');
  cleaned = cleaned.replace(/tdc_css="[^"]*"/g, '');

  // 6. Normalizar saltos de línea múltiples
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/\t+/g, '');

  // 7. Limpiar párrafos vacíos
  cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');
  cleaned = cleaned.replace(/<p>&nbsp;<\/p>/g, '');
  cleaned = cleaned.replace(/<p><br\s*\/?><\/p>/g, '');

  // 8. Normalizar espacios en blanco dentro de tags
  cleaned = cleaned.replace(/>\s+</g, '><');

  // 9. Mejorar formato de enlaces
  cleaned = cleaned.replace(/<a\s+href=/g, '<a href=');
  cleaned = cleaned.replace(/\s+>/g, '>');

  // 10. Remover atributos data-* de WordPress
  cleaned = cleaned.replace(/\s+data-[^=]*="[^"]*"/g, '');

  // 11. Remover imágenes no deseadas y textos de pie de artículo
  // Remover el figure completo que contiene Pngtree
  cleaned = cleaned.replace(/<figure>\s*<a[^>]*Pngtree[^>]*>[\s\S]*?<\/a>\s*<\/figure>/gi, '');
  // Remover imagen Generated-Image-November-05-2025
  cleaned = cleaned.replace(/<figure>\s*<a[^>]*Generated-Image-November[^>]*>[\s\S]*?<\/a>\s*<\/figure>/gi, '');
  cleaned = cleaned.replace(/<img[^>]*Generated-Image-November[^>]*>/gi, '');
  // Remover texto PRIMERO ARGENTINA
  cleaned = cleaned.replace(/<p>\s*<strong>\s*PRIMERO ARGENTINA\s*<\/strong>\s*<\/p>/gi, '');
  // Remover texto EL DIARIO DEL PUEBLO (todas las variaciones)
  cleaned = cleaned.replace(/<p>\s*<strong>\s*<em>\s*EL DIARIO DEL PUEBLO\s*<\/em>\s*<\/strong>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*<em>\s*<strong>\s*EL DIARIO DEL PUEBLO\s*<\/strong>\s*<\/em>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*<strong>\s*EL DIARIO DEL PUEBLO\s*<\/strong>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*<em>\s*EL DIARIO DEL PUEBLO\s*<\/em>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*EL DIARIO DEL PUEBLO\s*<\/p>/gi, '');

  // 12. Remover firmas duplicadas de los autores al final de artículos
  // Remover "Analía Montenegro" al final
  cleaned = cleaned.replace(/<p>\s*Analía\s+Montenegro\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*<strong>\s*Analía\s+Montenegro\s*<\/strong>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*<em>\s*Analía\s+Montenegro\s*<\/em>\s*<\/p>/gi, '');
  // Remover "José Nizzo" al final (con y sin acento)
  cleaned = cleaned.replace(/<p>\s*José\s+Nizzo\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*Jose\s+Nizzo\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*<strong>\s*José\s+Nizzo\s*<\/strong>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*<strong>\s*Jose\s+Nizzo\s*<\/strong>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*<em>\s*José\s+Nizzo\s*<\/em>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*<em>\s*Jose\s+Nizzo\s*<\/em>\s*<\/p>/gi, '');
  // Remover "josenizzo.info" al final
  cleaned = cleaned.replace(/<p>\s*josenizzo\.info\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*<strong>\s*josenizzo\.info\s*<\/strong>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*<em>\s*josenizzo\.info\s*<\/em>\s*<\/p>/gi, '');
  // Remover combinaciones juntas
  cleaned = cleaned.replace(/<p>\s*Analía\s+Montenegro\s*<br\s*\/?>\s*josenizzo\.info\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*José\s+Nizzo\s*<br\s*\/?>\s*josenizzo\.info\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*Jose\s+Nizzo\s*<br\s*\/?>\s*josenizzo\.info\s*<\/p>/gi, '');

  // 13. Limpiar imágenes: mantener solo src y alt
  cleaned = cleaned.replace(/<img([^>]*)>/g, (match, attrs) => {
    const srcMatch = attrs.match(/src="([^"]*)"/);
    const altMatch = attrs.match(/alt="([^"]*)"/);

    if (srcMatch) {
      const src = srcMatch[1];
      // Omitir imágenes no deseadas
      if (src.includes('Pngtree') ||
          src.includes('flag-fluttering') ||
          src.includes('Generated-Image-November')) {
        return '';
      }
      const alt = altMatch ? altMatch[1] : '';
      return `<img src="${src}" alt="${alt}" />`;
    }
    return match;
  });

  // 14. Normalizar headings (h1-h6)
  for (let i = 1; i <= 6; i++) {
    const regex = new RegExp(`<h${i}[^>]*>`, 'g');
    cleaned = cleaned.replace(regex, `<h${i}>`);
  }

  // 15. Remover spans innecesarios
  cleaned = cleaned.replace(/<span[^>]*>/g, '');
  cleaned = cleaned.replace(/<\/span>/g, '');

  // 16. Limpiar listas (ul, ol, li)
  cleaned = cleaned.replace(/<ul[^>]*>/g, '<ul>');
  cleaned = cleaned.replace(/<ol[^>]*>/g, '<ol>');
  cleaned = cleaned.replace(/<li[^>]*>/g, '<li>');

  // 17. Remover tags figure y figcaption si están vacíos
  cleaned = cleaned.replace(/<figure[^>]*>\s*<\/figure>/g, '');
  cleaned = cleaned.replace(/<figcaption[^>]*>\s*<\/figcaption>/g, '');

  // 18. Normalizar strong y em
  cleaned = cleaned.replace(/<strong[^>]*>/g, '<strong>');
  cleaned = cleaned.replace(/<em[^>]*>/g, '<em>');
  cleaned = cleaned.replace(/<b>/g, '<strong>');
  cleaned = cleaned.replace(/<\/b>/g, '</strong>');
  cleaned = cleaned.replace(/<i>/g, '<em>');
  cleaned = cleaned.replace(/<\/i>/g, '</em>');

  // 19. Remover scripts y styles
  cleaned = cleaned.replace(/<script[^>]*>.*?<\/script>/gs, '');
  cleaned = cleaned.replace(/<style[^>]*>.*?<\/style>/gs, '');

  // 20. Remover iframes de publicidad/tracking
  cleaned = cleaned.replace(/<iframe[^>]*>.*?<\/iframe>/gs, '');

  // 21. Limpiar espacios al inicio y final
  cleaned = cleaned.trim();

  // 22. Si después de limpiar quedó vacío, retornar un mensaje
  if (cleaned.length < 50) {
    return '<p>Contenido no disponible.</p>';
  }

  return cleaned;
}

// Función para limpiar el excerpt
function cleanExcerpt(excerpt) {
  if (!excerpt) return '';

  let cleaned = excerpt;

  // Remover HTML
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // Remover shortcodes
  cleaned = cleaned.replace(/\[[^\]]*\]/g, '');

  // Remover códigos base64
  cleaned = cleaned.replace(/eyJ[A-Za-z0-9+/=]+/g, '');

  // Normalizar espacios
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.trim();

  // Si quedó muy corto o vacío, retornar mensaje por defecto
  if (cleaned.length < 20) {
    return 'Artículo sin descripción disponible.';
  }

  // Limitar a 200 caracteres y agregar puntos suspensivos
  if (cleaned.length > 200) {
    cleaned = cleaned.substring(0, 200) + '...';
  } else if (!cleaned.endsWith('.') && !cleaned.endsWith('...')) {
    cleaned += '...';
  }

  return cleaned;
}

async function cleanAllArticles() {
  try {
    console.log('🚀 Iniciando limpieza de artículos...\n');

    // Leer archivo de artículos
    console.log('📄 Leyendo archivo de artículos...');
    const fileContent = fs.readFileSync(ARTICLES_PATH, 'utf-8');

    // Extraer el array de artículos usando regex
    const articlesMatch = fileContent.match(/export const articles = (\[[\s\S]*?\n\];)/);

    if (!articlesMatch) {
      throw new Error('No se pudo encontrar el array de artículos en el archivo');
    }

    // Parsear el JSON de artículos
    const articlesJson = articlesMatch[1].replace(/\];$/, ']');
    const articles = JSON.parse(articlesJson);

    console.log(`📊 Total de artículos a limpiar: ${articles.length}\n`);

    let cleaned = 0;
    let withContent = 0;
    let withoutContent = 0;

    // Limpiar cada artículo
    console.log('🧹 Limpiando contenido...');
    const cleanedArticles = articles.map((article, index) => {
      if (index % 100 === 0) {
        console.log(`   Procesando artículo ${index + 1}/${articles.length}...`);
      }

      const originalContent = article.content || '';
      const originalExcerpt = article.excerpt || '';

      const cleanedContent = cleanWordPressContent(originalContent);
      const cleanedExcerpt = cleanExcerpt(originalExcerpt);

      if (cleanedContent && cleanedContent !== '<p>Contenido no disponible.</p>') {
        withContent++;
      } else {
        withoutContent++;
      }

      cleaned++;

      return {
        ...article,
        content: cleanedContent,
        excerpt: cleanedExcerpt
      };
    });

    console.log(`\n✅ Limpieza completada:`);
    console.log(`   • Artículos procesados: ${cleaned}`);
    console.log(`   • Con contenido válido: ${withContent}`);
    console.log(`   • Sin contenido: ${withoutContent}\n`);

    // Generar nuevo archivo
    console.log('💾 Generando archivo limpio...');

    const newFileContent = `// Artículos importados desde WordPress
// Fecha de importación: ${new Date().toLocaleString('es-AR')}
// Total de artículos: ${cleanedArticles.length}
// Limpieza aplicada: ${new Date().toLocaleString('es-AR')}

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

export const articles = ${JSON.stringify(cleanedArticles, null, 2)};

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
    fs.writeFileSync(ARTICLES_PATH, newFileContent, 'utf-8');

    console.log(`✅ Archivo guardado exitosamente en: ${ARTICLES_PATH}\n`);

    // Mostrar ejemplos de antes y después
    console.log('📰 Ejemplo de limpieza:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const sampleArticle = cleanedArticles[0];
    console.log(`\n📌 Artículo: "${sampleArticle.title}"`);
    console.log(`\n🔹 Excerpt limpio:`);
    console.log(`   ${sampleArticle.excerpt.substring(0, 100)}...`);
    console.log(`\n🔹 Contenido limpio (primeros 200 caracteres):`);
    const contentPreview = sampleArticle.content.replace(/<[^>]*>/g, '').substring(0, 200);
    console.log(`   ${contentPreview}...`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 ¡Todos los artículos han sido limpiados y formateados!\n');
    console.log('💡 Recarga el navegador para ver los cambios.');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
    throw error;
  }
}

// Ejecutar limpieza
cleanAllArticles();
