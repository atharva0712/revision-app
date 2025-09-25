import React from 'react';
import { Content, Topic } from '../App';

interface RecentExtractionsProps {
  recentExtractions: { content: Content; topics: Topic[] }[];
  onSelectRecentExtraction: (content: Content, topics: Topic[]) => void;
}

const RecentExtractions: React.FC<RecentExtractionsProps> = ({
  recentExtractions,
  onSelectRecentExtraction,
}) => {
  if (recentExtractions.length === 0) {
    return null; // Don't render if there are no recent extractions
  }

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-md shadow-inner">
      <h3 className="text-md font-semibold mb-2 text-gray-700">Recent Scans</h3>
      <ul className="space-y-2">
        {recentExtractions.map((item, index) => (
          <li key={index} className="flex items-center justify-between bg-white p-2 rounded shadow-sm border border-gray-200">
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-800">{item.content.title}</div>
              <div className="text-xs text-gray-500 truncate">{item.content.url}</div>
              <div className="text-xs text-gray-400">{item.topics?.length || 0} topics</div>
            </div>
            <button
              onClick={() => onSelectRecentExtraction(item.content, item.topics)}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              Load
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentExtractions;
