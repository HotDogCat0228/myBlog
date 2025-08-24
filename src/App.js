import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import CategoryPage from './pages/CategoryPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CreateArticle from './pages/CreateArticle';
import EditArticle from './pages/EditArticle';
import AdminRoute from './components/AdminRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/create" element={
              <AdminRoute>
                <CreateArticle />
              </AdminRoute>
            } />
            <Route path="/edit/:id" element={
              <AdminRoute>
                <EditArticle />
              </AdminRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
