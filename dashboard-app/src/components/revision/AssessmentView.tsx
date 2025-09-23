import React, { useState } from 'react';

interface IQuestion {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface AssessmentViewProps {
  assessment: IQuestion[];
  onComplete: (score: number) => void;
}

const AssessmentView: React.FC<AssessmentViewProps> = ({ assessment, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleOptionSelect = (questionId: string, option: string) => {
    setUserAnswers({ ...userAnswers, [questionId]: option });
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    assessment.forEach(q => {
      if (userAnswers[q._id] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    const finalScore = Math.round((correctAnswers / assessment.length) * 100);
    setScore(finalScore);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4">
        <h2 className="text-2xl font-bold text-center mb-4">Assessment Results</h2>
        <p className="text-center text-3xl font-bold mb-6">Your Score: {score}%</p>
        <div className="space-y-6">
          {assessment.map((q, index) => (
            <div key={q._id} className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
              <p className="font-semibold">{index + 1}. {q.questionText}</p>
              <div className="mt-2 space-y-2">
                {q.options.map(opt => {
                  const isCorrect = opt === q.correctAnswer;
                  const isUserChoice = userAnswers[q._id] === opt;
                  let optionClass = 'border-gray-300 dark:border-gray-600';
                  if (isCorrect) optionClass = 'border-green-500 text-green-700 dark:text-green-400';
                  if (isUserChoice && !isCorrect) optionClass = 'border-red-500 text-red-700 dark:text-red-400';

                  return (
                    <div key={opt} className={`p-2 border rounded ${optionClass}`}>
                      {opt}
                    </div>
                  );
                })}
              </div>
              {q.explanation && <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Explanation: {q.explanation}</p>}
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button onClick={() => onComplete(score)} className="px-8 py-3 font-bold text-white bg-blue-600 rounded-lg">Finish Session</button>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment[currentQuestionIndex];

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-4">Assessment</h2>
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <p className="text-lg font-semibold mb-4">Question {currentQuestionIndex + 1} of {assessment.length}</p>
        <p className="text-xl mb-6">{currentQuestion.questionText}</p>
        <div className="space-y-3">
          {currentQuestion.options.map(option => (
            <button 
              key={option}
              onClick={() => handleOptionSelect(currentQuestion._id, option)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors
                ${userAnswers[currentQuestion._id] === option 
                  ? 'bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400' 
                  : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600'}`
              }
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)} 
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 font-semibold rounded-lg disabled:opacity-50 bg-gray-300 dark:bg-gray-600"
        >
          Prev
        </button>
        {currentQuestionIndex === assessment.length - 1 ? (
          <button onClick={handleSubmit} className="px-6 py-2 font-bold text-white bg-green-600 rounded-lg">Submit</button>
        ) : (
          <button 
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} 
            className="px-6 py-2 font-semibold rounded-lg bg-gray-300 dark:bg-gray-600"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default AssessmentView;