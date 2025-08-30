import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SEOHead from '../components/SEOHead';
import './ArticleDetail.css';

function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {        
        if (!id) {
          setError('文章 ID 無效');
          setLoading(false);
          return;
        }
        
        const articleDoc = doc(db, 'articles', id);
        const docSnap = await getDoc(articleDoc);
        
        if (docSnap.exists()) {
          const rawData = docSnap.data();
          
          const articleData = {
            id: docSnap.id,
            ...rawData,
            createdAt: rawData.createdAt?.toDate(),
            updatedAt: rawData.updatedAt?.toDate()
          };
          
          setArticle(articleData);
          
          // 增加瀏覽次數
          try {
            await updateDoc(articleDoc, {
              views: increment(1)
            });
          } catch (viewError) {
            console.warn('更新瀏覽次數失敗:', viewError);
            // 不影響文章顯示
          }
          
        } else {
          setError('文章不存在');
        }
      } catch (error) {
        console.error('獲取文章失敗:', error);
        setError(`載入文章時發生錯誤: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    } else {
      setError('文章 ID 無效');
      setLoading(false);
    }
  }, [id]);

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>載入中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>😔 {error}</h2>
        <p>請檢查文章連結是否正確，或稍後再試。</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="error-container">
        <h2>😔 找不到文章</h2>
        <p>這篇文章可能已被刪除或移動。</p>
      </div>
    );
  }

  return (
    <div className="article-detail">
      <SEOHead 
        title={article.title}
        description={article.excerpt}
        keywords={`${article.category}, ${article.tags ? article.tags.join(', ') : ''}`}
        image={article.coverImage}
        url={`/article/${id}`}
        type="article"
        author={article.author}
        publishedTime={article.createdAt?.toISOString()}
        modifiedTime={article.updatedAt?.toISOString()}
        category={article.category}
        tags={article.tags || []}
      />
      
      <article className="article-container">
        {article.coverImage && (
          <div className="article-cover">
            <img src={article.coverImage} alt={article.title} />
          </div>
        )}
        
        <header className="article-header">
          <div className="article-meta">
            <span className="category-tag">{article.category}</span>
            <span className="article-date">
              {article.createdAt?.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="article-views">{article.views || 0} 次瀏覽</span>
          </div>
          
          <h1 className="article-title">{article.title}</h1>
          
          {article.excerpt && (
            <p className="article-excerpt">{article.excerpt}</p>
          )}
          
          {article.tags && article.tags.length > 0 && (
            <div className="article-tags">
              {article.tags.map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>
        
        <div className="article-content">
          <ReactMarkdown components={components}>
            {article.content}
          </ReactMarkdown>
        </div>
        
        <footer className="article-footer">
          <div className="article-info">
            {article.author && (
              <p>作者：{article.author}</p>
            )}
            {article.updatedAt && (
              <p>最後更新：{article.updatedAt?.toLocaleDateString('zh-TW')}</p>
            )}
          </div>
        </footer>
      </article>
    </div>
  );
}

export default ArticleDetail;
