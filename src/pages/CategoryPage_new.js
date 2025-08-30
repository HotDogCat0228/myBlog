import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import SEOHead from '../components/SEOHead';
import './CategoryPage.css';

function CategoryPage() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        console.log('正在搜尋分類:', category);
        
        // 獲取分類資訊
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('slug', '==', category)
        );
        const categorySnapshot = await getDocs(categoriesQuery);
        
        console.log('找到的分類數量:', categorySnapshot.docs.length);
        
        if (!categorySnapshot.empty) {
          const categoryData = {
            id: categorySnapshot.docs[0].id,
            ...categorySnapshot.docs[0].data()
          };
          console.log('分類資料:', categoryData);
          console.log('分類圖示:', categoryData.icon, '(字符碼:', categoryData.icon?.charCodeAt?.(0), ')');
          setCategoryInfo(categoryData);
        } else {
          console.warn('未找到分類:', category);
        }

        // 獲取該分類的文章 - 使用高效的索引查詢
        let articlesData = [];
        
        try {
          // 使用複合索引查詢：category + published + createdAt
          const articlesQuery = query(
            collection(db, 'articles'),
            where('category', '==', category),
            where('published', '==', true),
            orderBy('createdAt', 'desc')
          );
          
          const articlesSnapshot = await getDocs(articlesQuery);
          articlesData = articlesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
          }));
            
          console.log(`使用索引查詢找到 ${category} 分類的文章:`, articlesData.length);
          
        } catch (error) {
          console.error('索引查詢失敗，回退到客戶端過濾:', error);
          
          // 如果索引查詢失敗，回退到客戶端過濾
          try {
            const allArticlesQuery = query(
              collection(db, 'articles'),
              where('published', '==', true)
            );
            const allArticlesSnapshot = await getDocs(allArticlesQuery);
            
            articlesData = allArticlesSnapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
              }))
              .filter(article => article.category === category)
              .sort((a, b) => b.createdAt - a.createdAt);
              
            console.log(`客戶端過濾找到 ${category} 分類的文章:`, articlesData.length);
          } catch (fallbackError) {
            console.error('回退查詢也失敗:', fallbackError);
          }
        }
        
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
      <SEOHead 
        title={`${categoryInfo?.name || category} 分類`}
        description={categoryInfo?.description || `瀏覽所有關於 ${category} 的技術文章和教學內容`}
        keywords={`${category}, 技術文章, 程式設計, 前端開發, 部落格`}
        url={`/category/${category}`}
        type="website"
      />
      
      <div className="category-header">
        <div className="container">
          <div className="category-breadcrumb">
            <Link to="/">首頁</Link> <span className="separator">/</span> <span>分類</span> <span className="separator">/</span> <span>{categoryInfo?.name || category}</span>
          </div>
          <div className="category-title-section">
            <div className="category-icon-small">
              {(categoryInfo?.icon && categoryInfo.icon.trim()) || '💻'}
            </div>
            <div className="category-title-info">
              <h1>{categoryInfo?.name || category}</h1>
              <p>{categoryInfo?.description || `關於 ${category} 的文章`}</p>
              <div className="category-meta">
                <span className="article-count">{articles.length} 篇文章</span>
                {categoryInfo?.color && (
                  <span className="category-color" style={{ backgroundColor: categoryInfo.color }}></span>
                )}
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
