import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { IMcq } from '@/lib/api';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface MCQPlayerProps {
  mcqs: IMcq[];
  onComplete: () => void;
}

export const MCQPlayer: React.FC<MCQPlayerProps> = ({ mcqs, onComplete }) => {
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  if (mcqs.length === 0) {
    onComplete();
    return null;
  }

  const currentMcq = mcqs[currentMcqIndex];
  const progress = ((currentMcqIndex + 1) / mcqs.length) * 100;

  const handleNext = () => {
    if (currentMcqIndex < mcqs.length - 1) {
      setCurrentMcqIndex(currentMcqIndex + 1);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
    } else {
      onComplete();
    }
  };

  const checkAnswer = () => {
    setAnswerSubmitted(true);
  };

  return (
    <div className="max-w-2xl w-full">
      <div className="text-center mb-4">
        <p className="text-muted-foreground text-sm">
          Question {currentMcqIndex + 1} of {mcqs.length}
        </p>
        <Progress value={progress} className="w-full mt-2" />
      </div>
      <Card className="cyber-card">
        <CardContent className="p-8">
          <p className="font-semibold mb-4 text-lg">{currentMcq.question}</p>
          <RadioGroup onValueChange={setSelectedAnswer} disabled={answerSubmitted}>
            {currentMcq.options.map((option, index) => {
              const isCorrect = option === currentMcq.correctAnswer;
              const isSelected = selectedAnswer === option;
              let labelClass = "";
              if (answerSubmitted) {
                if (isCorrect) labelClass = "text-green-500";
                if (isSelected && !isCorrect) labelClass = "text-red-500";
              }
              return (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option} id={`mcq-${index}`} />
                  <Label htmlFor={`mcq-${index}`} className={labelClass}>{option}</Label>
                </div>
              );
            })}
          </RadioGroup>
          <div className="mt-6">
            {!answerSubmitted ? (
              <Button onClick={checkAnswer} disabled={!selectedAnswer} className="w-full">
                Check Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full">
                {currentMcqIndex < mcqs.length - 1 ? 'Next Question' : 'Continue'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};