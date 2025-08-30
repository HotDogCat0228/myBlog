/**
 * 安全測試工具
 * 用於測試應用程序的安全性防護機制
 */

import { 
  validateTitle, 
  validateContent, 
  validateEmail, 
  validatePassword,
  validateUrl,
  sanitizeText 
} from './inputValidation';
import { securityLogger, SECURITY_EVENT_TYPES } from './securityMonitoring';

// XSS 測試樣本
const XSS_TEST_PAYLOADS = [
  '<script>alert("XSS")</script>',
  'javascript:alert("XSS")',
  '<img src="x" onerror="alert(\'XSS\')" />',
  '<svg onload="alert(\'XSS\')" />',
  '<iframe src="javascript:alert(\'XSS\')"></iframe>',
  '"><script>alert("XSS")</script>',
  '<div onmouseover="alert(\'XSS\')" />',
  '<input type="image" src="x" onerror="alert(\'XSS\')" />',
  '<body onload="alert(\'XSS\')">'
];

// SQL 注入測試樣本
const SQL_INJECTION_TEST_PAYLOADS = [
  "'; DROP TABLE users; --",
  "1' OR '1'='1",
  "admin'--",
  "1' UNION SELECT * FROM users --",
  "'; INSERT INTO users VALUES('hacker','password'); --",
  "1' OR SLEEP(5) --",
  "1' AND (SELECT SUBSTRING(@@version,1,1))='5' --"
];

// 安全測試類
export class SecurityTester {
  constructor() {
    this.results = {
      xss: [],
      sqlInjection: [],
      validation: [],
      overall: 'PENDING'
    };
  }

  // 執行完整安全測試
  async runFullSecurityTest() {
    console.log('🔒 開始安全測試...');
    
    // 清除之前的日誌
    securityLogger.clearEvents();
    
    try {
      // 1. 測試 XSS 防護
      await this.testXSSProtection();
      
      // 2. 測試 SQL 注入防護
      await this.testSQLInjectionProtection();
      
      // 3. 測試輸入驗證
      await this.testInputValidation();
      
      // 4. 測試 URL 驗證
      await this.testURLValidation();
      
      // 5. 生成測試報告
      this.generateReport();
      
    } catch (error) {
      console.error('安全測試過程中發生錯誤:', error);
      this.results.overall = 'ERROR';
    }
    
    return this.results;
  }

  // 測試 XSS 防護
  async testXSSProtection() {
    console.log('🧪 測試 XSS 防護...');
    
    for (const payload of XSS_TEST_PAYLOADS) {
      try {
        // 測試文本清理
        const sanitized = sanitizeText(payload);
        const isBlocked = !sanitized.includes('<script') && 
                         !sanitized.includes('javascript:') &&
                         !sanitized.includes('onerror=');
        
        this.results.xss.push({
          payload: payload.substring(0, 50) + '...',
          blocked: isBlocked,
          sanitized: sanitized.substring(0, 100)
        });
        
        // 短暫延遲避免過快執行
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        this.results.xss.push({
          payload: payload.substring(0, 50) + '...',
          blocked: false,
          error: error.message
        });
      }
    }
  }

  // 測試 SQL 注入防護
  async testSQLInjectionProtection() {
    console.log('🧪 測試 SQL 注入防護...');
    
    for (const payload of SQL_INJECTION_TEST_PAYLOADS) {
      try {
        // 測試標題驗證（模擬用戶輸入）
        const titleValidation = validateTitle(payload);
        const contentValidation = validateContent(payload);
        
        // 檢查是否被安全監控系統檢測到
        const events = securityLogger.getEventsByType(
          SECURITY_EVENT_TYPES.SQL_INJECTION_ATTEMPT
        );
        const wasDetected = events.length > 0;
        
        this.results.sqlInjection.push({
          payload: payload.substring(0, 50) + '...',
          titleBlocked: !titleValidation.isValid,
          contentBlocked: !contentValidation.isValid,
          detected: wasDetected
        });
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        this.results.sqlInjection.push({
          payload: payload.substring(0, 50) + '...',
          blocked: false,
          error: error.message
        });
      }
    }
  }

