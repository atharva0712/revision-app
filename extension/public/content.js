// Content script for Learning Content Extractor extension
// Prevent multiple injections
if (!window.learningExtractorLoaded) {
  window.learningExtractorLoaded = true;
  console.log('Learning Content Extractor content script loaded on:', window.location.href);

// Content extraction utilities
class ContentExtractor {
  constructor() {
    this.selectors = {
      title: [
        'h1',
        'title',
        '[data-testid="headline"]',
        '.headline',
        '.title',
        '.entry-title',
        '.post-title',
        '.article-title'
      ],
      content: [
        'article',
        '[data-testid="article-body"]',
        '.article-body',
        '.post-content',
        '.entry-content',
        '.content',
        'main',
        '.main-content',
        '#content'
      ],
      exclude: [
        'script',
        'style',
        'nav',
        'header',
        'footer',
        '.navigation',
        '.nav',
        '.sidebar',
        '.ads',
        '.advertisement',
        '.comments',
        '.social-share'
      ]
    };
  }

  // Extract title from the page
  extractTitle() {
    for (const selector of this.selectors.title) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    return document.title || window.location.href;
  }

  // Extract main content text
  extractText() {
    let content = '';
    
    // Try to find main content area
    for (const selector of this.selectors.content) {
      const element = document.querySelector(selector);
      if (element) {
        content = this.cleanText(element);
        if (content.length > 100) { // Minimum viable content length
          break;
        }
      }
    }
    
    // Fallback to body if no specific content area found
    if (content.length < 100) {
      content = this.cleanText(document.body);
    }
    
    return content.substring(0, 50000); // Limit content size
  }

  // Clean and process text content
  cleanText(element) {
    // Clone element to avoid modifying original
    const clone = element.cloneNode(true);
    
    // Remove excluded elements
    this.selectors.exclude.forEach(selector => {
      const excludeElements = clone.querySelectorAll(selector);
      excludeElements.forEach(el => el.remove());
    });
    
    // Extract text and clean it
    let text = clone.textContent || clone.innerText || '';
    
    // Clean up whitespace
    text = text
      .replace(/\s+/g, ' ') // Multiple whitespace to single space
      .replace(/\n\s*\n/g, '\n') // Multiple newlines to single
      .trim();
    
    return text;
  }

  // Extract metadata
  extractMetadata() {
    const metadata = {
      url: window.location.href,
      domain: window.location.hostname,
      timestamp: new Date().toISOString(),
      language: document.documentElement.lang || 'en',
      charset: document.characterSet || 'UTF-8'
    };

    // Try to extract author
    const authorSelectors = [
      '[name="author"]',
      '[property="article:author"]',
      '.author',
      '.byline',
      '[data-testid="author"]'
    ];
    
    for (const selector of authorSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        metadata.author = element.content || element.textContent?.trim();
        if (metadata.author) break;
      }
    }

    // Try to extract publish date
    const dateSelectors = [
      '[property="article:published_time"]',
      '[name="date"]',
      'time[datetime]',
      '.publish-date',
      '.date'
    ];
    
    for (const selector of dateSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        metadata.publishDate = element.content || element.getAttribute('datetime') || element.textContent?.trim();
        if (metadata.publishDate) break;
      }
    }

    // Extract description/summary
    const descriptionSelectors = [
      '[name="description"]',
      '[property="og:description"]',
      '[name="twitter:description"]'
    ];
    
    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element && element.content) {
        metadata.description = element.content;
        break;
      }
    }

    return metadata;
  }

  // Main extraction method
  extract() {
    const title = this.extractTitle();
    const text = this.extractText();
    const metadata = this.extractMetadata();
    
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    return {
      title,
      text,
      type: 'webpage',
      url: metadata.url,
      wordCount,
      metadata,
      extractedAt: new Date().toISOString()
    };
  }
}

// Initialize extractor
const extractor = new ContentExtractor();

// Check if extension context is valid
function isExtensionContextValid() {
  try {
    return chrome.runtime && chrome.runtime.id;
  } catch (error) {
    return false;
  }
}

// Safe message sending with context validation
function safeSendMessage(message, callback) {
  if (!isExtensionContextValid()) {
    console.warn('Extension context invalidated, skipping message send');
    return;
  }
  
  try {
    chrome.runtime.sendMessage(message, callback);
  } catch (error) {
    console.warn('Failed to send message to extension:', error.message);
  }
}

