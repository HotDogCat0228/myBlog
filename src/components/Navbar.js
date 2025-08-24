import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
          <Link to="/" className="nav-link" onClick={() => setShowMobileMenu(false)}>
            首頁
          </Link>
          <Link to="/category/react" className="nav-link" onClick={() => setShowMobileMenu(false)}>
            React
          </Link>
          <Link to="/category/javascript" className="nav-link" onClick={() => setShowMobileMenu(false)}>
            JavaScript
          </Link>
          <Link to="/category/css" className="nav-link" onClick={() => setShowMobileMenu(false)}>
            CSS
          </Link>
          
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
