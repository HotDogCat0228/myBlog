import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  validateTitle, 
  validateContent, 
  isValidUrl, 
  sanitizeText,
  validateExcerpt 
} from '../utils/inputValidation';
import './CreateArticle.css'; // 重用創建文章的樣式

function EditArticle() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || '');
          setExcerpt(data.excerpt || '');
          setContent(data.content || '');
          setCategory(data.category || '');
          setTags(data.tags ? data.tags.join(', ') : '');
          setCoverImageUrl(data.coverImage || '');
          setPublished(data.published || false);
        } else {
          alert('文章不存在');
          navigate('/admin');
        }
      } catch (error) {
        console.error('獲取文章失敗:', error);
        alert('獲取文章失敗');
      }
    };

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
    
    const loadData = async () => {
      await Promise.all([
        fetchArticle(),
        fetchCategories()
      ]);
      setInitialLoading(false);
    };

    loadData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 驗證標題
    const titleValidation = validateTitle(title);
    if (!titleValidation.isValid) {
      alert(`標題驗證失敗: ${titleValidation.error}`);
      return;
    }
    
    // 驗證內容
    const contentValidation = validateContent(content);
    if (!contentValidation.isValid) {
      alert(`內容驗證失敗: ${contentValidation.error}`);
      return;
    }
    
    // 驗證摘要
    if (!excerpt.trim()) {
      alert('請輸入文章摘要');
      return;
    }
    
    const excerptValidation = validateExcerpt(excerpt);
    if (!excerptValidation.isValid) {
      alert(`摘要驗證失敗: ${excerptValidation.error}`);
      return;
    }
    
    // 驗證封面圖片 URL（如果有提供）
    if (coverImageUrl && !isValidUrl(coverImageUrl)) {
      alert('封面圖片 URL 格式不正確');
      return;
    }

    setLoading(true);
    
    try {
      // 清理和安全處理輸入數據
      const sanitizedTitle = sanitizeText(title);
      const sanitizedExcerpt = sanitizeText(excerpt);
      const sanitizedTags = tags.split(',')
        .map(tag => sanitizeText(tag.trim()))
        .filter(tag => tag && tag.length <= 50); // 限制標籤長度
        
      const articleData = {
        title: sanitizedTitle,
        excerpt: sanitizedExcerpt,
        content,
        category,
        tags: sanitizedTags,
        coverImage: coverImageUrl || '',
        published,
        updatedAt: new Date()
      };

      const docRef = doc(db, 'articles', id);
      await updateDoc(docRef, articleData);
      alert('文章更新成功！');
      navigate('/admin');
    } catch (error) {
      console.error('更新文章失敗:', error);
      alert('更新文章失敗，請再試一次');
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

  if (initialLoading) {
    return (
      <div className="loading-container">
        <div className="loading">載入中...</div>
      </div>
    );
  }

  return (
    <div className="create-article">
      <div className="create-article-header">
        <h1>編輯文章</h1>
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
          <div className="editor-header">
            <h3>文章內容</h3>
            <div className="editor-mode-toggle">
              <button
                type="button"
                className={`mode-btn ${!previewMode ? 'active' : ''}`}
                onClick={() => setPreviewMode(false)}
              >
                📝 編輯模式
              </button>
              <button
                type="button"
                className={`mode-btn ${previewMode ? 'active' : ''}`}
                onClick={() => setPreviewMode(true)}
              >
                👀 預覽模式
              </button>
            </div>
          </div>
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
            {loading ? '更新中...' : '更新文章'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditArticle;
