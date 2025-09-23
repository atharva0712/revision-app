import React from "react";
import { Content, Topic } from "../App";
import { authService } from "../services/authService";
import RecentExtractions from "./RecentExtractions";

interface ScanPageProps {
  setContent: (c: Content) => void;
  setTopics: (t: Topic[]) => void;
  backendUrl: string;
  setLoading: (isLoading: boolean) => void; // Add setLoading prop
  recentExtractions: { content: Content; topics: Topic[] }[];
  setRecentExtractions: React.Dispatch<React.SetStateAction<{ content: Content; topics: Topic[] }[]>>;
}

const ScanPage: React.FC<ScanPageProps> = ({
  setContent,
  setTopics,
  backendUrl,
  setLoading,
  recentExtractions,
  setRecentExtractions,
}) => {
  const handleScan = async () => {
    setLoading(true); // Use prop setLoading

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs || tabs.length === 0 || !tabs[0].id) {
        setLoading(false); // Turn off loading if no tab found
        return;
      }

      const tabId = tabs[0].id;

      try { // This try block covers script injection
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js'],
        });
      } catch (e) {
        setLoading(false); // Turn off loading if injection fails
        return;
      }

      // This is the main asynchronous block that needs its own finally
      try {
        chrome.tabs.sendMessage(
          tabId,
          { action: "extractContent" },
          async (response) => {
            if (response?.success) {
              const extractedContent = response.content;
              const extractedTopics = response.topics || []; // Assuming backend returns topics directly

              // Add to recent extractions list
              setRecentExtractions(prev => {
                // Prevent duplicates based on URL
                const isDuplicate = prev.some(item => item.content.url === extractedContent.url);
                if (!isDuplicate) {
                  // Keep list to a reasonable size, e.g., last 5
                  return [{ content: extractedContent, topics: extractedTopics }, ...prev].slice(0, 5);
                }
                return prev;
              });

              setContent(extractedContent);
              setTopics(extractedTopics);
              
              const token = await authService.getToken();
              if (!token) {
                // Optionally, redirect to login or show a message
                setLoading(false); // Turn off loading if no token
                return;
              }

              // Call backend for topics
              try { // This try block covers the fetch call
                const res = await fetch(backendUrl, {
                  method: "POST",
                  headers: { 
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                  },
                  body: JSON.stringify(extractedContent),
                });
                const data = await res.json();
                // The backend /api/extract-topics returns topics directly, not a success/topic object
                // setTopics(data.topics || []); // This line is for the old flow
                // The new flow is to save the topic via /api/topics, which is done via the Add button
                // So, we don't set topics here from the backend response of /api/extract-topics
                // We rely on the initial extraction from content script

                // If the backend /api/extract-topics is still used for initial display, then this is fine.
                // If we are moving to /api/topics for initial display, then this needs re-evaluation.
                // For now, assuming /api/extract-topics is for initial display.
                setTopics(data.topics || []); // Keep this for now, as it's the current flow for initial display

              } catch (fetchError) {
                // Handle fetch error
              }
            } else {
              // Content script response not successful
            }
            setLoading(false); // <-- IMPORTANT: Turn off loading AFTER all async work in callback
          }
        );
      } catch (sendMessageError) {
        setLoading(false); // Turn off loading if sendMessage fails
      }
    });
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
      />
    </div>
  );
};

export default ScanPage;
