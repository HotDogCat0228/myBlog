import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import NavigationManager from '../components/NavigationManager';
import SEOTools from '../components/SEOTools';
import CategoryManager from '../components/CategoryManager';

function AdminDashboard() {
  const [articles, setArticles] = useState([]);
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
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary-600"></div>
        <p className="mt-4 text-gray-600">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 管理後台標題 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">管理後台</h1>
          <Link 
            to="/create" 
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新增文章
          </Link>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body flex items-center">
              <div className="text-4xl mr-4">📝</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalArticles}</div>
                <div className="text-sm text-gray-600">總文章數</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body flex items-center">
              <div className="text-4xl mr-4">✅</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.publishedArticles}</div>
                <div className="text-sm text-gray-600">已發佈文章</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body flex items-center">
              <div className="text-4xl mr-4">👀</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalViews}</div>
                <div className="text-sm text-gray-600">總瀏覽次數</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body flex items-center">
              <div className="text-4xl mr-4">🏷️</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCategories}</div>
                <div className="text-sm text-gray-600">文章分類</div>
              </div>
            </div>
          </div>
        </div>

        {/* 標籤頁導覽 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <nav className="flex overflow-x-auto">
            <button 
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                activeTab === 'articles' 
                  ? 'border-primary-600 text-primary-600 bg-primary-50' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('articles')}
            >
              文章管理
            </button>
            <button 
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                activeTab === 'categories' 
                  ? 'border-primary-600 text-primary-600 bg-primary-50' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('categories')}
            >
              分類管理
            </button>
            <button 
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                activeTab === 'navigation' 
                  ? 'border-primary-600 text-primary-600 bg-primary-50' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('navigation')}
            >
              導覽列管理
            </button>
            <button 
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                activeTab === 'seo' 
                  ? 'border-primary-600 text-primary-600 bg-primary-50' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('seo')}
            >
              SEO 工具
            </button>
          </nav>
        </div>

        {/* 文章管理 */}
        {activeTab === 'articles' && (
          <div className="card animate-fade-in">
            <div className="card-header">
              <h2 className="text-xl font-bold text-gray-900">
                文章管理 ({articles.length})
              </h2>
            </div>
            
            <div className="card-body p-0">
              {articles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-600 mb-6">還沒有任何文章</p>
                  <Link to="/create" className="btn-primary">
                    建立第一篇文章
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          標題
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          分類
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          狀態
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          瀏覽次數
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          建立時間
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {articles.map(article => (
                        <tr key={article.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div>
                              <Link 
                                to={`/article/${article.id}`} 
                                target="_blank"
                                className="text-primary-600 hover:text-primary-700 font-medium line-clamp-1"
                              >
                                {article.title}
                              </Link>
                              {article.excerpt && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {article.excerpt}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {article.category || '未分類'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              article.published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {article.published ? '已發佈' : '草稿'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {article.views || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {article.createdAt?.toLocaleDateString('zh-TW')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Link 
                                to={`/edit/${article.id}`}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-150"
                                title="編輯"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>
                              <button 
                                onClick={() => handleTogglePublish(article.id, article.published)}
                                className={`p-2 rounded-full transition-colors duration-150 ${
                                  article.published 
                                    ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50' 
                                    : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                }`}
                                title={article.published ? '下架' : '發佈'}
                              >
                                {article.published ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                              <button 
                                onClick={() => handleDeleteArticle(article.id, article.title)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-150"
                                title="刪除"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
          <div className="animate-fade-in">
            <CategoryManager />
          </div>
        )}

        {/* 導覽列管理標籤頁 */}
        {activeTab === 'navigation' && (
          <div className="animate-fade-in">
            <NavigationManager />
          </div>
        )}

        {/* SEO 工具標籤頁 */}
        {activeTab === 'seo' && (
          <div className="animate-fade-in">
            <SEOTools />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
