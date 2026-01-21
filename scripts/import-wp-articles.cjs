const fs = require('fs');
const path = require('path');

// Leer el archivo XML
const xmlPath = path.join('C:', 'Users', 'admin', 'Downloads', 'josenizzoinfo.WordPress.2026-01-19.xml');
const xml = fs.readFileSync(xmlPath, 'utf-8');

// Fecha de corte - artículos desde el 27 de diciembre de 2025
const cutoffDate = new Date('2025-12-27T00:00:00');

// Extraer todos los items
const itemRegex = /<item>([\s\S]*?)<\/item>/g;
const items = [];
let match;

while ((match = itemRegex.exec(xml)) !== null) {
  items.push(match[1]);
}

console.log(`Total items encontrados: ${items.length}`);

// Filtrar solo posts (no attachments, pages, etc.)
const posts = items.filter(item => {
  const postTypeMatch = item.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/);
  const statusMatch = item.match(/<wp:status><!\[CDATA\[(.*?)\]\]><\/wp:status>/);
  return postTypeMatch && postTypeMatch[1] === 'post' && statusMatch && statusMatch[1] === 'publish';
});

console.log(`Posts publicados: ${posts.length}`);

// Función para extraer datos de un post
function extractPostData(postXml) {
  const getField = (regex) => {
    const match = postXml.match(regex);
    return match ? match[1] : null;
  };

  const getCDATA = (tag) => {
    const regex = new RegExp(`<${tag}><\\!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`);
    const match = postXml.match(regex);
    return match ? match[1] : null;
  };

  const getSimpleTag = (tag) => {
    const regex = new RegExp(`<${tag}><\\!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`);
    const match = postXml.match(regex);
    if (match) return match[1];

    const simpleRegex = new RegExp(`<${tag}>([^<]*)<\\/${tag}>`);
    const simpleMatch = postXml.match(simpleRegex);
    return simpleMatch ? simpleMatch[1] : null;
  };

  // Obtener categorías
  const categoryRegex = /<category domain="category"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/g;
  const categories = [];
  let catMatch;
  while ((catMatch = categoryRegex.exec(postXml)) !== null) {
    categories.push(catMatch[1]);
  }

  // Obtener imagen destacada desde postmeta _thumbnail_id y luego buscar la URL
  const thumbnailIdMatch = postXml.match(/<wp:meta_key><!\[CDATA\[_thumbnail_id\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(\d+)\]\]><\/wp:meta_value>/);

  // Buscar imagen en el contenido si no hay thumbnail
  let image = null;
  const content = getCDATA('content:encoded') || '';
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch) {
    image = imgMatch[1];
  }

  const postDate = getCDATA('wp:post_date_gmt') || getCDATA('wp:post_date');

  return {
    wpId: parseInt(getSimpleTag('wp:post_id')) || 0,
    title: getCDATA('title') || '',
    excerpt: (getCDATA('excerpt:encoded') || '').replace(/<[^>]*>/g, '').trim(),
    content: getCDATA('content:encoded') || '',
    date: postDate,
    categories: categories,
    image: image,
    thumbnailId: thumbnailIdMatch ? parseInt(thumbnailIdMatch[1]) : null
  };
}

// Procesar posts
const processedPosts = posts.map(extractPostData);

// Filtrar por fecha (desde el 27 de diciembre de 2025)
const newPosts = processedPosts.filter(post => {
  if (!post.date) return false;
  const postDate = new Date(post.date.replace(' ', 'T'));
  return postDate >= cutoffDate;
});

console.log(`Posts nuevos (desde 27/12/2025): ${newPosts.length}`);

// Ordenar por fecha descendente
newPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

// Mostrar los primeros 5 para verificar
console.log('\nPrimeros 5 posts nuevos:');
newPosts.slice(0, 5).forEach((post, i) => {
  console.log(`${i + 1}. [${post.date}] ${post.title.substring(0, 60)}...`);
  console.log(`   Categorías: ${post.categories.join(', ')}`);
  console.log(`   Imagen: ${post.image ? 'Sí' : 'No'}`);
});

// Guardar resultado en JSON para revisar
const outputPath = path.join(__dirname, 'new-articles.json');
fs.writeFileSync(outputPath, JSON.stringify(newPosts, null, 2), 'utf-8');
console.log(`\nArticulos guardados en: ${outputPath}`);

// También buscar imágenes de attachments para asociar con posts
const attachments = items.filter(item => {
  const postTypeMatch = item.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/);
  return postTypeMatch && postTypeMatch[1] === 'attachment';
});

const attachmentMap = {};
attachments.forEach(att => {
  const idMatch = att.match(/<wp:post_id>(\d+)<\/wp:post_id>/);
  const urlMatch = att.match(/<wp:attachment_url><!\[CDATA\[(.*?)\]\]><\/wp:attachment_url>/);
  if (idMatch && urlMatch) {
    attachmentMap[idMatch[1]] = urlMatch[1];
  }
});

// Actualizar posts con imágenes de attachments
newPosts.forEach(post => {
  if (post.thumbnailId && attachmentMap[post.thumbnailId]) {
    post.image = attachmentMap[post.thumbnailId];
  }
});

// Guardar versión actualizada
fs.writeFileSync(outputPath, JSON.stringify(newPosts, null, 2), 'utf-8');
console.log(`\nArchivo actualizado con imágenes de attachments`);
console.log(`Total de attachments mapeados: ${Object.keys(attachmentMap).length}`);