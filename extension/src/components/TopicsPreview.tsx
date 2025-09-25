import React from "react";
import { Topic, Content } from "../App";
import TopicItem from "./TopicItem";
import { authService } from "../services/authService";

interface TopicsPreviewProps {
  topics: Topic[];
  setTopics: React.Dispatch<React.SetStateAction<Topic[]>>;
  content: Content;
  onScanNewPage: () => void; // New prop
}

const TopicsPreview: React.FC<TopicsPreviewProps> = ({ topics, setTopics, content, onScanNewPage }) => {
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
      alert('Please select at least one topic to process.');
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

  const handleSelectAll = () => {
    const allSelected = topics.every(topic => topic.selected);
    setTopics(prev => prev.map(topic => ({ ...topic, selected: !allSelected })));
  };

  const selectedCount = topics.filter(topic => topic.selected).length;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2 text-gray-700">
        <div>
          <span className="font-bold">{content.title}</span>
          <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
            {content.type.toUpperCase()}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          Words: {content.wordCount}
        </span>
      </div>
      <button
        onClick={onScanNewPage}
        className="w-full bg-gray-200 text-gray-800 px-3 py-1 rounded shadow hover:bg-gray-300 text-sm mb-4"
      >
        Scan New Page
      </button>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-semibold">Extracted Topics ({selectedCount}/{topics.length} selected)</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
          >
            {topics.every(t => t.selected) ? 'Unselect All' : 'Select All'}
          </button>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {topics.length === 0 ? (
          <div className="text-gray-400">No topics found.</div>
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
      {topics.length > 0 && (
        <button
          onClick={handleProcessSelectedTopics}
          disabled={selectedCount === 0}
          className={`w-full px-4 py-3 rounded font-medium transition-colors ${
            selectedCount > 0
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Process {selectedCount} Selected Topic{selectedCount !== 1 ? 's' : ''} for Flashcards
        </button>
      )}
    </div>
  );
};

export default TopicsPreview;