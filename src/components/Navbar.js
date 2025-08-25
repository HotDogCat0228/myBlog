import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

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
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          My Blog
        </Link>
        
        <div className={`nav-menu ${showMobileMenu ? 'active' : ''}`}>
          {loading ? (
            <div className="nav-loading">載入中...</div>
          ) : navigationItems.length === 0 ? (
            isAdmin() ? (
              <div className="nav-empty">
                <Link to="/admin" className="nav-link">
                  請到管理後台設定導覽列
                </Link>
              </div>
            ) : (
              <div className="nav-empty">
                <span className="nav-link">暫無導覽項目</span>
              </div>
            )
          ) : (
            navigationItems.map(item => (
              <Link 
                key={item.id} 
                to={item.path} 
                className="nav-link" 
                onClick={() => setShowMobileMenu(false)}
                target={item.type === 'external' ? '_blank' : undefined}
                rel={item.type === 'external' ? 'noopener noreferrer' : undefined}
              >
                {item.title}
                {item.type === 'external' && ' ↗'}
              </Link>
            ))
          )}
          
          {currentUser ? (
            <div className="nav-user">
              {isAdmin() ? (
                <>
                  <Link to="/admin" className="nav-link" onClick={() => setShowMobileMenu(false)}>
                    管理後台
                  </Link>
                  <Link to="/create" className="nav-link" onClick={() => setShowMobileMenu(false)}>
                    新增文章
                  </Link>
                  <span className="nav-user-info">
                    👑 管理員: {currentUser.email}
                  </span>
                </>
              ) : (
                <span className="nav-user-info">
                   訪客: {currentUser.email}
                </span>
              )}
              <button onClick={handleLogout} className="nav-button">
                登出
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-link nav-admin-login" onClick={() => setShowMobileMenu(false)}>
              管理員登入
            </Link>
          )}
        </div>
        
        <div className="nav-hamburger" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
