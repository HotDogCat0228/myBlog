import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const generateSitemap = async () => {
  try {
    // 獲取所有已發布的文章
    const articlesQuery = query(
      collection(db, 'articles'),
      where('published', '==', true)
    );
    const articlesSnapshot = await getDocs(articlesQuery);
    
    // 獲取所有分類
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    
    // 獲取導覽項目
    const navigationSnapshot = await getDocs(collection(db, 'navigation'));
    
    const baseUrl = 'https://hotdogcat0228.github.io/myBlog';
    const currentDate = new Date().toISOString().split('T')[0];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 首頁 -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

    // 添加文章頁面
    articlesSnapshot.docs.forEach(doc => {
      const article = doc.data();
      const lastmod = article.updatedAt ? 
        article.updatedAt.toDate().toISOString().split('T')[0] : 
        currentDate;
      
      sitemap += `  <url>
    <loc>${baseUrl}/#/article/${doc.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    // 添加分類頁面
    categoriesSnapshot.docs.forEach(doc => {
      const category = doc.data();
      sitemap += `  <url>
    <loc>${baseUrl}/#/category/${encodeURIComponent(category.name)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    // 添加導覽頁面（僅內部連結）
    navigationSnapshot.docs.forEach(doc => {
      const navItem = doc.data();
      if (navItem.type === 'internal' && navItem.enabled && navItem.path !== '/') {
        sitemap += `  <url>
    <loc>${baseUrl}/#${navItem.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    });

    sitemap += `</urlset>`;
    
    return sitemap;
  } catch (error) {
    console.error('生成 sitemap 失敗:', error);
    return null;
  }
};

export const generateRobotsTxt = () => {
  const baseUrl = 'https://hotdogcat0228.github.io/myBlog';
  
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# 爬蟲延遲（毫秒）
Crawl-delay: 1

# 不允許爬取的路径
Disallow: /admin
Disallow: /login
Disallow: /create
Disallow: /edit
`;
};
