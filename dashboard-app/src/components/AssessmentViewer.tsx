import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Check, X, Award } from 'lucide-react';
import { IQuestion } from '@/lib/api';

interface AssessmentViewerProps {
  questions: IQuestion[];
  onComplete: (score: number) => void;
  onBack: () => void;
}

export const AssessmentViewer: React.FC<AssessmentViewerProps> = ({
  questions,
  onComplete,
  onBack
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: answer
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowResults(true);
    
    const correctAnswers = questions.reduce((count, question, index) => {
      return answers[index] === question.correctAnswer ? count + 1 : count;
    }, 0);
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    onComplete(score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (showResults) {
    const correctAnswers = questions.reduce((count, question, index) => {
      return answers[index] === question.correctAnswer ? count + 1 : count;
    }, 0);
    
    const score = Math.round((correctAnswers / questions.length) * 100);

    return (
      <div className="min-h-screen bg-space-gradient p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Card className="cyber-card mb-6">
              <CardHeader>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mx-auto w-20 h-20 bg-neon-gradient rounded-full flex items-center justify-center mb-4"
                >
                  <Award className="w-10 h-10 text-primary-foreground" />
                </motion.div>
                <CardTitle className="text-3xl font-bold">Assessment Complete!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
                    {score}%
                  </div>
                  <p className="text-muted-foreground">
                    {correctAnswers} out of {questions.length} correct
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-400">{correctAnswers}</div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-red-400">{questions.length - correctAnswers}</div>
                    <div className="text-sm text-muted-foreground">Incorrect</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">{questions.length}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>

                <Button
                  onClick={onBack}
                  className="w-full bg-neon-gradient hover:shadow-glow-primary"
                >
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Review incorrect answers */}
            <div className="space-y-4">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                if (isCorrect) return null;

                return (
                  <motion.div
                    key={question._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="cyber-card border-red-500/30">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <X className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-2">
                              {question.questionText}
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="text-red-400">
                                Your answer: {userAnswer || 'No answer'}
                              </div>
                              <div className="text-green-400">
                                Correct answer: {question.correctAnswer}
                              </div>
                              {question.explanation && (
                                <div className="text-muted-foreground">
                                  {question.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-gradient p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="cyber-border"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <Progress value={progress} className="w-32 mt-2" />
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="cyber-card mb-8">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">
                  {currentQuestion.questionText}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[currentIndex] || ''}
                  onValueChange={handleAnswerSelect}
                  className="space-y-4"
                >
                  {currentQuestion.options.map((option, optionIndex) => (
                    <motion.div
                      key={optionIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: optionIndex * 0.1 }}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/10 transition-colors cursor-pointer"
                      onClick={() => handleAnswerSelect(option)}
                    >
                      <RadioGroupItem value={option} id={`option-${optionIndex}`} />
                      <Label htmlFor={`option-${optionIndex}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            className="cyber-border"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-center text-muted-foreground text-sm">
            {Object.keys(answers).length} / {questions.length} answered
          </div>

          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
              className="bg-electric-gradient hover:shadow-glow-secondary"
            >
              <Check className="w-4 h-4 mr-2" />
              Submit Assessment
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!answers[currentIndex]}
              variant="outline"
              className="cyber-border"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};