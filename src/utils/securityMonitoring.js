/**
 * 安全監控和日誌系統
 * 用於追踪和記錄潛在的安全威脅
 */

// 可疑活動類型
export const SECURITY_EVENT_TYPES = {
  XSS_ATTEMPT: 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT: 'SQL_INJECTION_ATTEMPT',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  INVALID_INPUT: 'INVALID_INPUT',
  SUSPICIOUS_URL: 'SUSPICIOUS_URL',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

// 安全事件日誌
class SecurityLogger {
  constructor() {
    this.events = [];
    this.maxEvents = 1000; // 最大保存事件數
  }

  log(eventType, details = {}) {
    const event = {
      id: Date.now() + Math.random(),
      type: eventType,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      details,
      severity: this.getSeverity(eventType)
    };

    this.events.unshift(event);
    
    // 限制日誌數量
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // 在開發環境中顯示警告
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SECURITY] ${eventType}:`, details);
    }

    // 對於高嚴重性事件，可以考慮發送到後端監控系統
    if (event.severity === 'HIGH') {
      this.sendToMonitoring(event);
    }

    return event;
  }

  getSeverity(eventType) {
    const severityMap = {
      [SECURITY_EVENT_TYPES.XSS_ATTEMPT]: 'HIGH',
      [SECURITY_EVENT_TYPES.SQL_INJECTION_ATTEMPT]: 'HIGH',
      [SECURITY_EVENT_TYPES.UNAUTHORIZED_ACCESS]: 'HIGH',
      [SECURITY_EVENT_TYPES.INVALID_INPUT]: 'MEDIUM',
      [SECURITY_EVENT_TYPES.SUSPICIOUS_URL]: 'MEDIUM',
      [SECURITY_EVENT_TYPES.RATE_LIMIT_EXCEEDED]: 'LOW'
    };
    return severityMap[eventType] || 'LOW';
  }

  sendToMonitoring(event) {
    // 在生產環境中，這裡可以發送到監控服務
    // 例如：發送到 Firebase Analytics、Sentry 等
    console.warn('[HIGH SEVERITY SECURITY EVENT]', event);
    
    // 示例：發送到 Firebase Analytics
    // if (typeof gtag !== 'undefined') {
    //   gtag('event', 'security_alert', {
    //     event_category: 'security',
    //     event_label: event.type,
    //     custom_parameters: event.details
    //   });
    // }
  }

  getEvents(limit = 100) {
    return this.events.slice(0, limit);
  }

  getEventsByType(eventType, limit = 100) {
    return this.events
      .filter(event => event.type === eventType)
      .slice(0, limit);
  }

  clearEvents() {
    this.events = [];
  }
}

// 單例模式
export const securityLogger = new SecurityLogger();

// 可疑模式檢測器
export const detectSuspiciousPatterns = {
  // 檢測 XSS 嘗試
  checkXSS(input) {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /eval\s*\(/gi,
      /alert\s*\(/gi,
      /confirm\s*\(/gi,
      /prompt\s*\(/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        securityLogger.log(SECURITY_EVENT_TYPES.XSS_ATTEMPT, {
          input: input.substring(0, 200), // 只記錄前 200 個字符
          pattern: pattern.toString()
        });
        return true;
      }
    }
    return false;
  },

  // 檢測 SQL 注入嘗試
  checkSQLInjection(input) {
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
      /(\b(or|and)\s+\w+\s*=\s*\w+)/gi,
      /('|"|`|;|--|\*|\/\*|\*\/)/gi,
      /(\b(sleep|benchmark|waitfor)\s*\()/gi
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        securityLogger.log(SECURITY_EVENT_TYPES.SQL_INJECTION_ATTEMPT, {
          input: input.substring(0, 200),
          pattern: pattern.toString()
        });
        return true;
      }
    }
    return false;
  },

  // 檢測可疑 URL
  checkSuspiciousURL(url) {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /ftp:/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        securityLogger.log(SECURITY_EVENT_TYPES.SUSPICIOUS_URL, {
          url: url,
          pattern: pattern.toString()
        });
        return true;
      }
    }
    return false;
  }
};

// 速率限制器
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.windowSize = 60000; // 1 分鐘窗口
    this.maxRequests = 60; // 每分鐘最大請求數
  }

  checkLimit(identifier = 'global') {
    const now = Date.now();
    const windowStart = now - this.windowSize;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const userRequests = this.requests.get(identifier);
    
    // 清除過期請求
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(identifier, validRequests);

    // 檢查是否超過限制
    if (validRequests.length >= this.maxRequests) {
      securityLogger.log(SECURITY_EVENT_TYPES.RATE_LIMIT_EXCEEDED, {
        identifier,
        requestCount: validRequests.length,
        limit: this.maxRequests
      });
      return false;
    }

    // 記錄新請求
    validRequests.push(now);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// 安全檢查中間件
export const securityMiddleware = {
  // 檢查用戶輸入
  checkUserInput(input, fieldName = 'unknown') {
    if (!input || typeof input !== 'string') {
      return true; // 空值或非字符串不檢查
    }

    let hasSuspiciousContent = false;

    // 檢查 XSS
    if (detectSuspiciousPatterns.checkXSS(input)) {
      hasSuspiciousContent = true;
    }

    // 檢查 SQL 注入
    if (detectSuspiciousPatterns.checkSQLInjection(input)) {
      hasSuspiciousContent = true;
    }

    if (hasSuspiciousContent) {
      securityLogger.log(SECURITY_EVENT_TYPES.INVALID_INPUT, {
        fieldName,
        inputLength: input.length,
        suspicious: true
      });
    }

    return !hasSuspiciousContent;
  },

  // 檢查 URL 安全性
  checkURL(url, fieldName = 'url') {
    if (!url || typeof url !== 'string') {
      return true;
    }

    return !detectSuspiciousPatterns.checkSuspiciousURL(url);
  }
};

export default securityLogger;
