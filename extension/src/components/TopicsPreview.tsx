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
  const handleAdd = async (idx: number) => {
    const topicToAdd = topics[idx];
    if (!topicToAdd) return;

    const token = await authService.getToken();
    if (!token) {
      console.error("No authentication token found. Please log in.");
      // Optionally, show a message to the user
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          name: topicToAdd.name,
          description: topicToAdd.description,
          sourceURL: content.url,
          sourceTitle: content.title,
          sourceType: content.type,
          extractedAt: topicToAdd.extractedFrom?.extractedAt || content.extractedAt, // Use topic's extractedAt if available, else content's
          confidence: topicToAdd.confidence,
          category: topicToAdd.category,
          keywords: topicToAdd.keywords,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setTopics((prev: Topic[]) =>
          prev.map((t: Topic, i: number) =>
            i === idx ? { ...t, added: true, id: data.topic._id } : t
          )
        );
      } else {
        // Optionally, show an error message to the user
      }
    } catch (error: any) {
      // Optionally, show a network error message
    }
  };

  const handleRemove = (idx: number) => {
    setTopics((prev: Topic[]) => prev.filter((_: Topic, i: number) => i !== idx));
  };

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
      <h3 className="text-md font-semibold mb-2">Extracted Topics</h3>
      <div className="space-y-2">
        {topics.length === 0 ? (
          <div className="text-gray-400">No topics found.</div>
        ) : (
          topics.map((topic, idx) => (
            <TopicItem
              key={topic.id || idx}
              topic={topic}
              onAdd={() => handleAdd(idx)}
              onRemove={() => handleRemove(idx)}
              added={!!topic.added}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TopicsPreview;