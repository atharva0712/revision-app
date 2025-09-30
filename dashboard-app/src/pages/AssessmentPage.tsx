import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AssessmentViewer } from '@/components/AssessmentViewer';
import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClient, ITopicWithContent } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const AssessmentPage: React.FC = () => {
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
          description: "Could not load assessment",
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

  const handleComplete = async (score: number) => {
    if (!topicId) return;

    try {
      // The AssessmentViewer already calculates the score, so we just use it.
      // We might want to send the score to the backend for tracking later.
      // await apiClient.submitAssessment(topicId, completedQuestions); // This would need to be adapted if we track individual questions

      const message = score >= 80 ? "Excellent work!" :
                     score >= 60 ? "Good job!" : "Keep practicing!";
      
      toast({
        title: message,
        description: `Assessment completed with ${score}% score`,
      });
      navigate('/dashboard'); // Navigate back to dashboard after completion
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <Loading size="lg" text="Loading assessment..." />
      </div>
    );
  }

  if (!topic || !topic.assessment.length) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No Assessment Available</h2>
          <p className="text-muted-foreground mb-4">This topic doesn't have any questions yet.</p>
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
    <AssessmentViewer
      questions={topic.assessment}
      topicId={topicId}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
};