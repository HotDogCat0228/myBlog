import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
// import { db } from '../firebase';
import './Home.css';

function Home() {
  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 使用靜態資料進行演示
    const mockArticles = [
      {
        id: '1',
        title: 'React Hooks 完全指南',
        excerpt: '深入了解 React Hooks，從 useState 到 useEffect，掌握現代 React 開發技巧。',
        category: 'React',
        createdAt: new Date('2024-08-20'),
        views: 1250,
        published: true,
        coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop'
      },
      {
        id: '2',
        title: 'JavaScript ES6+ 新特性',
        excerpt: '探索 JavaScript ES6+ 的強大新特性，包括箭頭函數、解構賦值、模板字串等。',
        category: 'JavaScript',
        createdAt: new Date('2024-08-18'),
        views: 890,
        published: true,
        coverImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&h=400&fit=crop'
      },
      {
        id: '3',
        title: 'CSS Grid vs Flexbox',
        excerpt: '比較 CSS Grid 和 Flexbox 的使用場景，學習如何選擇最適合的佈局方式。',
        category: 'CSS',
        createdAt: new Date('2024-08-15'),
        views: 634,
        published: true,
        coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop'
      },
      {
        id: '4',
        title: '前端性能優化實戰',
        excerpt: '從打包優化到代碼分割，全面提升前端應用性能的實用技巧。',
        category: 'Performance',
        createdAt: new Date('2024-08-12'),
        views: 1180,
        published: true
      },
      {
        id: '5',
        title: 'TypeScript 入門教程',
        excerpt: 'TypeScript 基礎語法和類型系統，讓你的 JavaScript 代碼更加健壯。',
        category: 'TypeScript',
        createdAt: new Date('2024-08-10'),
        views: 967,
        published: true
      }
    ];

    const mockCategories = [
      {
        id: 'react',
        name: 'React',
        slug: 'react',
        description: 'React 開發相關文章',
        icon: '⚛️',
        color: '#61DAFB',
        articleCount: 15
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript 語言特性與技巧',
        icon: '📜',
        color: '#F7DF1E',
        articleCount: 23
      },
      {
        id: 'css',
        name: 'CSS',
        slug: 'css',
        description: 'CSS 樣式設計與佈局',
        icon: '🎨',
        color: '#1572B6',
        articleCount: 18
      },
      {
        id: 'performance',
        name: 'Performance',
        slug: 'performance',
        description: '前端性能優化',
        icon: '⚡',
        color: '#FF6B35',
        articleCount: 8
      }
    ];

    // 模擬 API 載入時間
    setTimeout(() => {
      setArticles(mockArticles);
      setFeaturedArticles(mockArticles.slice(0, 3));
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>載入中...</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>歡迎來到我的部落格</h1>
          <p>分享技術知識、學習心得與生活感悟</p>
          <Link to="/create" className="cta-button">開始寫作</Link>
        </div>
      </section>

      <div className="container">
        {/* Featured Articles */}
        <section className="featured-section">
          <h2>精選文章</h2>
          <div className="featured-grid">
            {featuredArticles.map(article => (
              <article key={article.id} className="featured-card">
                {article.coverImage && (
                  <img src={article.coverImage} alt={article.title} />
                )}
                <div className="card-content">
                  <span className="category-tag">{article.category}</span>
                  <h3>
                    <Link to={`/article/${article.id}`}>{article.title}</Link>
                  </h3>
                  <p className="excerpt">{article.excerpt}</p>
                  <div className="meta">
                    <span className="date">
                      {article.createdAt?.toLocaleDateString('zh-TW')}
                    </span>
                    <span className="read-time">5 分鐘閱讀</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="categories-section">
          <h2>文章分類</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <Link 
                key={category.id} 
                to={`/category/${category.slug}`}
                className="category-card"
                style={{ backgroundColor: category.color || '#6c63ff' }}
              >
                <div className="category-icon">{category.icon || '📝'}</div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span className="article-count">{category.articleCount || 0} 篇文章</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Articles */}
        <section className="recent-section">
          <h2>最新文章</h2>
          <div className="articles-grid">
            {articles.map(article => (
              <article key={article.id} className="article-card">
                {article.coverImage && (
                  <img src={article.coverImage} alt={article.title} />
                )}
                <div className="card-content">
                  <span className="category-tag">{article.category}</span>
                  <h3>
                    <Link to={`/article/${article.id}`}>{article.title}</Link>
                  </h3>
                  <p className="excerpt">{article.excerpt}</p>
                  <div className="meta">
                    <span className="date">
                      {article.createdAt?.toLocaleDateString('zh-TW')}
                    </span>
                    <span className="views">{article.views || 0} 次瀏覽</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
