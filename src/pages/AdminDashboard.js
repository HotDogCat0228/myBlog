import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import NavigationManager from '../components/NavigationManager';
import './AdminDashboard.css';

function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('articles');
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    totalViews: 0,
    totalCategories: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchArticles(),
          fetchCategories()
        ]);
      } catch (error) {
        console.error('獲取資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchArticles = async () => {
    try {
      const articlesQuery = query(
        collection(db, 'articles'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(articlesQuery);
      const articlesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
      
      setArticles(articlesData);
      
      // 計算統計數據
      const totalViews = articlesData.reduce((sum, article) => sum + (article.views || 0), 0);
      const publishedCount = articlesData.filter(article => article.published).length;
      
      setStats(prev => ({
        ...prev,
        totalArticles: articlesData.length,
        publishedArticles: publishedCount,
        totalViews
      }));
    } catch (error) {
      console.error('獲取文章失敗:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesQuery = collection(db, 'categories');
      const querySnapshot = await getDocs(categoriesQuery);
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCategories(categoriesData);
      setStats(prev => ({
        ...prev,
        totalCategories: categoriesData.length
      }));
    } catch (error) {
      console.error('獲取分類失敗:', error);
    }
  };

  const handleDeleteArticle = async (articleId, title) => {
    if (window.confirm(`確定要刪除文章「${title}」嗎？`)) {
      try {
        await deleteDoc(doc(db, 'articles', articleId));
        setArticles(articles.filter(article => article.id !== articleId));
        alert('文章刪除成功！');
      } catch (error) {
        console.error('刪除文章失敗:', error);
        alert('刪除文章失敗！');
      }
    }
  };

  const handleTogglePublish = async (articleId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'articles', articleId), {
        published: !currentStatus,
        updatedAt: new Date()
      });
      
      setArticles(articles.map(article => 
        article.id === articleId 
          ? { ...article, published: !currentStatus, updatedAt: new Date() }
          : article
      ));
      
      alert(`文章已${!currentStatus ? '發佈' : '下架'}！`);
    } catch (error) {
      console.error('更新文章狀態失敗:', error);
      alert('更新失敗！');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>載入中...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>管理後台</h1>
        <Link to="/create" className="create-btn">
          ✏️ 新增文章
        </Link>
      </div>

      {/* 統計卡片 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{stats.totalArticles}</h3>
            <p>總文章數</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.publishedArticles}</h3>
            <p>已發佈文章</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👀</div>
          <div className="stat-info">
            <h3>{stats.totalViews}</h3>
            <p>總瀏覽次數</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <h3>{stats.totalCategories}</h3>
            <p>文章分類</p>
          </div>
        </div>
      </div>

      {/* 標籤頁 */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => setActiveTab('articles')}
        >
          文章管理
        </button>
        <button 
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          分類管理
        </button>
        <button 
          className={`tab-btn ${activeTab === 'navigation' ? 'active' : ''}`}
          onClick={() => setActiveTab('navigation')}
        >
          導覽列管理
        </button>
      </div>

      {/* 文章管理 */}
      {activeTab === 'articles' && (
        <div className="admin-content">
          <div className="content-header">
            <h2>文章管理 ({articles.length})</h2>
          </div>
          
          <div className="articles-table">
            {articles.length === 0 ? (
              <div className="empty-state">
                <p>還沒有任何文章</p>
                <Link to="/create" className="create-btn">建立第一篇文章</Link>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>標題</th>
                      <th>分類</th>
                      <th>狀態</th>
                      <th>瀏覽次數</th>
                      <th>建立時間</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map(article => (
                      <tr key={article.id}>
                        <td>
                          <div className="article-title">
                            <Link to={`/article/${article.id}`} target="_blank">
                              {article.title}
                            </Link>
                            {article.excerpt && (
                              <p className="article-excerpt">{article.excerpt}</p>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">
                            {article.category || '未分類'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${article.published ? 'published' : 'draft'}`}>
                            {article.published ? '已發佈' : '草稿'}
                          </span>
                        </td>
                        <td>{article.views || 0}</td>
                        <td>{article.createdAt?.toLocaleDateString('zh-TW')}</td>
                        <td>
                          <div className="action-buttons">
                            <Link 
                              to={`/edit/${article.id}`} 
                              className="edit-btn"
                              title="編輯"
                            >
                              ✏️
                            </Link>
                            <button 
                              onClick={() => handleTogglePublish(article.id, article.published)}
                              className={`toggle-btn ${article.published ? 'unpublish' : 'publish'}`}
                              title={article.published ? '下架' : '發佈'}
                            >
                              {article.published ? '📤' : '📥'}
                            </button>
                            <button 
                              onClick={() => handleDeleteArticle(article.id, article.title)}
                              className="delete-btn"
                              title="刪除"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 分類管理 */}
      {activeTab === 'categories' && (
        <div className="admin-content">
          <div className="content-header">
            <h2>分類管理 ({categories.length})</h2>
            <button className="create-btn">➕ 新增分類</button>
          </div>
          
          <div className="categories-grid">
            {categories.map(category => (
              <div key={category.id} className="category-card-admin">
                <div className="category-header">
                  <div className="category-icon">{category.icon || '📝'}</div>
                  <h3>{category.name}</h3>
                </div>
                <p>{category.description}</p>
                <div className="category-stats">
                  <span>文章數: {category.articleCount || 0}</span>
                </div>
                <div className="category-actions">
                  <button className="edit-btn">編輯</button>
                  <button className="delete-btn">刪除</button>
                </div>
              </div>
            ))}
            
            {categories.length === 0 && (
              <div className="empty-state">
                <p>還沒有任何分類</p>
                <button className="create-btn">建立第一個分類</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 導覽列管理標籤頁 */}
      {activeTab === 'navigation' && (
        <NavigationManager />
      )}
    </div>
  );
}

export default AdminDashboard;
