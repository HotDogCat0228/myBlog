import React, { useState } from 'react';
import { generateSitemap, generateRobotsTxt } from '../utils/seoUtils';

function SEOTools() {
  const [loading, setLoading] = useState(false);
  const [sitemap, setSitemap] = useState('');
  const [robotsTxt, setRobotsTxt] = useState('');

  const handleGenerateSitemap = async () => {
    setLoading(true);
    try {
      const sitemapContent = await generateSitemap();
      if (sitemapContent) {
        setSitemap(sitemapContent);
        // 創建下載連結
        const blob = new Blob([sitemapContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Sitemap 已生成並下載！請將 sitemap.xml 上傳到網站根目錄。');
      }
    } catch (error) {
      console.error('生成 sitemap 失敗:', error);
      alert('生成 sitemap 失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRobotsTxt = () => {
    const robotsContent = generateRobotsTxt();
    setRobotsTxt(robotsContent);
    
    // 創建下載連結
    const blob = new Blob([robotsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('robots.txt 已生成並下載！請將 robots.txt 上傳到網站根目錄。');
  };

  const seoTips = [
    {
      title: '文章標題優化',
      description: '使用具描述性且包含關鍵字的標題，長度建議在 30-60 字元間',
      icon: '📝'
    },
    {
      title: '元描述設置',
      description: '為每篇文章撰寫獨特的元描述，長度建議在 150-160 字元間',
      icon: '📄'
    },
    {
      title: '圖片優化',
      description: '為圖片添加 alt 屬性，使用描述性的檔名，壓縮圖片大小',
      icon: '🖼️'
    },
    {
      title: '內部連結',
      description: '在文章中添加相關內部連結，提高頁面間的關聯性',
      icon: '🔗'
    },
    {
      title: '載入速度',
      description: '優化圖片、壓縮資源，確保頁面載入速度快速',
      icon: '⚡'
    },
    {
      title: '結構化資料',
      description: '使用結構化資料標記，幫助搜尋引擎理解內容',
      icon: '🏗️'
    }
  ];

  return (
    <div className="seo-tools">
      <div className="section-header">
        <h2>🔍 SEO 工具</h2>
      </div>

      <div className="seo-actions">
        <div className="tool-card">
          <h3>📋 Sitemap 生成器</h3>
          <p>自動生成包含所有文章和分類頁面的 sitemap.xml</p>
          <button 
            onClick={handleGenerateSitemap}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? '生成中...' : '生成 Sitemap'}
          </button>
        </div>

        <div className="tool-card">
          <h3>🤖 Robots.txt 生成器</h3>
          <p>生成搜尋引擎爬蟲指引文件</p>
          <button 
            onClick={handleGenerateRobotsTxt}
            className="btn btn-primary"
          >
            生成 Robots.txt
          </button>
        </div>
      </div>

      <div className="seo-tips">
        <h3>💡 SEO 優化建議</h3>
        <div className="tips-grid">
          {seoTips.map((tip, index) => (
            <div key={index} className="tip-card">
              <div className="tip-icon">{tip.icon}</div>
              <div className="tip-content">
                <h4>{tip.title}</h4>
                <p>{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="seo-checklist">
        <h3>✅ SEO 檢查清單</h3>
        <div className="checklist">
          <div className="checklist-item">
            <input type="checkbox" id="title-tags" />
            <label htmlFor="title-tags">每個頁面都有獨特的 title 標籤</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="meta-desc" />
            <label htmlFor="meta-desc">每個頁面都有獨特的 meta description</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="heading-structure" />
            <label htmlFor="heading-structure">適當的標題結構 (H1, H2, H3)</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="alt-tags" />
            <label htmlFor="alt-tags">所有圖片都有 alt 屬性</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="internal-links" />
            <label htmlFor="internal-links">適當的內部連結結構</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="mobile-friendly" />
            <label htmlFor="mobile-friendly">響應式設計（手機友善）</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="loading-speed" />
            <label htmlFor="loading-speed">快速的頁面載入速度</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="sitemap-submitted" />
            <label htmlFor="sitemap-submitted">Sitemap 已提交到 Google Search Console</label>
          </div>
        </div>
      </div>

      {sitemap && (
        <div className="generated-content">
          <h3>生成的 Sitemap</h3>
          <pre className="code-preview">{sitemap}</pre>
        </div>
      )}

      {robotsTxt && (
        <div className="generated-content">
          <h3>生成的 Robots.txt</h3>
          <pre className="code-preview">{robotsTxt}</pre>
        </div>
      )}
    </div>
  );
}

export default SEOTools;
