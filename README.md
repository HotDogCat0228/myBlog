# My Blog - React + Firebase 部落格系統

## 🌟 功能特色

- ✅ React 19 + Firebase 架構
- ✅ Markdown 編輯器支援
- ✅ 程式碼語法高亮
- ✅ 響應式設計
- ✅ 管理員權限系統
- ✅ 文章分類管理
- ✅ 即時預覽功能

## 🚀 線上訪問

**網站地址**: https://hotdogcat0228.github.io/myBlog

## 🔐 管理功能

- 只有管理員 (van880228@gmail.com) 可以登入後台
- 管理員可以創建、編輯、刪除文章
- 一般訪客可以自由瀏覽所有已發布的文章

## 🛠️ 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm start

# 建置生產版本
npm run build

# 部署到 GitHub Pages
npm run deploy
```

## 📦 技術棧

- **前端**: React 19, React Router DOM
- **編輯器**: Monaco Editor
- **Markdown**: React Markdown + Prism.js
- **後端**: Firebase (Firestore + Authentication)
- **部署**: GitHub Pages

## 📝 Firebase 配置

請確保在 `src/firebase.js` 中設置了正確的 Firebase 配置。

## 🔒 Firestore 安全規則

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /articles/{articleId} {
      allow read: if resource.data.published == true || isAdmin();
      allow write: if isAdmin();
    }
    
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email == "van880228@gmail.com";
    }
  }
}
```

---

🔥 **Made with React & Firebase** | 部落格系統 v1.0
