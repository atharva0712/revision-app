import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/loading';
import type { IQuestion } from '@/types';

interface AssessmentViewerProps {
  questions: IQuestion[];
  topicId: string;
  onComplete: (score: number) => void;
}

export const AssessmentViewer: React.FC<AssessmentViewerProps> = ({ questions, topicId, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { token } = useAuth();
  const apiClient = new ApiClient(token);
  const [isGeneratingDiagnostic, setIsGeneratingDiagnostic] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(score);
    }
  };

  const handleDeepDiagnostic = async () => {
    setIsGeneratingDiagnostic(true);
    try {
      const response = await apiClient.generateDeepDiagnostic(topicId);
      if (response.success && response.questions.length > 0) {
        navigate('/diagnostic-assessment', { state: { questions: response.questions, topicName: "Deep Diagnostic" } });
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

  if (isGeneratingDiagnostic) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading size="lg" text="Generating deep diagnostic..." />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto cyber-border bg-background/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-primary text-2xl">
          Question {currentQuestionIndex + 1} of {questions.length}
        </CardTitle>
        <Button
          onClick={handleDeepDiagnostic}
          disabled={isGeneratingDiagnostic}
          className="cyber-button-tertiary"
        >
          Deep Diagnostic
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-foreground mb-6 text-lg text-center">
          {currentQuestion.questionText}
        </p>
        <RadioGroup onValueChange={handleAnswerSelect} value={selectedAnswer || ""} className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 rounded-md hover:bg-accent/50 transition-colors cyber-radio-item">
              <RadioGroupItem value={option} id={`option-${index}`} disabled={showResult} />
              <Label htmlFor={`option-${index}`} className="text-foreground text-base flex-grow cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {showResult && (
          <div className="mt-6 p-4 rounded-md bg-card/70 cyber-border-green">
            {selectedAnswer === currentQuestion.correctAnswer ? (
              <p className="text-green-400 font-semibold">Correct!</p>
            ) : (
              <p className="text-red-400 font-semibold">Incorrect. The correct answer was: {currentQuestion.correctAnswer}</p>
            )}
            {currentQuestion.explanation && (
              <p className="text-muted-foreground mt-2 text-sm">
                <span className="font-semibold">Explanation:</span> {currentQuestion.explanation}
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center mt-4">
        {!showResult ? (
          <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="cyber-button-primary">
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNextQuestion} className="cyber-button-secondary">
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Assessment'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};