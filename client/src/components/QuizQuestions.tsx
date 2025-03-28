import { motion, AnimatePresence } from 'framer-motion';
import { Question, Topic } from '@shared/types';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import Confetti from 'react-confetti';
import InteractiveButton from './InteractiveButton';
import { playSound, correctSound, wrongSound, hoverSound, clickSound } from '@/lib/sounds';

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
  const [timeLeft, setTimeLeft] = useState(30);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeOption, setShakeOption] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestionIndex];
  // Only consider answers that are not -1 (timeout) and match the correct answer
  const isCorrect = userAnswer !== null && userAnswer !== -1 && userAnswer === currentQuestion.correctAnswer;
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(30);
    setShowFeedback(false);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Check if the question has already been answered
    const isAnswered = userAnswers[currentQuestionIndex] !== null;
    
    // If already answered, show feedback but don't start timer
    if (isAnswered) {
      setShowFeedback(true);
      return;
    }
    
    // Start the timer for unanswered questions
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          // Time's up - auto-select an answer (will be marked as incorrect)
          // We use -1 as a special value to indicate a timeout
          if (userAnswers[currentQuestionIndex] === null) {
            onAnswerSelect(-1);
            setShowFeedback(true);
          }
          
          // Move to next question or finish quiz after a delay
          setTimeout(() => {
            onNextQuestion();
          }, 1500);
          
          // Clear the interval
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    // Clean up the timer on unmount or when the question changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex, userAnswers, onAnswerSelect, onNextQuestion]);

  // Stop timer when answer is selected
  useEffect(() => {
    if (userAnswer !== null && timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Reset feedback when question changes
    setShowFeedback(userAnswers[currentQuestionIndex] !== null);
    
    // Show confetti and play correct sound if the answer is correct
    if (userAnswer === currentQuestion.correctAnswer) {
      setShowConfetti(true);
      playSound(correctSound, 0.3);
      setTimeout(() => setShowConfetti(false), 2000);
    } else if (userAnswer !== null && userAnswer !== -1) {
      // Show shake effect and play wrong sound for wrong answers, but not for timeouts
      setShakeOption(userAnswer);
      playSound(wrongSound, 0.2);
      setTimeout(() => setShakeOption(null), 500);
    }
  }, [currentQuestionIndex, userAnswers, userAnswer, currentQuestion.correctAnswer]);

  const handleAnswerSelect = (optionIndex: number) => {
    if (userAnswers[currentQuestionIndex] !== null) return; // Prevent changing answer
    
    // Play click sound
    playSound(clickSound, 0.2);
    
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
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
      {/* Show confetti when answer is correct */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {/* Quiz Progress and Timer */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          <span className="capitalize">{selectedTopic?.name}</span> Quiz
        </h2>
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={`flex items-center ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono font-medium">{timeLeft}s</span>
          </div>
          <div className="text-sm font-medium text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
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
          className="bg-card border border-border rounded-xl p-6 mb-6 shadow-md"
        >
          <h3 className="text-lg font-medium mb-5">{currentQuestion.text}</h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let optionClasses = "option-card flex items-start p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted";
              let radioClasses = "w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 mr-3";
              
              // First, handle showing the correct answer for all cases where user has answered
              if (userAnswer !== null) {
                // If this is the correct answer, always highlight it as correct
                if (index === currentQuestion.correctAnswer) {
                  optionClasses += " bg-correct/10 border-correct";
                  radioClasses = "w-6 h-6 rounded-full border-2 border-correct bg-correct flex-shrink-0 mr-3";
                } 
                // If user selected this option and it's wrong, highlight as incorrect
                else if (userAnswer === index) {
                  optionClasses += " bg-incorrect/10 border-incorrect";
                  radioClasses = "w-6 h-6 rounded-full border-2 border-incorrect flex-shrink-0 mr-3";
                }
              }
              
              // Apply shake animation for wrong answers
              if (shakeOption === index) {
                optionClasses += " animate-shake";
              }
              
              return (
                <div
                  key={index}
                  className={optionClasses}
                  onClick={() => handleAnswerSelect(index)}
                  onMouseEnter={() => userAnswer === null && playSound(hoverSound, 0.1)}
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
            className="bg-accent/50 rounded-lg p-4 mb-6"
          >
            {userAnswer === -1 ? (
              <div className="flex items-center text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">
                  Time's up! The correct answer is <span className="font-semibold">{currentQuestion.options[currentQuestion.correctAnswer]}</span>.
                </span>
              </div>
            ) : isCorrect ? (
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
        <InteractiveButton 
          variant="outline"
          onClick={onPrevQuestion} 
          disabled={currentQuestionIndex === 0}
          className="px-5 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          rippleColor="rgba(100, 100, 100, 0.3)"
        >
          Previous
        </InteractiveButton>
        
        <InteractiveButton 
          onClick={onNextQuestion}
          disabled={userAnswer === null}
          className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          rippleColor="rgba(255, 255, 255, 0.5)"
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
        </InteractiveButton>
      </div>
    </motion.div>
  );
}
