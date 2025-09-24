import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FlashcardViewer } from '@/components/FlashcardViewer';
import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClient, ITopicWithContent } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const StudyPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [topic, setTopic] = useState<ITopicWithContent | null>(null);
  const [loading, setLoading] = useState(true);

  const apiClient = new ApiClient(token);

  useEffect(() => {
    if (topicId) {
      fetchTopic();
    }
  }, [topicId]);

  const fetchTopic = async () => {
    if (!topicId) return;

    try {
      const response = await apiClient.getTopic(topicId);
      if (response.success) {
        setTopic(response.topic);
      } else {
        toast({
          title: "Error",
          description: "Could not load topic",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching topic:', error);
      toast({
        title: "Connection Error",
        description: "Could not connect to server",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!topicId) return;

    try {
      await apiClient.updateProgress(topicId, { flashcardsCompleted: true });
      toast({
        title: "Great job!",
        description: "Flashcard session completed",
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
    
    navigate('/dashboard');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <Loading size="lg" text="Loading flashcards..." />
      </div>
    );
  }

  if (!topic || !topic.flashcards.length) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No Flashcards Available</h2>
          <p className="text-muted-foreground mb-4">This topic doesn't have any flashcards yet.</p>
          <button
            onClick={handleBack}
            className="text-primary hover:text-accent transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <FlashcardViewer
      flashcards={topic.flashcards}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
};