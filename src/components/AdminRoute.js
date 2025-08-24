import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminRoute({ children }) {
  const { currentUser, isAdmin } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin()) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh', 
        flexDirection: 'column',
        textAlign: 'center',
        color: '#666'
      }}>
        <h2>🚫 權限不足</h2>
        <p>抱歉，你沒有權限訪問管理後台。</p>
        <p>只有網站管理員才能使用此功能。</p>
        <button 
          onClick={() => window.history.back()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          返回上一頁
        </button>
      </div>
    );
  }
  
  return children;
}

export default AdminRoute;
