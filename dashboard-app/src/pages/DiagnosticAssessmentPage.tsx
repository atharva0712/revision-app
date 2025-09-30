import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loading } from '@/components/ui/loading';
import type { IQuestion } from '@/types';

export const DiagnosticAssessmentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [topicName, setTopicName] = useState<string>('Diagnostic Assessment');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (location.state && location.state.questions) {
      setQuestions(location.state.questions);
      if (location.state.topicName) {
        setTopicName(location.state.topicName);
      }
    } else {
      // If no questions are passed, redirect to dashboard or show an error
      navigate('/dashboard');
    }
  }, [location.state, navigate]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleSubmitAnswer = () => {
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <Loading size="lg" text="Loading diagnostic assessment..." />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-space-gradient flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto cyber-border bg-background/80 backdrop-blur-sm text-center p-6">
          <CardTitle className="text-primary text-3xl mb-4">Deep Diagnostic Complete!</CardTitle>
          <CardContent className="text-foreground text-lg mb-6">
            You have successfully completed the deep diagnostic for {topicName}.
            We hope the detailed explanations helped clarify the topic.
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleReturnToDashboard} className="cyber-button-primary">
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-gradient p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl mx-auto cyber-border bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary text-2xl text-center">
            Deep Diagnostic: {topicName}
          </CardTitle>
          <p className="text-muted-foreground text-sm text-center mt-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-foreground mb-6 text-lg text-center">
            {currentQuestion.questionText}
          </p>
          <RadioGroup onValueChange={handleAnswerSelect} value={selectedAnswer || ""} className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-md hover:bg-accent/50 transition-colors cyber-radio-item">
                <RadioGroupItem value={option} id={`option-${index}`} disabled={showExplanation} />
                <Label htmlFor={`option-${index}`} className="text-foreground text-base flex-grow cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {showExplanation && (
            <div className="mt-6 p-4 rounded-md bg-card/70 cyber-border-blue">
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <p className="text-green-400 font-semibold mb-2">Correct!</p>
              ) : (
                <p className="text-red-400 font-semibold mb-2">Incorrect. The correct answer was: {currentQuestion.correctAnswer}</p>
              )}
              {currentQuestion.explanation && (
                <p className="text-blue-300 font-semibold mb-2">Explanation:</p>
              )}
              <p className="text-muted-foreground text-sm">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center mt-4">
          {!showExplanation ? (
            <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="cyber-button-primary">
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} className="cyber-button-secondary">
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Diagnostic'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
