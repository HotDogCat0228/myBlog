import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

function Home() {
  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchArticles(),
          fetchCategories()
        ]);
      } catch (error) {
        console.error('載入資料失敗:', error);
        // 如果 Firebase 載入失敗，使用靜態資料作為後備
        loadMockData();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchArticles = async () => {
    try {
      // 獲取已發布的文章，按建立時間排序
      const articlesQuery = query(
        collection(db, 'articles'),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(articlesQuery);
      const articlesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      console.log('載入的文章數量:', articlesData.length);
      setArticles(articlesData);
      
      // 設置精選文章（取前3篇）
      setFeaturedArticles(articlesData.slice(0, 3));
      
    } catch (error) {
      console.error('載入文章失敗:', error);
      
      // 檢查是否為索引錯誤
      if (error.message && error.message.includes('index')) {
        console.warn('需要建立索引，使用備用查詢方式');
        
        try {
          // 備用方案：只使用 published 查詢，客戶端排序
          const fallbackQuery = query(
            collection(db, 'articles'),
            where('published', '==', true)
          );
          const fallbackSnapshot = await getDocs(fallbackQuery);
          const fallbackData = fallbackSnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }))
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 20);
          
          console.log('備用查詢載入的文章數量:', fallbackData.length);
          setArticles(fallbackData);
          setFeaturedArticles(fallbackData.slice(0, 3));
          return;
        } catch (fallbackError) {
          console.error('備用查詢也失敗:', fallbackError);
        }
      }
      
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      // 先獲取所有分類
      const categoriesQuery = collection(db, 'categories');
      const querySnapshot = await getDocs(categoriesQuery);
      let categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 獲取所有已發布文章來計算每個分類的文章數量
      try {
        const articlesQuery = query(
          collection(db, 'articles'),
          where('published', '==', true)
        );
        const articlesSnapshot = await getDocs(articlesQuery);
        
        // 計算每個分類的文章數量
        const categoryArticleCount = {};
        articlesSnapshot.docs.forEach(doc => {
          const articleData = doc.data();
          const category = articleData.category;
          if (category) {
            categoryArticleCount[category] = (categoryArticleCount[category] || 0) + 1;
          }
        });

        // 更新分類資料，加入實際的文章數量
        categoriesData = categoriesData.map(category => ({
          ...category,
          articleCount: categoryArticleCount[category.name] || categoryArticleCount[category.slug] || 0
        }));

        console.log('分類文章數量統計:', categoryArticleCount);
        console.log('更新後的分類資料:', categoriesData);

      } catch (articleError) {
        console.error('計算分類文章數量失敗:', articleError);
        // 如果計算失敗，使用原始的 articleCount
      }

      setCategories(categoriesData);
    } catch (error) {
      console.error('載入分類失敗:', error);
      // 分類載入失敗不影響主要功能
    }
  };

  const loadMockData = () => {
    // 保留原有的靜態資料作為後備
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

    setArticles(mockArticles);
    setFeaturedArticles(mockArticles.slice(0, 3));
    setCategories(mockCategories);
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
    <div className="min-h-screen">
      <SEOHead 
        title="首頁"
        description="React + Firebase 部落格系統 - 分享程式開發心得和技術文章，包含 React、JavaScript、CSS、前端開發等主題"
        keywords="React, Firebase, 部落格, JavaScript, 前端開發, 程式設計, 技術文章, CSS, HTML, 程式教學"
        url="/"
        type="website"
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-24 px-5 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl font-bold mb-6 text-shadow">歡迎來到我的部落格</h1>
          <p className="text-xl mb-8 opacity-90">分享技術知識、學習心得與生活感悟</p>
          <Link 
            to="/create" 
            className="inline-block bg-white/20 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:bg-white/30 hover:-translate-y-1 hover:shadow-xl border-2 border-white/30"
          >
            開始寫作
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Articles */}
        <section className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
              精選文章
              <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-primary rounded-full"></span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
            {featuredArticles.map(article => (
              <Link 
                key={article.id}
                to={`/article/${article.id}`}
                className="block transition-transform duration-300 hover:-translate-y-2"
              >
                <article className="card hover:shadow-xl transition-shadow duration-300 group h-full">
                  {article.coverImage && (
                    <div className="overflow-hidden">
                      <img 
                        src={article.coverImage} 
                        alt={article.title} 
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="card-body">
                    <span className="inline-block bg-gradient-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {article.category}
                    </span>
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 mb-4">{article.excerpt}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{article.createdAt?.toLocaleDateString('zh-TW')}</span>
                      <span>5 分鐘閱讀</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
              文章分類
              <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-primary rounded-full"></span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-bounce-in">
            {categories.map(category => (
              <Link 
                key={category.id} 
                to={`/category/${category.slug}`}
                className="relative overflow-hidden rounded-xl p-8 text-white text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
                style={{ backgroundColor: category.color || '#6c63ff' }}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{category.icon || '📝'}</div>
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90 mb-4">{category.description}</p>
                  <span className="inline-block bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">
                    {category.articleCount || 0} 篇文章
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Articles */}
        <section className="py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
              最新文章
              <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-primary rounded-full"></span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {articles.map(article => (
              <article 
                key={article.id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                {article.coverImage && (
                  <div className="overflow-hidden">
                    <img 
                      src={article.coverImage} 
                      alt={article.title} 
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <span className="inline-block bg-gradient-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {article.category}
                  </span>
                  <h3 className="text-lg font-bold mb-3 line-clamp-2">
                    <Link 
                      to={`/article/${article.id}`}
                      className="text-gray-900 hover:text-primary-600 transition-colors duration-200"
                    >
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 line-clamp-3 mb-4">{article.excerpt}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{article.createdAt?.toLocaleDateString('zh-TW')}</span>
                    <span>{article.views || 0} 次瀏覽</span>
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
