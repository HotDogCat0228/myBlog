// Firebase 初始化腳本
// 在完成 Firebase 配置後，可以運行此腳本來建立初始資料

import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// 初始分類資料
const initialCategories = [
  {
    id: 'react',
    name: 'React',
    slug: 'react',
    description: 'React 開發相關文章，包含 Hooks、狀態管理、組件設計等',
    icon: '⚛️',
    color: '#61DAFB',
    articleCount: 0
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    slug: 'javascript',
    description: 'JavaScript 語言特性、ES6+ 新功能、異步編程等',
    icon: '📜',
    color: '#F7DF1E',
    articleCount: 0
  },
  {
    id: 'css',
    name: 'CSS',
    slug: 'css',
    description: 'CSS 樣式設計、動畫效果、響應式佈局等',
    icon: '🎨',
    color: '#1572B6',
    articleCount: 0
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    slug: 'typescript',
    description: 'TypeScript 類型系統、進階用法、與 JavaScript 整合',
    icon: '🔷',
    color: '#3178C6',
    articleCount: 0
  },
  {
    id: 'performance',
    name: 'Performance',
    slug: 'performance',
    description: '前端性能優化、打包優化、載入速度提升',
    icon: '⚡',
    color: '#FF6B35',
    articleCount: 0
  },
  {
    id: 'tools',
    name: 'Tools',
    slug: 'tools',
    description: '開發工具、編輯器配置、工作流程優化',
    icon: '🔧',
    color: '#8B5CF6',
    articleCount: 0
  }
];

// 初始文章資料
const initialArticles = [
  {
    title: 'React Hooks 完全入門指南',
    excerpt: '從零開始學習 React Hooks，包含 useState、useEffect、useContext 等常用 Hooks 的使用方法和最佳實踐。',
    content: `# React Hooks 完全入門指南

React Hooks 是 React 16.8 引入的新功能，讓你能在函數組件中使用狀態和其他 React 特性。

## useState - 狀態管理

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>你點擊了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        點擊我
      </button>
    </div>
  );
}
\`\`\`

## useEffect - 副作用處理

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 相當於 componentDidMount 和 componentDidUpdate
  useEffect(() => {
    document.title = \`你點擊了 \${count} 次\`;
  });

  return (
    <div>
      <p>你點擊了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        點擊我
      </button>
    </div>
  );
}
\`\`\`

## 自定義 Hooks

你也可以建立自己的 Hooks：

\`\`\`javascript
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}
\`\`\`

這只是 React Hooks 的冰山一角，還有更多強大的功能等待探索！`,
    category: 'react',
    tags: ['React', 'Hooks', 'useState', 'useEffect'],
    published: true,
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'CSS Grid 與 Flexbox 的選擇指南',
    excerpt: '深入比較 CSS Grid 和 Flexbox 的特點和使用場景，幫助你選擇最適合的佈局方案。',
    content: `# CSS Grid 與 Flexbox 的選擇指南

CSS Grid 和 Flexbox 都是現代 CSS 佈局的重要工具，但它們各有特點和最佳使用場景。

## Flexbox - 一維佈局

Flexbox 主要用於一維佈局（行或列）：

\`\`\`css
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.flex-item {
  flex: 1;
}
\`\`\`

### 適用場景：
- 導航選單
- 卡片內容對齊
- 工具列佈局

## CSS Grid - 二維佈局

CSS Grid 適合複雜的二維佈局：

\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
\`\`\`

### 適用場景：
- 整體頁面佈局
- 圖片畫廊
- 儀表板設計

## 如何選擇？

- **一維佈局** → 使用 Flexbox
- **二維佈局** → 使用 CSS Grid
- **組件內部對齊** → 使用 Flexbox
- **頁面整體佈局** → 使用 CSS Grid

兩者可以完美結合使用！`,
    category: 'css',
    tags: ['CSS', 'Grid', 'Flexbox', '佈局'],
    published: true,
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 初始化資料庫
export async function initializeFirebaseData() {
  try {
    console.log('開始初始化資料...');
    
    // 建立分類
    for (const category of initialCategories) {
      await setDoc(doc(db, 'categories', category.id), category);
      console.log(`分類 ${category.name} 建立完成`);
    }
    
    // 建立文章
    for (const article of initialArticles) {
      const docRef = await addDoc(collection(db, 'articles'), article);
      console.log(`文章 ${article.title} 建立完成，ID: ${docRef.id}`);
    }
    
    console.log('✅ 初始化完成！');
    return true;
  } catch (error) {
    console.error('❌ 初始化失敗:', error);
    return false;
  }
}

// 使用方式：
// 在瀏覽器控制台中執行：
// import('./initializeData.js').then(module => module.initializeFirebaseData());
