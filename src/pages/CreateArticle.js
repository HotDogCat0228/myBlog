import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './CreateArticle.css';

function CreateArticle() {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('# 開始寫作\n\n在這裡開始你的文章...');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
    } catch (error) {
      console.error('獲取分類失敗:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('請輸入文章標題');
      return;
    }
    
    if (!content.trim()) {
      alert('請輸入文章內容');
      return;
    }
    
    if (!excerpt.trim()) {
      alert('請輸入文章摘要');
      return;
    }

    setLoading(true);
    
    try {
      const articleData = {
        title,
        excerpt,
        content,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        coverImage: coverImageUrl || '',
        published,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: currentUser?.email || 'Anonymous',
        views: 0
      };

      await addDoc(collection(db, 'articles'), articleData);
      alert('文章創建成功！');
      navigate('/admin');
    } catch (error) {
      console.error('創建文章失敗:', error);
      alert('創建文章失敗，請再試一次');
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (value) => {
    setContent(value || '');
  };

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  if (!currentUser) {
    return <div>請先登入</div>;
  }

  return (
    <div className="create-article">
      <div className="create-article-header">
        <h1>創建新文章</h1>
        <div className="article-actions">
          <button
            type="button"
            className={`preview-btn ${previewMode ? 'active' : ''}`}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? '編輯模式' : '預覽模式'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="create-article-form">
        <div className="form-group">
          <label htmlFor="title">文章標題</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="輸入文章標題"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">文章摘要</label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="輸入文章摘要"
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">分類</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">選擇分類</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tags">標籤</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="輸入標籤，用逗號分隔"
          />
        </div>

        <div className="form-group">
          <label htmlFor="coverImageUrl">封面圖片網址</label>
          <input
            type="url"
            id="coverImageUrl"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="輸入圖片網址（選填）"
          />
          {coverImageUrl && (
            <div className="cover-preview">
              <p>封面預覽：</p>
              <img
                src={coverImageUrl}
                alt="封面預覽"
                style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <p style={{ display: 'none', color: 'red' }}>圖片載入失敗</p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            立即發布
          </label>
        </div>

        <div className="content-editor">
          <h3>文章內容</h3>
          <div className="editor-container">
            {previewMode ? (
              <div className="markdown-preview">
                <ReactMarkdown components={components}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <Editor
                height="500px"
                defaultLanguage="markdown"
                value={content}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  fontSize: 14,
                  lineNumbers: 'on'
                }}
              />
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/admin')}
          >
            取消
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? '創建中...' : '創建文章'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateArticle;
