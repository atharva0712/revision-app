import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flashcard } from '@/components/Flashcard';
import { MCQPlayer } from '@/components/MCQPlayer';
import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClient, ITopicWithContent } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { IQuestion } from '@/types';

export const StudyPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [topic, setTopic] = useState<ITopicWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'flashcard' | 'mcq'>('flashcard');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGeneratingDiagnostic, setIsGeneratingDiagnostic] = useState(false);

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

  const handleNext = () => {
    if (currentIndex < (topic?.flashcards.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
      setViewMode('flashcard');
      setIsFlipped(false);
    } else {
      handleSessionComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setViewMode('flashcard');
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMcqComplete = () => {
    handleNext();
  };

  const handleSessionComplete = async () => {
    if (!topicId) return;

    try {
      await apiClient.updateProgress(topicId, { flashcardsCompleted: true });
      toast({
        title: "Great job!",
        description: "Study session completed",
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
    
    navigate('/dashboard');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleDeepDiagnostic = async () => {
    if (!topicId) return;

    setIsGeneratingDiagnostic(true);
    try {
      const response = await apiClient.generateDeepDiagnostic(topicId);
      if (response.success && response.questions.length > 0) {
        // Navigate to a new assessment page, passing the questions
        navigate('/diagnostic-assessment', { state: { questions: response.questions, topicName: topic?.name } });
      } else {
        toast({
          title: "Error",
          description: "Could not generate deep diagnostic questions.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error generating deep diagnostic:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate deep diagnostic.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDiagnostic(false);
    }
  };

  if (loading || isGeneratingDiagnostic) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <Loading size="lg" text={isGeneratingDiagnostic ? "Generating deep diagnostic..." : "Loading study session..."} />
      </div>
    );
  }

  if (!topic || !topic.flashcards.length) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No Content Available</h2>
          <p className="text-muted-foreground mb-4">This topic doesn't have any flashcards or questions yet.</p>
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

  const currentFlashcard = topic.flashcards[currentIndex];
  const progress = ((currentIndex + 1) / topic.flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-space-gradient p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={handleBack} 
            variant="outline" 
            className="cyber-border"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Card {currentIndex + 1} of {topic.flashcards.length}
            </p>
            <Progress value={progress} className="w-32 mt-2" />
          </div>
          <Button
            onClick={handleDeepDiagnostic}
            disabled={isGeneratingDiagnostic}
            className="cyber-button-tertiary"
          >
            Deep Diagnostic
          </Button>
        </div>

        <div className="flex justify-center items-center flex-col">
          {viewMode === 'flashcard' ? (
            <Flashcard 
              flashcard={currentFlashcard} 
              isFlipped={isFlipped}
              onFlip={() => {
                setIsFlipped(!isFlipped);
                apiClient.updateFlashcardProgress(topic._id, currentFlashcard._id);
              }}
            />
          ) : (
            <MCQPlayer mcqs={currentFlashcard.mcqs || []} onComplete={handleMcqComplete} />
          )}

          {/* Controls */}
          <div className="flex justify-center space-x-4 mt-8">
            {viewMode === 'flashcard' && (
              <>
                <Button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  variant="outline"
                  className="cyber-border"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button onClick={() => setViewMode('mcq')} className="cyber-border">
                  Test Your Knowledge
                </Button>
                <Button
                  onClick={handleNext}
                  variant="outline"
                  className="cyber-border"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};