import { motion, AnimatePresence } from 'framer-motion';
import { Question, Topic } from '@shared/types';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface QuizQuestionsProps {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  selectedTopic: Topic | null;
  onAnswerSelect: (optionIndex: number) => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
}

export default function QuizQuestions({
  questions,
  currentQuestionIndex,
  userAnswers,
  selectedTopic,
  onAnswerSelect,
  onNextQuestion,
  onPrevQuestion
}: QuizQuestionsProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestionIndex];
  const isCorrect = userAnswer === currentQuestion.correctAnswer;
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Reset feedback when question changes
  useEffect(() => {
    setShowFeedback(userAnswers[currentQuestionIndex] !== null);
  }, [currentQuestionIndex, userAnswers]);

  const handleAnswerSelect = (optionIndex: number) => {
    if (userAnswers[currentQuestionIndex] !== null) return; // Prevent changing answer
    onAnswerSelect(optionIndex);
    setShowFeedback(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="animate-in slide-in-from-bottom"
    >
      {/* Quiz Progress */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          <span className="capitalize">{selectedTopic?.name}</span> Quiz
        </h2>
        <div className="text-sm font-medium text-gray-500">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="bg-gray-100 h-2 rounded-full mb-8">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm"
        >
          <h3 className="text-lg font-medium mb-5">{currentQuestion.text}</h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let optionClasses = "option-card flex items-start p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50";
              let radioClasses = "w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 mr-3";
              
              // Apply styling based on selection state
              if (userAnswer === index) {
                if (index === currentQuestion.correctAnswer) {
                  optionClasses += " bg-correct/10 border-correct";
                  radioClasses = "w-6 h-6 rounded-full border-2 border-correct bg-correct flex-shrink-0 mr-3";
                } else {
                  optionClasses += " bg-incorrect/10 border-incorrect";
                  radioClasses = "w-6 h-6 rounded-full border-2 border-incorrect flex-shrink-0 mr-3";
                }
              }
              
              // Highlight correct answer if user selected wrong
              if (userAnswer !== null && index === currentQuestion.correctAnswer && userAnswer !== currentQuestion.correctAnswer) {
                optionClasses += " bg-correct/10 border-correct";
              }
              
              return (
                <div
                  key={index}
                  className={optionClasses}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className={radioClasses}></div>
                  <div>{option}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback Message */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 mb-6"
          >
            {isCorrect ? (
              <div className="flex items-center text-correct">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Correct! Well done.</span>
              </div>
            ) : (
              <div className="flex items-center text-incorrect">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">
                  Incorrect. The correct answer is <span className="font-semibold">{currentQuestion.options[currentQuestion.correctAnswer]}</span>.
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline"
          onClick={onPrevQuestion} 
          disabled={currentQuestionIndex === 0}
          className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
        >
          Previous
        </Button>
        
        <Button 
          onClick={onNextQuestion}
          disabled={userAnswer === null}
          className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
        </Button>
      </div>
    </motion.div>
  );
}
