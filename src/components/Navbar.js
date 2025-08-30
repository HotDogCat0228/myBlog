import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [navigationItems, setNavigationItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 載入導覽列項目
  useEffect(() => {
    const loadNavigation = async () => {
      try {
        const q = query(collection(db, 'navigation'), orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const navItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // 直接使用從 Firestore 載入的導覽項目
        setNavigationItems(navItems);
      } catch (error) {
        console.error('載入導覽列失敗:', error);
        // 載入失敗時顯示空的導覽列
        setNavigationItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadNavigation();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 品牌 Logo */}
          <Link 
            to="/" 
            className="text-white text-2xl font-bold text-shadow hover:transform hover:-translate-y-0.5 transition-all duration-300"
          >
            My Blog
          </Link>
          
          {/* 桌面導覽選單 */}
          <div className={`hidden md:flex md:items-center md:space-x-6`}>
            {loading ? (
              <div className="text-gray-200 text-sm px-4 py-2">載入中...</div>
            ) : navigationItems.length === 0 ? (
              isAdmin() ? (
                <Link 
                  to="/admin" 
                  className="text-white/90 hover:text-white px-4 py-2 rounded-full border border-white/30 hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
                >
                  請到管理後台設定導覽列
                </Link>
              ) : (
                <span className="text-white/80 px-4 py-2">暫無導覽項目</span>
              )
            ) : (
              navigationItems.map(item => (
                <Link 
                  key={item.id} 
                  to={item.path} 
                  className="text-white/90 hover:text-white px-4 py-2 rounded-full hover:bg-white/15 transition-all duration-300 hover:-translate-y-0.5 font-medium relative group"
                  target={item.type === 'external' ? '_blank' : undefined}
                  rel={item.type === 'external' ? 'noopener noreferrer' : undefined}
                >
                  {item.title}
                  {item.type === 'external' && ' ↗'}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
              ))
            )}
            
            {/* 用戶區域 */}
            {currentUser ? (
              <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-white/20">
                {isAdmin() ? (
                  <>
                    <Link 
                      to="/admin" 
                      className="text-white/90 hover:text-white px-4 py-2 rounded-full hover:bg-white/15 transition-all duration-300 hover:-translate-y-0.5 font-medium"
                    >
                      管理後台
                    </Link>
                    <Link 
                      to="/create" 
                      className="text-white/90 hover:text-white px-4 py-2 rounded-full hover:bg-white/15 transition-all duration-300 hover:-translate-y-0.5 font-medium"
                    >
                      新增文章
                    </Link>
                    <span className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm border border-white/20">
                      👑 管理員: {currentUser.email}
                    </span>
                  </>
                ) : (
                  <span className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm border border-white/20">
                    訪客: {currentUser.email}
                  </span>
                )}
                <button 
                  onClick={handleLogout} 
                  className="bg-white/20 text-white px-4 py-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 hover:-translate-y-0.5 font-medium"
                >
                  登出
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-yellow-400/20 text-white px-4 py-2 rounded-full border border-yellow-400/50 hover:bg-yellow-400/30 transition-all duration-300 hover:-translate-y-0.5 font-medium"
              >
                管理員登入
              </Link>
            )}
          </div>
          
          {/* 手機選單按鈕 */}
          <div className="md:hidden">
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 手機導覽選單 */}
        <div className={`md:hidden transition-all duration-300 ${showMobileMenu ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="py-4 space-y-2 border-t border-white/20">
            {loading ? (
              <div className="text-gray-200 text-sm px-4 py-2">載入中...</div>
            ) : navigationItems.length === 0 ? (
              isAdmin() ? (
                <Link 
                  to="/admin" 
                  className="block text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 border border-white/30"
                  onClick={() => setShowMobileMenu(false)}
                >
                  請到管理後台設定導覽列
                </Link>
              ) : (
                <span className="block text-white/80 px-4 py-3">暫無導覽項目</span>
              )
            ) : (
              navigationItems.map(item => (
                <Link 
                  key={item.id} 
                  to={item.path} 
                  className="block text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium"
                  onClick={() => setShowMobileMenu(false)}
                  target={item.type === 'external' ? '_blank' : undefined}
                  rel={item.type === 'external' ? 'noopener noreferrer' : undefined}
                >
                  {item.title}
                  {item.type === 'external' && ' ↗'}
                </Link>
              ))
            )}
            
            {/* 手機用戶區域 */}
            {currentUser ? (
              <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                {isAdmin() ? (
                  <>
                    <Link 
                      to="/admin" 
                      className="block text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      管理後台
                    </Link>
                    <Link 
                      to="/create" 
                      className="block text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      新增文章
                    </Link>
                    <div className="bg-white/10 text-white/90 px-4 py-2 rounded-lg text-sm border border-white/20 mx-4">
                      👑 管理員: {currentUser.email}
                    </div>
                  </>
                ) : (
                  <div className="bg-white/10 text-white/90 px-4 py-2 rounded-lg text-sm border border-white/20 mx-4">
                    訪客: {currentUser.email}
                  </div>
                )}
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left bg-white/20 text-white px-4 py-3 rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300 font-medium mx-4"
                >
                  登出
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-white/20">
                <Link 
                  to="/login" 
                  className="block bg-yellow-400/20 text-white px-4 py-3 rounded-lg border border-yellow-400/50 hover:bg-yellow-400/30 transition-all duration-300 font-medium mx-4"
                  onClick={() => setShowMobileMenu(false)}
                >
                  管理員登入
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
