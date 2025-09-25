// Background service worker for Learning Content Extractor extension
console.log('Learning Content Extractor background script loaded');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);
  
  // Initialize storage on install
  if (details.reason === 'install') {
    chrome.storage.local.set({
      extractionHistory: [],
      settings: {
        autoExtract: false,
        saveToAPI: true
      }
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.type) {
    case 'EXTRACT_CONTENT':
      handleContentExtraction(message.data, sender.tab)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep message channel open for async response
      
    case 'SEND_TO_API':
      sendToAPI(message.data)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'GET_AUTH_TOKEN':
      getAuthToken()
        .then(token => sendResponse({ success: true, token }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'CHECK_AUTH':
      checkAuthentication()
        .then(isAuth => sendResponse({ success: true, isAuthenticated: isAuth }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    default:
      console.warn('Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Handle content extraction
async function handleContentExtraction(contentData, tab) {
  try {
    // Save to local storage
    const result = await chrome.storage.local.get('extractionHistory');
    const history = result.extractionHistory || [];
    
    const extraction = {
      id: Date.now().toString(),
      ...contentData,
      tabId: tab?.id,
      tabUrl: tab?.url,
      timestamp: new Date().toISOString()
    };
    
    history.unshift(extraction);
    // Keep only last 50 extractions
    if (history.length > 50) {
      history.splice(50);
    }
    
    await chrome.storage.local.set({ extractionHistory: history });
    
    // Check if we should auto-send to API
    const settings = await chrome.storage.local.get('settings');
    if (settings.settings?.saveToAPI) {
      try {
        const apiResult = await sendToAPI(contentData);
        extraction.apiResult = apiResult;
        // Update the stored extraction with API result
        await chrome.storage.local.set({ extractionHistory: history });
      } catch (error) {
        console.error('Failed to send to API:', error);
        extraction.apiError = error.message;
      }
    }
    
    return extraction;
  } catch (error) {
    console.error('Content extraction failed:', error);
    throw error;
  }
}

// Send content to API for topic extraction
async function sendToAPI(contentData) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE_URL}/extract-topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(contentData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `API request failed with status ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Get authentication token from storage
async function getAuthToken() {
  try {
    const result = await chrome.storage.local.get('jwtToken');
    return result.jwtToken || null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

// Check if user is authenticated
async function checkAuthentication() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return false;
    }
    
    // Verify token with API
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

// Handle tab updates for potential auto-extraction
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if auto-extraction is enabled
    const settings = await chrome.storage.local.get('settings');
    if (settings.settings?.autoExtract) {
      // Could implement auto-extraction logic here
      console.log('Tab loaded:', tab.url);
    }
  }
});

// Handle context menu (optional - for right-click extraction)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'extractContent') {
    // Inject content script to extract content
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  }
});

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'extractContent',
    title: 'Extract Learning Content',
    contexts: ['page']
  });
});

// Error handling
chrome.runtime.onSuspend.addListener(() => {
  console.log('Background script is being suspended');
});

// Keep service worker alive with periodic ping
setInterval(() => {
  console.log('Background service worker ping');
}, 20000); // 20 seconds