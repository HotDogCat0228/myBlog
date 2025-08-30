import React from 'react';
import { Helmet } from 'react-helmet-async';

function SEOHead({ 
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
  const defaultTitle = 'My Blog - React + Firebase 部落格';
  const defaultDescription = 'React + Firebase 部落格系統 - 分享程式開發心得和技術文章';
  const defaultImage = `${window.location.origin}/logo192.png`;
  const baseUrl = window.location.origin;
  
  const fullTitle = title ? `${title} | My Blog` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullImage = image || defaultImage;
  const fullUrl = url ? `${baseUrl}${url}` : window.location.href;
  const keywordsString = keywords || tags.join(', ');

  return (
    <Helmet>
      {/* 基本 Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywordsString && <meta name="keywords" content={keywordsString} />}
      <meta name="author" content={author || 'My Blog'} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags (Facebook, LinkedIn 等) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="My Blog" />
      <meta property="og:locale" content="zh_TW" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* 文章特定的 Meta Tags */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {category && <meta property="article:section" content={category} />}
          {tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* 結構化資料 JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
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
        })}
      </script>
    </Helmet>
  );
}

export default SEOHead;
