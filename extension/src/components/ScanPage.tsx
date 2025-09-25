import React from "react";
import { Content, Topic } from "../App";
import { authService } from "../services/authService";
import RecentExtractions from "./RecentExtractions";

interface ScanPageProps {
  setContent: (c: Content) => void;
  setTopics: (t: Topic[]) => void;
  backendUrl: string;
  setLoading: (isLoading: boolean) => void;
  recentExtractions: { content: Content; topics: Topic[] }[];
  setRecentExtractions: React.Dispatch<React.SetStateAction<{ content: Content; topics: Topic[] }[]>>;
  onSelectRecentExtraction: (content: Content, topics: Topic[]) => void;
  setAuthenticated: (isAuth: boolean) => void;
}

const ScanPage: React.FC<ScanPageProps> = ({
  setContent,
  setTopics,
  backendUrl,
  setLoading,
  recentExtractions,
  setRecentExtractions,
  onSelectRecentExtraction,
  setAuthenticated,
}) => {
  const handleScan = async () => {
    setLoading(true);

    try {
      // Get the current active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0 || !tabs[0].id) {
        console.error('No active tab found');
        return;
      }

      const tabId = tabs[0].id;

      let response;
      try {
        console.log("Attempting to send message to content script...");
        response = await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_CONTENT' });
      } catch (e: any) {
        console.log("Content script not available, injecting...", e.message);
        if (e.message.includes("Could not establish connection")) {
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js'],
          });
          // Wait a moment for the script to initialize
          await new Promise(resolve => setTimeout(resolve, 200));
          console.log("Retrying to send message...");
          response = await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_CONTENT' });
        } else {
          throw e; // Re-throw other errors
        }
      }

      if (!response?.success) {
        console.error('Content extraction failed:', response?.error);
        return;
      }

      const extractedContent = response.data;
      console.log('Content extracted successfully:', extractedContent.title);

      // Set the extracted content locally
      setContent(extractedContent);

      // Get authentication token
      const token = await authService.getToken();
      if (!token) {
        console.error('No authentication token available');
        setTopics([]); // Set empty topics if not authenticated
        return;
      }

      // Send to backend for topic extraction
      try {
        console.log('Sending content to backend for topic extraction...');
        const apiResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify(extractedContent),
        });

        if (!apiResponse.ok) {
          throw new Error(`API request failed: ${apiResponse.status}`);
        }

        const apiData = await apiResponse.json();
        console.log('Topics extracted from API:', apiData.topics?.length || 0);
        
        const extractedTopics = (apiData.topics || []).map((topic: any) => ({
          ...topic,
          selected: true // Auto-tick all topics by default
        }));
        setTopics(extractedTopics);

        // Add to recent extractions
        setRecentExtractions(prev => {
          const isDuplicate = prev.some(item => item.content.url === extractedContent.url);
          if (!isDuplicate) {
            const topicsWithSelection = extractedTopics.map((topic: any) => ({
              ...topic,
              selected: true // Ensure recent extractions also have selected state
            }));
            return [{ content: extractedContent, topics: topicsWithSelection }, ...prev].slice(0, 5);
          }
          return prev;
        });

      } catch (apiError) {
        console.error('API call failed:', apiError);
        
        // Check if it's an authentication error
        if (apiError.message.includes('401')) {
          // Clear token and show login screen
          await authService.removeToken();
          setAuthenticated(false);
          alert('Your session has expired. Please log in again.');
          return;
        }
        
        setTopics([]); // Set empty topics on API failure
        alert('Failed to extract topics. Please try again.');
      }

    } catch (error) {
      console.error('Scan operation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Ready to Extract Topics</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Click the button below to analyze this page and extract key learning topics using AI
        </p>
        <button
          className="btn-primary w-full py-3 px-6 rounded-xl font-semibold text-base transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleScan}
        >
          🧠 Analyze Page Content
        </button>
      </div>
      <RecentExtractions
        recentExtractions={recentExtractions}
        onSelectRecentExtraction={onSelectRecentExtraction}
      />
    </div>
  );
};

export default ScanPage;
