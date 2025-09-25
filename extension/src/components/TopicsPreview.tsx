import React, { useState } from "react";
import { Topic, Content } from "../App";
import TopicItem from "./TopicItem";
import { authService } from "../services/authService";

interface TopicsPreviewProps {
  topics: Topic[];
  setTopics: React.Dispatch<React.SetStateAction<Topic[]>>;
  content: Content;
  onScanNewPage: () => void;
  setLoading: (isLoading: boolean) => void;
}

const TopicsPreview: React.FC<TopicsPreviewProps> = ({ topics, setTopics, content, onScanNewPage, setLoading }) => {
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isReextracting, setIsReextracting] = useState(false);

  const handleToggleSelect = (idx: number) => {
    setTopics((prev: Topic[]) =>
      prev.map((t: Topic, i: number) =>
        i === idx ? { ...t, selected: !t.selected } : t
      )
    );
  };

  const handleProcessSelectedTopics = async () => {
    const selectedTopics = topics.filter(topic => topic.selected);
    
    if (selectedTopics.length === 0) {
      // Create a temporary notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium';
      notification.textContent = '⚠️ Please select at least one topic to process';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      return;
    }

    const token = await authService.getToken();
    if (!token) {
      console.error("No authentication token found. Please log in.");
      alert('Authentication required. Please log in again.');
      return;
    }

    try {
      // Process selected topics in batch
      const processingPromises = selectedTopics.map(async (topic, originalIndex) => {
        const topicIndex = topics.findIndex(t => t === topic);
        
        const res = await fetch('http://localhost:3000/api/topics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({
            name: topic.name,
            description: topic.description,
            sourceURL: content.url,
            sourceTitle: content.title,
            sourceType: content.type,
            extractedAt: topic.extractedFrom?.extractedAt || content.extractedAt,
            confidence: topic.confidence,
            category: topic.category,
            keywords: topic.keywords,
          }),
        });

        const data = await res.json();
        
        if (data.success) {
          return { index: topicIndex, success: true, id: data.topic._id };
        } else {
          return { index: topicIndex, success: false, error: data.message };
        }
      });

      const results = await Promise.all(processingPromises);
      
      // Update topics with processing results
      setTopics((prev: Topic[]) =>
        prev.map((topic, index) => {
          const result = results.find(r => r.index === index);
          if (result && result.success) {
            return { ...topic, added: true, id: result.id };
          }
          return topic;
        })
      );

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      if (failureCount === 0) {
        alert(`Successfully processed ${successCount} topics for flashcard generation!`);
      } else {
        alert(`Processed ${successCount} topics successfully. ${failureCount} failed to process.`);
      }

    } catch (error: any) {
      console.error('Bulk processing failed:', error);
      alert('Failed to process topics. Please try again.');
    }
  };

  const handleCustomPromptExtraction = async () => {
    if (!customPrompt.trim()) {
      // Create a temporary notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium';
      notification.textContent = '✨ Please enter a custom prompt to continue';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      return;
    }

    const token = await authService.getToken();
    if (!token) {
      console.error('No authentication token available');
      alert('Authentication required. Please log in again.');
      return;
    }

    setIsReextracting(true);
    setLoading(true);

    try {
      console.log('Sending custom prompt extraction request...');
      const apiResponse = await fetch('http://localhost:3000/api/extract-topics-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          ...content,
          customPrompt: customPrompt.trim(),
        }),
      });

      if (!apiResponse.ok) {
        throw new Error(`Custom extraction failed: ${apiResponse.status}`);
      }

      const apiData = await apiResponse.json();
      console.log('Custom topics extracted:', apiData.topics?.length || 0);
      
      const extractedTopics = (apiData.topics || []).map((topic: any) => ({
        ...topic,
        selected: true // Auto-tick all topics by default
      }));
      setTopics(extractedTopics);
      
      // Close the custom prompt UI
      setShowCustomPrompt(false);
      setCustomPrompt('');
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 text-sm font-medium flex items-center space-x-2';
      notification.innerHTML = `<span>🎉</span><span>Successfully re-extracted ${extractedTopics.length} topics with your custom prompt!</span>`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 4000);

    } catch (error) {
      console.error('Custom extraction failed:', error);
      alert('Failed to extract topics with custom prompt. Please try again.');
    } finally {
      setIsReextracting(false);
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const allSelected = topics.every(topic => topic.selected);
    setTopics(prev => prev.map(topic => ({ ...topic, selected: !allSelected })));
  };

  const selectedCount = topics.filter(topic => topic.selected).length;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="font-bold text-slate-100 text-base leading-tight mb-2">{content.title}</h2>
            <div className="flex items-center space-x-2 text-xs">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-900 px-2 py-1 rounded-full font-medium">
                {content.type.toUpperCase()}
              </span>
              <span className="text-slate-400">
                📊 {content.wordCount} words
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onScanNewPage}
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-all border border-slate-600 hover:border-slate-500"
        >
          🔄 Scan New Page
        </button>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">Extracted Topics</h3>
            <p className="text-sm text-slate-400">
              🎯 {selectedCount}/{topics.length} selected
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleSelectAll}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-slate-600"
            >
              {topics.every(t => t.selected) ? '✖ Unselect All' : '✓ Select All'}
            </button>
            <button
              onClick={() => setShowCustomPrompt(!showCustomPrompt)}
              className="btn-secondary text-xs px-3 py-1.5 rounded-lg transition-all"
              disabled={isReextracting}
            >
              {showCustomPrompt ? '✖ Cancel' : '✨ Custom Prompt'}
            </button>
          </div>
        </div>
      
        {showCustomPrompt && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <h4 className="text-sm font-semibold text-slate-100">🎨 Customize Topic Extraction</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Provide specific instructions to guide the AI extraction process:
            </p>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Focus only on technical concepts, Extract business strategies, Include step-by-step processes, Emphasize practical applications..."
              className="w-full text-sm bg-slate-800 border border-slate-600 rounded-lg p-3 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-slate-100 placeholder-slate-500"
              disabled={isReextracting}
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleCustomPromptExtraction}
                disabled={isReextracting || !customPrompt.trim()}
                className={`flex-1 text-sm px-4 py-2 rounded-lg font-semibold transition-all transform ${
                  isReextracting || !customPrompt.trim()
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'btn-primary hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isReextracting ? '🔄 Re-extracting...' : '🚀 Re-extract Topics'}
              </button>
              <button
                onClick={() => {
                  setShowCustomPrompt(false);
                  setCustomPrompt('');
                }}
                disabled={isReextracting}
                className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-600"
              >
                ✖ Cancel
              </button>
            </div>
          </div>
        )}
      
        <div className="space-y-3 mt-4">
          {topics.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <div className="text-4xl mb-2">💭</div>
              <p>No topics found</p>
            </div>
          ) : (
            topics.map((topic, idx) => (
              <TopicItem
                key={topic.id || idx}
                topic={topic}
                onToggleSelect={() => handleToggleSelect(idx)}
                selected={!!topic.selected}
              />
            ))
          )}
        </div>
      </div>
      
      {topics.length > 0 && (
        <button
          onClick={handleProcessSelectedTopics}
          disabled={selectedCount === 0}
          className={`w-full px-6 py-4 rounded-xl font-bold text-base transition-all transform ${
            selectedCount > 0
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-green-500/25'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          🚀 Process {selectedCount} Selected Topic{selectedCount !== 1 ? 's' : ''} for Flashcards
        </button>
      )}
    </div>
  );
};

export default TopicsPreview;