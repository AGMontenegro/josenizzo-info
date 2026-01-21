const fs = require('fs');
const path = require('path');

// Leer artículos nuevos
const newArticlesPath = path.join(__dirname, 'new-articles.json');
const newArticles = JSON.parse(fs.readFileSync(newArticlesPath, 'utf-8'));

// Leer archivo articles.js existente
const articlesJsPath = path.join(__dirname, '..', 'src', 'data', 'articles.js');
const articlesContent = fs.readFileSync(articlesJsPath, 'utf-8');

// Extraer el array de artículos existente
const articlesMatch = articlesContent.match(/export const articles = (\[[\s\S]*\]);/);
if (!articlesMatch) {
  console.error('No se pudo encontrar el array de artículos');
  process.exit(1);
}

const existingArticles = eval(articlesMatch[1]);
console.log(`Artículos existentes: ${existingArticles.length}`);
console.log(`Artículos nuevos a agregar: ${newArticles.length}`);

// Obtener wpIds existentes para evitar duplicados
const existingWpIds = new Set(existingArticles.map(a => a.wpId));

// Filtrar artículos nuevos que no estén ya en el archivo
const uniqueNewArticles = newArticles.filter(a => !existingWpIds.has(a.wpId));
console.log(`Artículos únicos (sin duplicados): ${uniqueNewArticles.length}`);

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

// Función para limpiar excerpt
function cleanExcerpt(excerpt) {
  return excerpt
    .replace(/<[^>]*>/g, '') // Remover HTML
    .replace(/\s+/g, ' ')    // Normalizar espacios
    .trim()
    .substring(0, 300) + (excerpt.length > 300 ? '...' : '');
}

// Función para limpiar contenido
function cleanContent(content) {
  return content
    .replace(/<!-- wp:[^>]*-->/g, '')  // Remover comentarios WP
    .replace(/<!-- \/wp:[^>]*-->/g, '')
    .replace(/\n{3,}/g, '\n\n')        // Normalizar saltos de línea
    .trim();
}

// Calcular tiempo de lectura
function calculateReadTime(content) {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Obtener el último ID usado
const lastId = Math.max(...existingArticles.map(a => a.id));
console.log(`Último ID existente: ${lastId}`);

// Convertir artículos nuevos al formato del sitio
const formattedNewArticles = uniqueNewArticles.map((article, index) => {
  // Determinar categoría principal
  let category = 'Sociedad';
  for (const cat of article.categories) {
    if (categoryMap[cat]) {
      category = categoryMap[cat];
      break;
    }
  }

  return {
    id: lastId + index + 1,
    wpId: article.wpId,
    title: article.title,
    excerpt: cleanExcerpt(article.excerpt),
    content: cleanContent(article.content),
    category: category,
    author: 'José Nizzo',
    date: article.date.replace(' ', 'T'),
    image: article.image || 'https://josenizzo.info/wp-content/uploads/2025/09/default-article.webp',
    featured: index < 3, // Los 3 más recientes son destacados
    breaking: index === 0, // El más reciente es breaking
    badge: index === 0 ? 'exclusive' : null,
    readTime: calculateReadTime(article.content),
    views: Math.floor(Math.random() * 15000) + 5000
  };
});

// Combinar: nuevos primero, luego existentes
const allArticles = [...formattedNewArticles, ...existingArticles];

// Reasignar IDs para mantener orden
allArticles.forEach((article, index) => {
  article.id = index + 1;
});

console.log(`Total de artículos combinados: ${allArticles.length}`);

// Generar nuevo contenido del archivo
const now = new Date();
const dateStr = now.toLocaleDateString('es-AR') + ', ' + now.toLocaleTimeString('es-AR');

const newContent = `// Artículos importados desde WordPress
// Fecha de importación: ${dateStr}
// Total de artículos: ${allArticles.length}
// Última actualización: ${dateStr}

export const categories = {
  SOCIEDAD: 'Sociedad',
  NG_INSIGHTS: 'NG Insights',
  INTERNACIONAL: 'Internacional',
  ECONOMIA: 'Economía',
  POLITICA: 'Política',
  TECNOLOGIA: 'Tecnología',
  CULTURA: 'Cultura',
  DEPORTES: 'Deportes',
  DESAFIO_BIENESTAR: 'Desafío Bienestar'
};

export const articles = ${JSON.stringify(allArticles, null, 2)};
`;

// Escribir archivo
fs.writeFileSync(articlesJsPath, newContent, 'utf-8');
console.log(`\nArchivo actualizado: ${articlesJsPath}`);
console.log(`Total de artículos: ${allArticles.length}`);
console.log(`Artículos nuevos agregados: ${formattedNewArticles.length}`);

// Mostrar los 5 más recientes
console.log('\n5 artículos más recientes:');
allArticles.slice(0, 5).forEach((a, i) => {
  console.log(`${i + 1}. [${a.date}] ${a.title.substring(0, 50)}...`);
});
