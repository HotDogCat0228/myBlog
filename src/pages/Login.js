import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      return setError('密碼至少需要 6 個字符');
    }

    try {
      setError('');
      setLoading(true);
      
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      
      navigate('/admin');
    } catch (error) {
      console.error('認證錯誤:', error);
      setError(getErrorMessage(error.code));
    }
    
    setLoading(false);
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return '找不到此用戶';
      case 'auth/wrong-password':
        return '密碼錯誤';
      case 'auth/email-already-in-use':
        return '此電子郵件已被使用';
      case 'auth/weak-password':
        return '密碼強度不足';
      case 'auth/invalid-email':
        return '電子郵件格式不正確';
      default:
        return isLogin ? '登入失敗' : '註冊失敗';
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>🔐 {isLogin ? '管理員登入' : '創建管理員帳號'}</h2>
          <p>{isLogin ? '只有網站管理員才能登入此系統' : '創建第一個管理員帳號'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">管理員電子郵件</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="請輸入管理員電子郵件"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="請輸入您的密碼"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? '處理中...' : (isLogin ? '管理員登入' : '創建管理員帳號')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? '需要創建管理員帳號？' : '已有管理員帳號？'}
            <button 
              type="button"
              className="toggle-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? '創建帳號' : '立即登入'}
            </button>
          </p>
        </div>

        <div className="back-to-home">
          <Link to="/">← 回到首頁</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
