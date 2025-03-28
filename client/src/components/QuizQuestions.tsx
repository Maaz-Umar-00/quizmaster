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

  // Handle feedback effects and stop timer when answer is selected
  useEffect(() => {
    // Check if there's a valid userAnswer
    const hasValidAnswer = userAnswer !== null;
    
    // Stop timer when answer is selected
    if (hasValidAnswer && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [userAnswer]);
  
  // Handle answer feedback effects separately to avoid state updates during render
  useEffect(() => {
    // Check if this question has been answered
    const isAnswered = userAnswers[currentQuestionIndex] !== null;
    
    // Update feedback visibility
    if (showFeedback !== isAnswered) {
      setShowFeedback(isAnswered);
    }
    
    // Only proceed with answer effects if the question is answered
    if (!isAnswered) return;
    
    // Check for correct answer
    const isCorrectAnswer = userAnswer === currentQuestion.correctAnswer;
    
    // Show appropriate feedback based on answer
    if (isCorrectAnswer) {
      setShowConfetti(true);
      playSound(correctSound, 0.3);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    } else if (userAnswer !== null && userAnswer !== -1) {
      setShakeOption(userAnswer);
      playSound(wrongSound, 0.2);
      const timer = setTimeout(() => setShakeOption(null), 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, userAnswers, userAnswer, currentQuestion.correctAnswer, showFeedback]);

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
      className="animate-in slide-in-from-bottom relative"
    >
      {/* Right side fire glow effect */}
      <div className="side-fire-glow" />
      
      {/* Show confetti when answer is correct */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {/* Quiz Progress and Timer */}
      <div className="flex items-center justify-between mb-6">
        <motion.h2 
          className="text-xl font-semibold neon-text text-primary"
          animate={{ 
            textShadow: [
              '0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px currentColor',
              '0 0 8px rgba(255, 255, 255, 0.5), 0 0 15px currentColor, 0 0 20px currentColor',
              '0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px currentColor'
            ],
            transition: { duration: 3, repeat: Infinity }
          }}
        >
          <span className="capitalize">{selectedTopic?.name}</span> Quiz
        </motion.h2>
        <div className="flex items-center gap-4">
          {/* Timer */}
          <motion.div 
            className={`flex items-center font-mono ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-blue-300'}`}
            animate={timeLeft <= 10 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{timeLeft}s</span>
          </motion.div>
          <div className="text-sm font-medium text-blue-200 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-400/30">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      </div>

      {/* Futuristic progress bar */}
      <div className="bg-gray-900/50 h-2 rounded-full mb-8 overflow-hidden border border-gray-700 shadow-inner">
        <motion.div 
          className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-2 rounded-full" 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ 
            boxShadow: "0 0 10px rgba(0, 170, 255, 0.7), 0 0 20px rgba(0, 170, 255, 0.4)"
          }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 15 }}
          className="bg-card border border-border rounded-xl p-6 mb-6 shadow-xl"
          style={{
            background: "linear-gradient(to bottom, rgba(26, 27, 58, 0.9), rgba(44, 46, 85, 0.95))",
            boxShadow: "0 4px 25px rgba(0, 0, 0, 0.3), 0 0 15px var(--color-primary-glow)"
          }}
        >
          <h3 className="text-lg font-medium mb-6 text-white neon-text">{currentQuestion.text}</h3>
          
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              // Define glow classes with different colors for each option
              const glowColors = [
                'option-glow-cyan', 
                'option-glow-magenta', 
                'option-glow-blue',
                'option-glow-cyan'
              ];
              
              let optionClasses = "option-card flex items-start border rounded-lg cursor-pointer z-10 relative";
              let radioClasses = "w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 mr-3 relative z-10";
              
              // Add unique color glow for each option
              optionClasses += ` ${glowColors[index % glowColors.length]}`;
              
              // First, handle showing the correct answer for all cases where user has answered
              if (userAnswer !== null) {
                // If this is the correct answer, always highlight it as correct
                if (index === currentQuestion.correctAnswer) {
                  optionClasses += " option-correct";
                  radioClasses = "w-6 h-6 rounded-full border-2 border-correct bg-correct flex-shrink-0 mr-3 relative z-10";
                } 
                // If user selected this option and it's wrong, highlight as incorrect
                else if (userAnswer === index) {
                  optionClasses += " option-incorrect";
                  radioClasses = "w-6 h-6 rounded-full border-2 border-incorrect bg-incorrect flex-shrink-0 mr-3 relative z-10";
                }
              }
              
              // Apply shake animation for wrong answers
              if (shakeOption === index) {
                optionClasses += " animate-shake";
              }
              
              return (
                <motion.div
                  key={index}
                  className={optionClasses}
                  onClick={() => handleAnswerSelect(index)}
                  onMouseEnter={() => userAnswer === null && playSound(hoverSound, 0.1)}
                  whileHover={{ 
                    scale: userAnswer === null ? 1.03 : 1,
                    y: userAnswer === null ? -2 : 0 
                  }}
                  whileTap={{ scale: userAnswer === null ? 0.98 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className={radioClasses}
                    animate={
                      userAnswer === null ? { scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] } : {}
                    }
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "mirror"
                    }}
                  />
                  <div className="relative z-10 text-white">{option}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback Message */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="rounded-lg p-5 mb-6 backdrop-blur-md relative overflow-hidden"
            style={{ 
              background: userAnswer === -1 
                ? "linear-gradient(to right, rgba(60, 40, 0, 0.5), rgba(80, 60, 0, 0.4))" 
                : isCorrect 
                  ? "linear-gradient(to right, rgba(0, 60, 30, 0.5), rgba(0, 80, 40, 0.4))" 
                  : "linear-gradient(to right, rgba(60, 0, 0, 0.5), rgba(80, 0, 0, 0.4))",
              borderLeft: userAnswer === -1 
                ? "3px solid #f59e0b" 
                : isCorrect 
                  ? "3px solid #10b981" 
                  : "3px solid #ef4444",
              boxShadow: userAnswer === -1 
                ? "0 0 15px rgba(245, 158, 11, 0.3)" 
                : isCorrect 
                  ? "0 0 15px rgba(16, 185, 129, 0.3)" 
                  : "0 0 15px rgba(239, 68, 68, 0.3)"
            }}
          >
            {/* Background glow effect */}
            <motion.div 
              className="absolute inset-0 opacity-20 z-0"
              animate={{ 
                background: [
                  `radial-gradient(circle at 30% 50%, ${userAnswer === -1 ? "#f59e0b" : isCorrect ? "#10b981" : "#ef4444"} 0%, transparent 70%)`,
                  `radial-gradient(circle at 70% 50%, ${userAnswer === -1 ? "#f59e0b" : isCorrect ? "#10b981" : "#ef4444"} 0%, transparent 70%)`,
                  `radial-gradient(circle at 30% 50%, ${userAnswer === -1 ? "#f59e0b" : isCorrect ? "#10b981" : "#ef4444"} 0%, transparent 70%)`
                ]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            
            {userAnswer === -1 ? (
              <div className="flex items-center text-amber-400 relative z-10">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="mr-3 flex-shrink-0 bg-amber-500/20 rounded-full p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </motion.div>
                <span className="font-medium text-amber-100">
                  Time's up! The correct answer is <span className="font-semibold text-amber-300 neon-text">{currentQuestion.options[currentQuestion.correctAnswer]}</span>
                </span>
              </div>
            ) : isCorrect ? (
              <div className="flex items-center text-emerald-400 relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mr-3 flex-shrink-0 bg-emerald-500/20 rounded-full p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </motion.div>
                <motion.span 
                  className="font-medium text-emerald-100"
                  animate={{ opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Correct! Well done.
                </motion.span>
              </div>
            ) : (
              <div className="flex items-center text-red-400 relative z-10">
                <motion.div
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="mr-3 flex-shrink-0 bg-red-500/20 rounded-full p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </motion.div>
                <span className="font-medium text-red-100">
                  Incorrect. The correct answer is <span className="font-semibold text-red-300 neon-text">{currentQuestion.options[currentQuestion.correctAnswer]}</span>
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
          className={`px-6 py-2.5 rounded-md relative overflow-hidden border border-cyan-400/30 
            ${currentQuestionIndex === 0 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:border-cyan-400/70 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(0,180,255,0.5)]'}`
          }
          rippleColor="rgba(0, 210, 255, 0.3)"
          style={{
            background: 'linear-gradient(to right, rgba(0, 66, 99, 0.3), rgba(0, 36, 55, 0.4))',
            boxShadow: '0 0 10px rgba(0, 130, 255, 0.2)',
            textShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
          }}
        >
          <span className="relative z-10 font-medium">Previous</span>
          {currentQuestionIndex !== 0 && (
            <motion.div 
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500" 
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          )}
        </InteractiveButton>
        
        <InteractiveButton 
          onClick={onNextQuestion}
          disabled={userAnswer === null}
          className={`px-6 py-2.5 rounded-md relative overflow-hidden text-white
            ${userAnswer === null 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.7)]'}`
          }
          rippleColor="rgba(255, 255, 255, 0.5)"
          style={{
            background: userAnswer === null 
              ? 'linear-gradient(to right, rgba(80, 0, 180, 0.4), rgba(100, 0, 200, 0.3))' 
              : 'linear-gradient(to right, rgba(120, 0, 255, 0.8), rgba(160, 0, 255, 0.7))',
            boxShadow: '0 0 15px rgba(var(--primary-rgb), 0.3)',
            textShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
          }}
        >
          <span className="relative z-10 font-medium">
            {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
          </span>
          {userAnswer !== null && (
            <>
              <motion.div 
                className="absolute inset-0 opacity-20"
                animate={{ 
                  background: [
                    'radial-gradient(circle at 20% 50%, rgba(var(--primary-rgb), 0.8) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 50%, rgba(var(--primary-rgb), 0.8) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 50%, rgba(var(--primary-rgb), 0.8) 0%, transparent 50%)'
                  ]
                }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <motion.div 
                className="absolute top-0 right-0 h-full w-1.5 bg-gradient-to-b from-purple-400 via-fuchsia-500 to-pink-500" 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </>
          )}
        </InteractiveButton>
      </div>
    </motion.div>
  );
}
