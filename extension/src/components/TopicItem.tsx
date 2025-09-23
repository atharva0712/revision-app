import React from "react";
import { Topic } from "../App";

interface TopicItemProps {
  topic: Topic;
  onAdd: () => void;
  onRemove: () => void;
  added: boolean;
}

const TopicItem: React.FC<TopicItemProps> = ({ topic, onAdd, onRemove, added }) => {
  return (
    <div className="flex items-center justify-between bg-white rounded shadow p-2 border border-gray-200">
      <div>
        <div className="font-medium">{topic.name}</div>
        <div className="text-xs text-gray-500">{topic.description}</div>
        {topic.category && (
          <div className="text-xs text-blue-500 mt-1">{topic.category}</div>
        )}
      </div>
      <div className="flex space-x-2">
        {added ? (
          <span className="text-sm text-gray-500 px-2 py-1 rounded border border-gray-300">Added</span>
        ) : (
          <>
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              onClick={onAdd}
            >
              Add
            </button>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              onClick={onRemove}
            >
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TopicItem;