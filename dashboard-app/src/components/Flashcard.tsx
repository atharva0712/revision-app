import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { IFlashcard } from '@/lib/api';

interface FlashcardProps {
  flashcard: IFlashcard;
}

export const Flashcard: React.FC<FlashcardProps> = ({ flashcard }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full max-w-2xl h-96">
      <div
        className={`flashcard-flip relative w-full h-full cursor-pointer ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
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
            <p className="text-muted-foreground text-sm">
              Click to flip back
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};