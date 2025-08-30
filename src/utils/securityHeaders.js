// 在 public/index.html 的 <head> 區域添加安全標頭
// 或者配置 Web 服務器（如 Nginx/Apache）添加這些標頭

/*
建議添加以下 HTTP 安全標頭：

1. Content Security Policy (CSP)
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: http:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com

2. X-Content-Type-Options
X-Content-Type-Options: nosniff

3. X-Frame-Options
X-Frame-Options: DENY

4. X-XSS-Protection
X-XSS-Protection: 1; mode=block

5. Referrer-Policy
Referrer-Policy: strict-origin-when-cross-origin

6. Permissions-Policy
Permissions-Policy: geolocation=(), microphone=(), camera=()

7. Strict-Transport-Security (HTTPS 部署時)
Strict-Transport-Security: max-age=31536000; includeSubDomains

如果使用 GitHub Pages，可以透過 _headers 檔案或透過代理服務（如 Cloudflare）來添加這些標頭。
*/

// 對於 React 應用，可以在 index.html 中添加 meta 標籤
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: http:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// 用於檢查安全標頭的工具函數
export const checkSecurityHeaders = () => {
  // 這個函數可以在開發環境中檢查安全標頭是否正確設置
  console.log('檢查安全標頭配置...');
  
  // 檢查 CSP
  const metaCsp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!metaCsp) {
    console.warn('警告：未設置 Content-Security-Policy');
  }
  
  // 檢查其他安全 meta 標籤
  const metaNoSniff = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
  if (!metaNoSniff) {
    console.warn('警告：未設置 X-Content-Type-Options');
  }
};
