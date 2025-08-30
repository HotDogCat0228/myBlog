import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
// 使用 CodeMirror 替代 Monaco Editor
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
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
import './CreateArticle.css';

function CreateArticleDebug() {
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
    },
  };

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
        createdAt: new Date(),
        updatedAt: new Date(),
        author: currentUser?.email || 'Anonymous',
        views: 0
      };

      await addDoc(collection(db, 'articles'), articleData);
      
      alert('文章發布成功！');
      navigate('/admin');
    } catch (error) {
      console.error('發布文章失敗:', error);
      alert('發布文章失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div>請先登入</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">新增文章 (除錯版本)</h1>
      
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
          <label className="block text-sm font-medium mb-2">分類</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">選擇分類</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">標籤 (用逗號分隔)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="React, JavaScript, 前端開發"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">封面圖片 URL</label>
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">內容</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`px-3 py-1 text-sm rounded ${!previewMode ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setPreviewMode(false)}
              >
                📝 編輯
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-sm rounded ${previewMode ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setPreviewMode(true)}
              >
                👀 預覽
              </button>
            </div>
          </div>
          {previewMode ? (
            <div className="border border-gray-300 rounded-md p-4 min-h-[400px] bg-white prose max-w-none">
              <ReactMarkdown components={components}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <CodeMirror
                value={content}
                height="400px"
                extensions={[markdown()]}
                theme={oneDark}
                onChange={(value) => setContent(value)}
                placeholder="輸入文章內容 (支援 Markdown)..."
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightSelectionMatches: true,
                  history: true,
                }}
              />
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="mr-2"
            />
            立即發布
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? '發布中...' : '發布文章'}
        </button>
      </form>
    </div>
  );
}

export default CreateArticleDebug;
