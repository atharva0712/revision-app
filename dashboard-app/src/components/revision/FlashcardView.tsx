import React, { useState } from 'react';

interface IFlashcard {
  _id: string;
  front: string;
  back: string;
}

interface FlashcardViewProps {
  flashcards: IFlashcard[];
  onComplete: () => void;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ flashcards, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-center text-sm mt-2 text-gray-600 dark:text-gray-400">Card {currentIndex + 1} of {flashcards.length}</p>
      </div>

      <div 
        className="relative w-full h-80 perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`absolute w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front of the card */}
          <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <p className="text-2xl text-center">{currentCard.front}</p>
          </div>
          {/* Back of the card */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg">
            <p className="text-xl text-center">{currentCard.back}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button onClick={handlePrev} disabled={currentIndex === 0} className="px-6 py-2 font-semibold rounded-lg disabled:opacity-50 bg-gray-300 dark:bg-gray-600">Prev</button>
        <button onClick={() => setIsFlipped(!isFlipped)} className="px-6 py-2 font-bold text-white bg-cyan-600 rounded-lg">Flip</button>
        {currentIndex === flashcards.length - 1 ? (
          <button onClick={onComplete} className="px-6 py-2 font-bold text-white bg-green-600 rounded-lg">Finish</button>
        ) : (
          <button onClick={handleNext} className="px-6 py-2 font-semibold rounded-lg bg-gray-300 dark:bg-gray-600">Next</button>
        )}
      </div>
    </div>
  );
};

export default FlashcardView;