import { useState, useEffect } from 'react';
import { articlesAPI } from '../services/api';
import { categories } from '../data/articles';

export function useArticles(params = {}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchArticles() {
      try {
        setLoading(true);
        const data = await articlesAPI.getAll(params);

        if (isMounted) {
          setArticles(data.articles || []);
          setPagination(data.pagination || null);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setArticles([]);
          console.error('Error al cargar artículos:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, [params.page, params.limit, params.search, params.category]);

  return { articles, loading, error, pagination };
}

export function useFeaturedArticles(limit = 3) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchArticles() {
      try {
        setLoading(true);
        const data = await articlesAPI.getFeatured(limit);

        if (isMounted) {
          setArticles(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, [limit]);

  return { articles, loading, error };
}

export function useTrendingArticles(limit = 5) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchArticles() {
      try {
        setLoading(true);
        const data = await articlesAPI.getTrending(limit);

        if (isMounted) {
          setArticles(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, [limit]);

  return { articles, loading, error };
}

export function useArticle(id) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchArticle() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await articlesAPI.getById(id);

        if (isMounted) {
          setArticle(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchArticle();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { article, loading, error };
}

export function useArticlesByCategory(category, limit = null) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchArticles() {
      try {
        setLoading(true);
        // Mapear key a valor display si es necesario (ej: 'NG_INSIGHTS' -> 'NG Insights')
        const categoryName = categories[category] || category;
        const params = { category: categoryName };
        if (limit) params.limit = limit;
        const data = await articlesAPI.getAll(params);

        if (isMounted) {
          setArticles(data.articles || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setArticles([]);
          console.error('Error al cargar artículos por categoría:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, [category, limit]);

  return { articles, loading, error };
}
