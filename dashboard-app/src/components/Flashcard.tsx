import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IFlashcard } from '@/lib/api';

interface FlashcardProps {
  flashcard: IFlashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onRate?: (rating: number) => void;
  showRatingButtons?: boolean;
}

export const Flashcard: React.FC<FlashcardProps> = ({ flashcard, isFlipped, onFlip, onRate, showRatingButtons = false }) => {
  return (
    <div className="w-full max-w-2xl h-96">
      <div
        className={`flashcard-flip relative w-full h-full cursor-pointer ${isFlipped ? 'flipped' : ''}`}
        onClick={onFlip}
      >
        {/* Front */}
        <Card className="flashcard-face cyber-card absolute inset-0 flex items-center justify-center p-8">
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              {flashcard.front}
            </h2>
            <p className="text-muted-foreground text-sm">
              Click to reveal answer
            </p>
          </CardContent>
        </Card>

        {/* Back */}
        <Card className="flashcard-face flashcard-back cyber-card absolute inset-0 flex items-center justify-center p-8 bg-secondary/10">
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              {flashcard.back}
            </h2>
            {showRatingButtons && isFlipped ? (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-4">How well did you remember?</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={() => onRate && onRate(1)}
                    variant="destructive"
                    className="flex-1 sm:flex-none"
                  >
                    Again
                  </Button>
                  <Button
                    onClick={() => onRate && onRate(2)}
                    variant="outline"
                    className="flex-1 sm:flex-none border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  >
                    Hard
                  </Button>
                  <Button
                    onClick={() => onRate && onRate(3)}
                    variant="default"
                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                  >
                    Good
                  </Button>
                  <Button
                    onClick={() => onRate && onRate(4)}
                    variant="default"
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                  >
                    Easy
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Click to flip back
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};