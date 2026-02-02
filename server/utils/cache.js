import NodeCache from 'node-cache';

// Cache con TTL de 5 minutos, check cada 60 segundos
const cache = new NodeCache({
  stdTTL: 300,       // 5 minutos por defecto
  checkperiod: 60,   // Limpieza cada 60 segundos
  useClones: false    // No clonar objetos (más rápido)
});

// Keys por tipo
const KEYS = {
  article: (slug) => `article:${slug}`,
  articleList: (params) => `articles:${JSON.stringify(params)}`,
  featured: (limit) => `featured:${limit}`,
  trending: (limit) => `trending:${limit}`,
  sitemap: 'sitemap'
};

// Obtener del cache o ejecutar query
async function cacheOrFetch(key, fetchFn, ttl = 300) {
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const data = await fetchFn();
  if (data) {
    cache.set(key, data, ttl);
  }
  return data;
}

// Invalidar cache de artículos (al crear/editar/eliminar)
function invalidateArticles() {
  const keys = cache.keys();
  for (const key of keys) {
    if (key.startsWith('article') || key.startsWith('featured') || key.startsWith('trending') || key === 'sitemap') {
      cache.del(key);
    }
  }
}

// Stats para monitoreo
function getCacheStats() {
  return cache.getStats();
}

export { cache, KEYS, cacheOrFetch, invalidateArticles, getCacheStats };
export default cache;
