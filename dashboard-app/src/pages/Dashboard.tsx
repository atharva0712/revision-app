import React, { useEffect, useState } from 'react';
import { topicService } from '../services/topicService';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

// Define interfaces for the data structures
interface ITopic {
  _id: string;
  name: string;
  description: string;
  sourceTitle: string;
  // ... other topic properties
}

interface IProgress {
  topic: string; // Topic ID
  assessmentScore?: number;
  flashcardsCompletedAt?: Date;
}

interface GroupedTopics {
  [sourceTitle: string]: ITopic[];
}

const DashboardPage: React.FC = () => {
  const [groupedTopics, setGroupedTopics] = useState<GroupedTopics>({});
  const [progress, setProgress] = useState<Record<string, IProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [topicsRes, progressRes] = await Promise.all([
          topicService.getTopics(token),
          topicService.getProgress(token),
        ]);

        if (!topicsRes.success || !progressRes.success) {
          throw new Error('Failed to fetch data');
        }

        // Group topics by sourceTitle
        const groups: GroupedTopics = topicsRes.topics.reduce((acc: GroupedTopics, topic: ITopic) => {
          const source = topic.sourceTitle || 'Uncategorized';
          if (!acc[source]) {
            acc[source] = [];
          }
          acc[source].push(topic);
          return acc;
        }, {});
        setGroupedTopics(groups);

        // Map progress to a dictionary for easy lookup
        const progressMap = progressRes.progress.reduce((acc: Record<string, IProgress>, p: IProgress) => {
          acc[p.topic] = p;
          return acc;
        }, {});
        setProgress(progressMap);

      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching your topics.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <div className="text-center p-10">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Topics</h1>
      {Object.keys(groupedTopics).length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">You haven't added any topics yet. Use the browser extension to scan and add topics.</p>
      ) : (
        Object.entries(groupedTopics).map(([sourceTitle, topics]) => (
          <div key={sourceTitle} className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">{sourceTitle}</h2>
            <div className="space-y-3">
              {topics.map((topic) => (
                <div key={topic._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md dark:bg-gray-700">
                  <div>
                    <h3 className="font-bold">{topic.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{topic.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {progress[topic._id] && (
                      <div className="text-xs text-cyan-500">
                        {progress[topic._id].assessmentScore !== undefined ? `Score: ${progress[topic._id].assessmentScore}` : 'Completed'}
                      </div>
                    )}
                    <Link to={`/revision/${topic._id}`}>
                      <button className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800">
                        Start Revision
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DashboardPage;