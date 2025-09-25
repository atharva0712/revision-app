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

  const handleLoginSuccess = async (token: string) => {
    await authService.setToken(token);
    setAuthenticated(true);
    setShowRegister(false);
  };

  const handleRegisterSuccess = async (token: string) => {
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
      const url = `http://localhost:5173/dashboard?token=${token}`;
      chrome.tabs.create({ url });
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
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="p-4">
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
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-end mb-2 space-x-2">
        <button
          onClick={handleGoToDashboard}
          className="bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600 text-sm"
        >
          Dashboard
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded shadow hover:bg-red-600 text-sm"
        >
          Logout
        </button>
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
        />
      )}
    </div>
  );
};

export default App;
