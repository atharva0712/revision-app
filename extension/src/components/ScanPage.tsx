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

      // Inject and execute the content script to extract content
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js'],
        });
      } catch (injectionError) {
        console.error('Failed to inject content script:', injectionError);
        return;
      }

      // Send message to content script to extract content
      const response = await new Promise((resolve) => {
        chrome.tabs.sendMessage(
          tabId,
          { type: 'EXTRACT_CONTENT' },
          (response) => resolve(response)
        );
      });

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
        
        const extractedTopics = apiData.topics || [];
        setTopics(extractedTopics);

        // Add to recent extractions
        setRecentExtractions(prev => {
          const isDuplicate = prev.some(item => item.content.url === extractedContent.url);
          if (!isDuplicate) {
            return [{ content: extractedContent, topics: extractedTopics }, ...prev].slice(0, 5);
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
    <div className="flex flex-col items-center justify-center h-64 p-4">
      <h2 className="text-lg font-semibold mb-4">Scan this page for learning topics</h2>
      <button
        className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
        onClick={handleScan}
      >
        Scan Page
      </button>
      <RecentExtractions
        recentExtractions={recentExtractions}
        onSelectRecentExtraction={onSelectRecentExtraction}
      />
    </div>
  );
};

export default ScanPage;
