import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword } from '../utils/inputValidation';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 驗證電子郵件
    if (!validateEmail(email)) {
      return setError('請輸入有效的電子郵件地址');
    }
    
    // 驗證密碼
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return setError(`密碼驗證失敗: ${passwordValidation.error}`);
    }

    try {
      setError('');
      setLoading(true);
      
      await login(email, password);
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
      case 'auth/invalid-email':
        return '電子郵件格式不正確';
      default:
        return '登入失敗';
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>🔐 管理員登入</h2>
          <p>只有網站管理員才能登入此系統</p>
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
            {loading ? '處理中...' : '管理員登入'}
          </button>
        </form>

        <div className="back-to-home">
          <Link to="/">← 回到首頁</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
