import React, { useState, useEffect } from "react";
import ScanPage from "./components/ScanPage";
import TopicsPreview from "./components/TopicsPreview";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import RecentExtractions from "./components/RecentExtractions";
import { authService } from "./services/authService";

export interface Topic {
  id?: string;
  name: string;
  description: string;
  category?: string;
  added?: boolean;
  selected?: boolean; // New property for tick/untick state
  confidence?: number;
  keywords?: string[];
  extractedFrom?: {
    url: string;
    title: string;
    type: string;
    extractedAt: string;
  };
}

export interface Content {
  url: string;
  title: string;
  type: string;
  text: string;
  wordCount?: number;
  metadata?: any;
  extractedAt?: string; // Add extractedAt to Content as well, if it comes from content script
}

// Define the structure for a recent extraction item
interface RecentExtractionItem {
  content: Content;
  topics: Topic[];
}

const BACKEND_URL = "http://localhost:3000/api/extract-topics"; // This will be updated later for topic creation

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [content, setContent] = useState<Content | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false); // Global loading state
  const [recentExtractions, setRecentExtractions] = useState<RecentExtractionItem[]>([]);

  // Effect to check authentication status and load saved content/topics on mount
  useEffect(() => {
    (async () => { // Immediately invoked async function
      const isAuthenticated = await authService.isAuthenticated();
      setAuthenticated(isAuthenticated);

      // Load saved content and topics
      const savedContent = await chrome.storage.local.get('lastContent');
      const savedTopics = await chrome.storage.local.get('lastTopics');
      const savedRecentExtractions = await chrome.storage.local.get('recentExtractions');
      
      if (savedContent.lastContent) {
        setContent(savedContent.lastContent);
      }
      if (savedTopics.lastTopics) {
        setTopics(savedTopics.lastTopics);
      }
      if (savedRecentExtractions.recentExtractions) {
        setRecentExtractions(savedRecentExtractions.recentExtractions);
      }
      setLoading(false); // Set loading false after initialization
    })(); // Immediately invoke
  }, []);

  // Effect to save content to storage whenever it changes
  useEffect(() => {
    if (content) {
      chrome.storage.local.set({ lastContent: content });
    }
  }, [content]);

  // Effect to save topics to storage whenever they change
  useEffect(() => {
    if (topics.length > 0) {
      chrome.storage.local.set({ lastTopics: topics });
    }
  }, [topics]);

  // Effect to save recent extractions to storage whenever they change
  useEffect(() => {
    if (recentExtractions.length > 0) {
      chrome.storage.local.set({ recentExtractions: recentExtractions });
    }
  }, [recentExtractions]);

  const handleLoginSuccess = async (token: string, user?: any) => {
    await authService.setToken(token);
    setAuthenticated(true);
    setShowRegister(false);
  };

  const handleRegisterSuccess = async (token: string, user?: any) => {
    await authService.setToken(token);
    setAuthenticated(true);
    setShowRegister(false);
  };

  const handleLogout = async () => {
    await authService.removeToken();
    await chrome.storage.local.remove('lastContent'); // Clear stored content on logout
    await chrome.storage.local.remove('lastTopics'); // Clear stored topics on logout
    await chrome.storage.local.remove('recentExtractions'); // Clear recent extractions on logout
    
    setAuthenticated(false);
    setContent(null); // Reset content and topics on logout
    setTopics([]);
    setRecentExtractions([]);
  };

  const handleGoToDashboard = async () => {
    const token = await authService.getToken();
    if (token) {
      // Open dashboard in a new tab
      chrome.tabs.create({ url: 'http://localhost:8081/dashboard' });
    }
  };

  const handleClearContentAndTopics = async () => {
    setContent(null);
    setTopics([]);
    await chrome.storage.local.remove('lastContent');
    await chrome.storage.local.remove('lastTopics');
  };

  const handleSelectRecentExtraction = (selectedContent: Content, selectedTopics: Topic[]) => {
    setContent(selectedContent);
    setTopics(selectedTopics);
  };

  if (authenticated === null || loading) {
    // Still checking authentication status or global loading is active
    return (
      <div className="p-6 min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
          </div>
          <p className="mt-4 text-slate-300 font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="p-6 min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Topic Extractor
                </h1>
              </div>
              <p className="text-slate-400 text-sm">Extract learning topics from any webpage</p>
            </div>
            {showRegister ? (
              <Register
                onRegisterSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => setShowRegister(false)}
              />
            ) : (
              <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setShowRegister(true)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Topic Extractor
          </h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleGoToDashboard}
            className="btn-primary text-xs px-3 py-2 rounded-lg transition-all"
          >
            📊 Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="btn-danger text-xs px-3 py-2 rounded-lg transition-all"
          >
            🚪 Logout
          </button>
        </div>
      </div>
      {!content ? (
        <ScanPage
          setContent={setContent}
          setTopics={setTopics}
          backendUrl={BACKEND_URL}
          setLoading={setLoading}
          recentExtractions={recentExtractions}
          setRecentExtractions={setRecentExtractions}
          onSelectRecentExtraction={handleSelectRecentExtraction}
          setAuthenticated={setAuthenticated}
        />
      ) : (
        <TopicsPreview
          topics={topics}
          setTopics={setTopics}
          content={content}
          onScanNewPage={handleClearContentAndTopics}
          setLoading={setLoading}
        />
      )}
    </div>
  );
};

export default App;
