import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { topicService } from '../services/topicService';
import { useAuth } from '../contexts/AuthContext';
import FlashcardView from '../components/revision/FlashcardView';
import AssessmentView from '../components/revision/AssessmentView';

// Define interfaces for the data structures
interface IFlashcard {
  _id: string;
  front: string;
  back: string;
  // ... other flashcard properties
}

interface IQuestion {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  // ... other question properties
}

interface ITopic {
  _id: string;
  name: string;
  description: string;
  flashcards: IFlashcard[];
  assessment: IQuestion[];
}

type RevisionMode = 'flashcards' | 'assessment' | null;

const RevisionPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { token } = useAuth();
  const [topic, setTopic] = useState<ITopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<RevisionMode>(null);

  const handleCompletion = async (progressData: { assessmentScore?: number; flashcardsCompleted?: boolean }) => {
    if (!token || !topicId) return;
    try {
      await topicService.updateProgress(token, topicId, progressData);
      // Navigate back to dashboard or show a success message
      setMode(null); // Go back to the mode selection
    } catch (error) {
      console.error("Failed to save progress", error);
      // Optionally show an error message to the user
    }
  };

  useEffect(() => {
    const fetchTopic = async () => {
      if (!token || !topicId) return;

      try {
        setLoading(true);
        const res = await topicService.getTopicById(token, topicId);
        if (res.success) {
          setTopic(res.topic);
        } else {
          throw new Error(res.message || 'Failed to fetch topic');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [token, topicId]);

  if (loading) {
    return <div className="text-center p-10">Loading revision session...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  if (!topic) {
    return <div className="text-center p-10">Topic not found.</div>;
  }

  if (mode === 'flashcards') {
    return <FlashcardView flashcards={topic.flashcards} onComplete={() => handleCompletion({ flashcardsCompleted: true })} />;
  }

  if (mode === 'assessment') {
    return <AssessmentView assessment={topic.assessment} onComplete={(score) => handleCompletion({ assessmentScore: score })} />;
  }

  return (
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold mb-2 dark:text-white">{topic.name}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{topic.description}</p>
      <div className="flex justify-center space-x-6">
        <button 
          onClick={() => setMode('flashcards')}
          className="px-8 py-4 text-lg font-bold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-800"
        >
          Review Flashcards
        </button>
        <button 
          onClick={() => setMode('assessment')}
          className="px-8 py-4 text-lg font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800"
        >
          Take Assessment
        </button>
      </div>
    </div>
  );
};

export default RevisionPage;