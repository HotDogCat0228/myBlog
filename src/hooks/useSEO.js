import { useEffect } from 'react';

function useSEO({ 
  title, 
  description, 
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  category,
  tags = []
}) {
  useEffect(() => {
    const defaultTitle = 'My Blog - React + Firebase 部落格';
    const defaultDescription = 'React + Firebase 部落格系統 - 分享程式開發心得和技術文章';
    const defaultImage = `${window.location.origin}/logo192.png`;
    const baseUrl = window.location.origin;
    
    const fullTitle = title ? `${title} | My Blog` : defaultTitle;
    const fullDescription = description || defaultDescription;
    const fullImage = image || defaultImage;
    const fullUrl = url ? `${baseUrl}${url}` : window.location.href;
    const keywordsString = keywords || tags.join(', ');

    // 更新 document title
    document.title = fullTitle;

    // 更新或創建 meta tags
    const updateMetaTag = (name, content, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 基本 meta tags
    updateMetaTag('description', fullDescription);
    if (keywordsString) updateMetaTag('keywords', keywordsString);
    if (author) updateMetaTag('author', author);

    // Open Graph tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', fullDescription, true);
    updateMetaTag('og:image', fullImage, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:site_name', 'My Blog', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', fullDescription);
    updateMetaTag('twitter:image', fullImage);

    // 文章特定 meta tags
    if (type === 'article') {
      if (author) updateMetaTag('article:author', author, true);
      if (publishedTime) updateMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, true);
      if (category) updateMetaTag('article:section', category, true);
      tags.forEach(tag => {
        // 為每個標籤創建單獨的 meta tag
        const tagMeta = document.createElement('meta');
        tagMeta.setAttribute('property', 'article:tag');
        tagMeta.setAttribute('content', tag);
        document.head.appendChild(tagMeta);
      });
    }

    // 更新 canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // JSON-LD 結構化資料
    let jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLd);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": type === 'article' ? 'Article' : 'WebSite',
      "name": fullTitle,
      "headline": title,
      "description": fullDescription,
      "image": fullImage,
      "url": fullUrl,
      "publisher": {
        "@type": "Organization",
        "name": "My Blog",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo192.png`
        }
      },
      ...(type === 'article' && {
        "author": {
          "@type": "Person",
          "name": author || "My Blog"
        },
        "datePublished": publishedTime,
        "dateModified": modifiedTime,
        "articleSection": category,
        "keywords": keywordsString
      })
    };

    jsonLd.textContent = JSON.stringify(structuredData);

    // Cleanup function
    return () => {
      // 移除文章標籤的重複 meta tags
      if (type === 'article') {
        const articleTags = document.querySelectorAll('meta[property="article:tag"]');
        articleTags.forEach(tag => tag.remove());
      }
    };
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, category, tags]);
}

export default useSEO;
