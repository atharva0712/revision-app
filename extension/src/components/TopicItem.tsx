import React from "react";
import { Topic } from "../App";

interface TopicItemProps {
  topic: Topic;
  onToggleSelect: () => void;
  selected: boolean;
}

const TopicItem: React.FC<TopicItemProps> = ({ topic, onToggleSelect, selected }) => {
  return (
    <div className={`flex items-center justify-between bg-white rounded shadow p-2 border border-gray-200 transition-opacity ${
      selected ? 'opacity-100' : 'opacity-50'
    }`}>
      <div className="flex-1">
        <div className="font-medium">{topic.name}</div>
        <div className="text-xs text-gray-500">{topic.description}</div>
        {topic.category && (
          <div className="text-xs text-blue-500 mt-1">{topic.category}</div>
        )}
        {topic.confidence && (
          <div className="text-xs text-gray-400 mt-1">
            Confidence: {Math.round(topic.confidence * 100)}%
          </div>
        )}
      </div>
      <div className="ml-3">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="w-5 h-5 text-green-500 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
          />
          <span className="ml-2 text-sm text-gray-700">
            {selected ? 'Selected' : 'Unselected'}
          </span>
        </label>
      </div>
    </div>
  );
};

export default TopicItem;