  // 測試輸入驗證
  async testInputValidation() {
    console.log('🧪 測試輸入驗證...');
    
    const testCases = [
      { input: '', field: 'title', shouldPass: false },
      { input: 'a'.repeat(201), field: 'title', shouldPass: false },
      { input: '正常標題', field: 'title', shouldPass: true },
      { input: '', field: 'content', shouldPass: false },
      { input: 'a'.repeat(100001), field: 'content', shouldPass: false },
      { input: '正常內容', field: 'content', shouldPass: true },
      { input: 'invalid-email', field: 'email', shouldPass: false },
      { input: 'test@example.com', field: 'email', shouldPass: true },
      { input: '123', field: 'password', shouldPass: false },
      { input: 'validPassword123', field: 'password', shouldPass: true }
    ];

    for (const testCase of testCases) {
      let result;
      
      switch (testCase.field) {
        case 'title':
          result = validateTitle(testCase.input);
          break;
        case 'content':
          result = validateContent(testCase.input);
          break;
        case 'email':
          result = { isValid: validateEmail(testCase.input) };
          break;
        case 'password':
          result = validatePassword(testCase.input);
          break;
        default:
          result = { isValid: false };
      }

      const passed = result.isValid === testCase.shouldPass;
      
      this.results.validation.push({
        field: testCase.field,
        input: testCase.input.substring(0, 20) + (testCase.input.length > 20 ? '...' : ''),
        expected: testCase.shouldPass ? 'PASS' : 'FAIL',
        actual: result.isValid ? 'PASS' : 'FAIL',
        testPassed: passed,
        errors: result.error ? [result.error] : []
      });
    }
  }

  // 測試 URL 驗證
  async testURLValidation() {
    console.log('🧪 測試 URL 驗證...');
    
    const urlTestCases = [
      { url: 'https://example.com', shouldPass: true },
      { url: 'http://example.com', shouldPass: true },
      { url: 'javascript:alert(1)', shouldPass: false },
      { url: 'data:text/html,<script>alert(1)</script>', shouldPass: false },
      { url: 'ftp://example.com', shouldPass: false },
      { url: 'not-a-url', shouldPass: false }
    ];

    for (const testCase of urlTestCases) {
      const isValid = validateUrl(testCase.url);
      const passed = isValid === testCase.shouldPass;
      
      this.results.validation.push({
        field: 'url',
        input: testCase.url,
        expected: testCase.shouldPass ? 'PASS' : 'FAIL',
        actual: isValid ? 'PASS' : 'FAIL',
        testPassed: passed
      });
    }
  }

  // 生成測試報告
  generateReport() {
    const xssBlocked = this.results.xss.filter(r => r.blocked).length;
    const xssTotal = this.results.xss.length;
    
    const sqlBlocked = this.results.sqlInjection.filter(
      r => r.titleBlocked || r.contentBlocked || r.detected
    ).length;
    const sqlTotal = this.results.sqlInjection.length;
    
    const validationPassed = this.results.validation.filter(r => r.testPassed).length;
    const validationTotal = this.results.validation.length;
    
    // 計算整體安全性評分
    const xssScore = xssTotal > 0 ? (xssBlocked / xssTotal) * 100 : 100;
    const sqlScore = sqlTotal > 0 ? (sqlBlocked / sqlTotal) * 100 : 100;
    const validationScore = validationTotal > 0 ? (validationPassed / validationTotal) * 100 : 100;
    
    const overallScore = (xssScore + sqlScore + validationScore) / 3;
    
    // 確定整體安全等級
    if (overallScore >= 90) {
      this.results.overall = 'EXCELLENT';
    } else if (overallScore >= 75) {
      this.results.overall = 'GOOD';
    } else if (overallScore >= 60) {
      this.results.overall = 'FAIR';
    } else {
      this.results.overall = 'POOR';
    }

    // 輸出報告
    console.log('\n📊 安全測試報告');
    console.log('================');
    console.log(`XSS 防護: ${xssBlocked}/${xssTotal} (${xssScore.toFixed(1)}%)`);
    console.log(`SQL 注入防護: ${sqlBlocked}/${sqlTotal} (${sqlScore.toFixed(1)}%)`);
    console.log(`輸入驗證: ${validationPassed}/${validationTotal} (${validationScore.toFixed(1)}%)`);
    console.log(`整體評分: ${overallScore.toFixed(1)}% (${this.results.overall})`);
    
    // 輸出安全事件統計
    const securityEvents = securityLogger.getEvents();
    const eventsByType = {};
    securityEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });
    
    console.log('\n🚨 安全事件統計:');
    Object.entries(eventsByType).forEach(([type, count]) => {
      console.log(`- ${type}: ${count} 次`);
    });

    return {
      scores: { xss: xssScore, sql: sqlScore, validation: validationScore, overall: overallScore },
      grade: this.results.overall,
      events: eventsByType
    };
  }
}

// 快速安全測試函數
export const runSecurityTest = async () => {
  const tester = new SecurityTester();
  return await tester.runFullSecurityTest();
};

// 在開發環境中自動運行測試
if (process.env.NODE_ENV === 'development' && false) { // 暫時禁用自動測試
  // 延遲執行避免影響應用啟動
  setTimeout(() => {
    console.log('🔐 自動執行安全測試...');
    runSecurityTest();
  }, 3000);
}

export default SecurityTester;
