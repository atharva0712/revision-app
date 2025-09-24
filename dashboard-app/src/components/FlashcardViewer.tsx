import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, RotateCcw, Check } from 'lucide-react';
import { IFlashcard } from '@/lib/api';

interface FlashcardViewerProps {
  flashcards: IFlashcard[];
  onComplete: () => void;
  onBack: () => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  flashcards,
  onComplete,
  onBack
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const markAsKnown = () => {
    setCompletedCards(prev => new Set(prev).add(currentIndex));
    if (currentIndex === flashcards.length - 1) {
      onComplete();
    } else {
      handleNext();
    }
  };

  const resetCard = () => {
    setCompletedCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentIndex);
      return newSet;
    });
  };

  if (!currentCard) return null;

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
              Card {currentIndex + 1} of {flashcards.length}
            </p>
            <Progress value={progress} className="w-32 mt-2" />
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-8">
          <div className="flashcard-3d w-full max-w-2xl h-96">
            <div
              className={`flashcard-flip relative w-full h-full cursor-pointer ${isFlipped ? 'flipped' : ''}`}
              onClick={handleFlip}
            >
              {/* Front */}
              <Card className="flashcard-face cyber-card absolute inset-0 flex items-center justify-center p-8">
                <CardContent className="text-center">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    {currentCard.front}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Click to reveal answer
                  </p>
                </CardContent>
              </Card>

              {/* Back - Removed the inline transform style */}
              <Card className="flashcard-face flashcard-back cyber-card absolute inset-0 flex items-center justify-center p-8 bg-secondary/10">
                <CardContent className="text-center">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    {currentCard.back}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Click to flip back
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            className="cyber-border"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <AnimatePresence>
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex space-x-2"
              >
                {completedCards.has(currentIndex) ? (
                  <Button
                    onClick={resetCard}
                    variant="secondary"
                    className="bg-secondary hover:shadow-glow-secondary"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Mark as Unknown
                  </Button>
                ) : (
                  <Button
                    onClick={markAsKnown}
                    className="bg-neon-gradient hover:shadow-glow-primary"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Got it!
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            variant="outline"
            className="cyber-border"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Completion Status */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Completed: {completedCards.size} / {flashcards.length} cards
          </p>
        </div>
      </div>
    </div>
  );
};