// Handle messages from popup and background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isExtensionContextValid()) {
    console.warn('Extension context invalidated, ignoring message');
    return;
  }
  
  console.log('Content script received message:', message);
  
  switch (message.type) {
    case 'EXTRACT_CONTENT':
      try {
        const extractedContent = extractor.extract();
        console.log('Content extracted successfully:', {
          title: extractedContent.title,
          wordCount: extractedContent.wordCount,
          url: extractedContent.url
        });
        sendResponse({ success: true, data: extractedContent });
      } catch (error) {
        console.error('Content extraction failed:', error);
        sendResponse({ success: false, error: error.message });
      }
      break;
      
    case 'GET_PAGE_INFO':
      try {
        const pageInfo = {
          title: document.title,
          url: window.location.href,
          readyState: document.readyState,
          contentType: document.contentType,
          hasContent: document.body && document.body.textContent.trim().length > 100
        };
        sendResponse({ success: true, data: pageInfo });
      } catch (error) {
        console.error('Failed to get page info:', error);
        sendResponse({ success: false, error: error.message });
      }
      break;
      
    case 'HIGHLIGHT_TEXT':
      try {
        // Could implement text highlighting functionality here
        sendResponse({ success: true, message: 'Highlight functionality not implemented yet' });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
      break;
      
    default:
      console.warn('Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
  
  return true; // Keep message channel open for async response
});

// Auto-extraction functionality (if enabled)
function checkAutoExtraction() {
  if (!isExtensionContextValid()) {
    return;
  }
  
  try {
    chrome.storage.local.get('settings', (result) => {
      if (chrome.runtime.lastError) {
        console.warn('Storage access failed:', chrome.runtime.lastError);
        return;
      }
      
      if (result.settings?.autoExtract) {
        // Wait for page to load completely
        if (document.readyState === 'complete') {
          performAutoExtraction();
        } else {
          window.addEventListener('load', performAutoExtraction);
        }
      }
    });
  } catch (error) {
    console.warn('Extension context error in checkAutoExtraction:', error);
  }
}

function performAutoExtraction() {
  // Only auto-extract on certain domains or content types
  const autoExtractDomains = [
    'wikipedia.org',
    'medium.com',
    'dev.to',
    'stackoverflow.com',
    'github.com'
  ];
  
  const shouldAutoExtract = autoExtractDomains.some(domain => 
    window.location.hostname.includes(domain)
  );
  
  if (shouldAutoExtract) {
    const content = extractor.extract();
    if (content.wordCount > 200) { // Only extract substantial content
      safeSendMessage({
        type: 'EXTRACT_CONTENT',
        data: content
      });
    }
  }
}

// Initialize when content script loads
checkAutoExtraction();

// Add visual indicator when extension is active
function addExtensionIndicator() {
  if (!isExtensionContextValid()) {
    return;
  }
  
  const indicator = document.createElement('div');
  indicator.id = 'learning-extractor-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #4CAF50;
    color: white;
    padding: 5px 10px;
    border-radius: 3px;
    font-size: 12px;
    font-family: Arial, sans-serif;
    z-index: 10000;
    opacity: 0.8;
    transition: opacity 0.3s;
    cursor: pointer;
  `;
  indicator.textContent = '📚 Learning Extractor Active';
  
  indicator.addEventListener('click', () => {
    const content = extractor.extract();
    safeSendMessage({
      type: 'EXTRACT_CONTENT',
      data: content
    });
    
    // Provide feedback
    indicator.textContent = '✅ Content Extracted!';
    indicator.style.background = '#2196F3';
    setTimeout(() => {
      indicator.textContent = '📚 Learning Extractor Active';
      indicator.style.background = '#4CAF50';
    }, 2000);
  });
  
  document.body.appendChild(indicator);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    indicator.style.opacity = '0.3';
  }, 5000);
}

// Add indicator if page has substantial content
if (document.body && document.body.textContent.trim().length > 500) {
  // Wait a bit for page to settle
  setTimeout(addExtensionIndicator, 1000);
}

// Export for debugging
window.learningExtractor = {
  extractor,
  extractContent: () => extractor.extract()
};

console.log('Content script initialization complete');

} else {
  console.log('Learning Content Extractor already loaded, skipping duplicate injection');
}
