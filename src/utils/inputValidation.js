// 輸入驗證和清理工具
import DOMPurify from 'dompurify';
// import { securityMiddleware } from './securityMonitoring';

// HTML 內容清理（如果需要的話）
export const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html);
};

// URL 驗證
export const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const isValid = ['http:', 'https:'].includes(urlObj.protocol);
    
    // TODO: 在安全監控系統穩定後再啟用
    // if (!securityMiddleware.checkURL(url)) {
    //   return false;
    // }
    
    return isValid;
  } catch {
    return false;
  }
};

// 文章標題驗證
export const validateTitle = (title) => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: '標題不能為空' };
  }
  if (title.length > 200) {
    return { isValid: false, error: '標題長度不能超過 200 字符' };
  }
  return { isValid: true };
};

// 文章摘要驗證
export const validateExcerpt = (excerpt) => {
  if (excerpt && excerpt.length > 500) {
    return { isValid: false, error: '摘要長度不能超過 500 字符' };
  }
  return { isValid: true };
};

// 文章內容驗證
export const validateContent = (content) => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: '文章內容不能為空' };
  }
  if (content.length > 50000) {
    return { isValid: false, error: '文章內容過長，請分拆為多篇文章' };
  }
  return { isValid: true };
};

// 分類名稱驗證
export const validateCategory = (category) => {
  if (!category || category.trim().length === 0) {
    return { isValid: false, error: '請選擇分類' };
  }
  return { isValid: true };
};

// 標籤驗證
export const validateTags = (tagsString) => {
  if (!tagsString) return { isValid: true };
  
  const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  
  if (tags.length > 10) {
    return { isValid: false, error: '標籤數量不能超過 10 個' };
  }
  
  for (const tag of tags) {
    if (tag.length > 50) {
      return { isValid: false, error: '單個標籤長度不能超過 50 字符' };
    }
  }
  
  return { isValid: true, tags };
};

// 圖片 URL 驗證
export const validateImageUrl = (url) => {
  if (!url) return { isValid: true };
  
  if (!isValidUrl(url)) {
    return { isValid: false, error: '請輸入有效的圖片 URL' };
  }
  
  // 檢查是否為圖片文件
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const urlLower = url.toLowerCase();
  const hasImageExtension = imageExtensions.some(ext => urlLower.includes(ext));
  
  if (!hasImageExtension && !urlLower.includes('images') && !urlLower.includes('unsplash')) {
    console.warn('URL 可能不是圖片文件');
  }
  
  return { isValid: true };
};

// 導覽路徑驗證
export const validateNavigationPath = (path, type) => {
  if (!path || path.trim().length === 0) {
    return { isValid: false, error: '路徑不能為空' };
  }
  
  if (type === 'external') {
    if (!isValidUrl(path)) {
      return { isValid: false, error: '外部連結必須是有效的 URL' };
    }
  } else {
    // 內部路徑驗證
    if (!path.startsWith('/')) {
      return { isValid: false, error: '內部路徑必須以 / 開始' };
    }
    if (path.includes('<') || path.includes('>') || path.includes('"') || path.includes("'")) {
      return { isValid: false, error: '路徑包含非法字符' };
    }
  }
  
  return { isValid: true };
};

// 通用文字內容清理（防止 XSS）
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  
  // TODO: 在安全監控系統穩定後再啟用
  // securityMiddleware.checkUserInput(text, 'text_input');
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// 電子郵件驗證
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: '請輸入有效的電子郵件地址' };
  }
  return { isValid: true };
};

// 密碼強度驗證
export const validatePassword = (password) => {
  if (password.length < 6) {
    return { isValid: false, error: '密碼長度至少需要 6 個字符' };
  }
  if (password.length > 128) {
    return { isValid: false, error: '密碼長度不能超過 128 個字符' };
  }
  return { isValid: true };
};
