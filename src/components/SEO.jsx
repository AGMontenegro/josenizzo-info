import { useEffect } from 'react';

function SEO({
  title,
  description,
  image,
  article = false,
  author,
  publishedTime,
  modifiedTime,
  category,
  url
}) {
  const siteTitle = 'josenizzo.info';
  const siteName = 'josenizzo.info - El diario de la Patria';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteName;
  const siteUrl = 'https://josenizzo.info';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const defaultDescription = 'Portal de noticias y análisis de actualidad en Argentina y el mundo';
  const defaultImage = `${siteUrl}/logos/josenizzo-og.png`;

  useEffect(() => {
    // JSON-LD Structured Data para Google News
    const existingJsonLd = document.querySelector('script[type="application/ld+json"]');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    if (article && title) {
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: title,
        description: description || defaultDescription,
        image: image ? [image] : [defaultImage],
        datePublished: publishedTime || new Date().toISOString(),
        dateModified: modifiedTime || publishedTime || new Date().toISOString(),
        author: {
          '@type': 'Person',
          name: author || 'Redacción josenizzo.info'
        },
        publisher: {
          '@type': 'Organization',
          name: siteTitle,
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/logos/josenizzo-logo.png`
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': fullUrl
        },
        articleSection: category || 'Noticias',
        inLanguage: 'es-AR'
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    } else {
      // JSON-LD para la página principal (WebSite + Organization)
      const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            url: siteUrl,
            name: siteName,
            description: defaultDescription,
            inLanguage: 'es-AR',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteUrl}/buscar?q={search_term_string}`,
              'query-input': 'required name=search_term_string'
            }
          },
          {
            '@type': 'Organization',
            '@id': `${siteUrl}/#organization`,
            name: siteTitle,
            url: siteUrl,
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/logos/josenizzo-logo.png`
            },
            sameAs: [
              'https://twitter.com/josenizzo',
              'https://facebook.com/josenizzo'
            ]
          }
        ]
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    // Actualizar título
    document.title = fullTitle;

    // Función para actualizar o crear meta tags
    const updateMetaTag = (selector, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const attribute = selector.includes('property') ? 'property' : 'name';
        const value = selector.match(/["']([^"']+)["']/)[1];
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Meta tags básicos
    updateMetaTag('meta[name="description"]', description || defaultDescription);

    // Open Graph
    updateMetaTag('meta[property="og:type"]', article ? 'article' : 'website');
    updateMetaTag('meta[property="og:url"]', fullUrl);
    updateMetaTag('meta[property="og:title"]', title || siteTitle);
    updateMetaTag('meta[property="og:description"]', description || defaultDescription);
    updateMetaTag('meta[property="og:image"]', image || defaultImage);
    updateMetaTag('meta[property="og:site_name"]', siteTitle);
    updateMetaTag('meta[property="og:locale"]', 'es_AR');

    // Article tags (solo para artículos)
    if (article) {
      if (publishedTime) updateMetaTag('meta[property="article:published_time"]', publishedTime);
      if (modifiedTime) updateMetaTag('meta[property="article:modified_time"]', modifiedTime);
      if (author) updateMetaTag('meta[property="article:author"]', author);
      if (category) updateMetaTag('meta[property="article:section"]', category);
    }

    // Twitter
    updateMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    updateMetaTag('meta[name="twitter:url"]', fullUrl);
    updateMetaTag('meta[name="twitter:title"]', title || siteTitle);
    updateMetaTag('meta[name="twitter:description"]', description || defaultDescription);
    updateMetaTag('meta[name="twitter:image"]', image || defaultImage);
    updateMetaTag('meta[name="twitter:site"]', '@josenizzo');
    updateMetaTag('meta[name="twitter:creator"]', '@josenizzo');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Lang attribute
    document.documentElement.lang = 'es-AR';
  }, [fullTitle, description, image, article, author, publishedTime, modifiedTime, category, fullUrl, defaultDescription, defaultImage, title, siteTitle, siteName, siteUrl]);

  return null;
}

export default SEO;
