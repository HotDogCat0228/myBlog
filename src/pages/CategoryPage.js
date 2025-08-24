import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import './CategoryPage.css';

function CategoryPage() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        // 獲取分類資訊
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('slug', '==', category)
        );
        const categorySnapshot = await getDocs(categoriesQuery);
        
        if (!categorySnapshot.empty) {
          const categoryData = {
            id: categorySnapshot.docs[0].id,
            ...categorySnapshot.docs[0].data()
          };
          setCategoryInfo(categoryData);
        }

        // 獲取該分類的文章
        const articlesQuery = query(
          collection(db, 'articles'),
          where('category', '==', category),
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );
        
        const articlesSnapshot = await getDocs(articlesQuery);
        const articlesData = articlesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        
        setArticles(articlesData);
      } catch (error) {
        console.error('獲取分類資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [category]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>載入中...</p>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <div className="category-hero" style={{ backgroundColor: categoryInfo?.color || '#6c63ff' }}>
          <div className="category-info">
            <div className="category-icon">
              {categoryInfo?.icon || '📝'}
            </div>
            <div className="category-details">
              <h1>{categoryInfo?.name || category}</h1>
              <p>{categoryInfo?.description || `關於 ${category} 的文章`}</p>
              <div className="category-stats">
                <span>{articles.length} 篇文章</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {articles.length === 0 ? (
          <div className="empty-state">
            <h2>😔 這個分類還沒有文章</h2>
            <p>期待未來會有更多精彩內容！</p>
            <Link to="/" className="back-home-btn">回到首頁</Link>
          </div>
        ) : (
          <section className="articles-section">
            <div className="section-header">
              <h2>文章列表</h2>
              <p>共 {articles.length} 篇文章</p>
            </div>
            
            <div className="articles-grid">
              {articles.map(article => (
                <article key={article.id} className="article-card">
                  {article.coverImage && (
                    <div className="article-image">
                      <img src={article.coverImage} alt={article.title} />
                    </div>
                  )}
                  
                  <div className="article-content">
                    <h3>
                      <Link to={`/article/${article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    
                    {article.excerpt && (
                      <p className="article-excerpt">{article.excerpt}</p>
                    )}
                    
                    <div className="article-meta">
                      <span className="article-date">
                        {article.createdAt?.toLocaleDateString('zh-TW')}
                      </span>
                      <span className="article-views">
                        {article.views || 0} 次瀏覽
                      </span>
                    </div>
                    
                    {article.tags && article.tags.length > 0 && (
                      <div className="article-tags">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;
