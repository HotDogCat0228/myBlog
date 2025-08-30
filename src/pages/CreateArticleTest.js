import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function CreateArticleTest() {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Test submit:', { title, excerpt, content });
    alert('測試提交成功');
  };

  if (!currentUser) {
    return <div>請先登入</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">新增文章 (測試版本)</h1>
      
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">標題</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="輸入文章標題..."
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">摘要</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            placeholder="輸入文章摘要..."
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">內容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={10}
            placeholder="輸入文章內容..."
            required
          />
        </div>

        <button
          type="submit"
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
        >
          測試提交
        </button>
      </form>
    </div>
  );
}

export default CreateArticleTest;
