import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import InteractiveButton from './InteractiveButton';
import { playSound, clickSound, transitionSound } from '@/lib/sounds';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  onStartNewQuiz: () => void;
  onRetryQuiz: () => void;
}

export default function QuizResults({ 
  score, 
  totalQuestions, 
  onStartNewQuiz, 
  onRetryQuiz 
}: QuizResultsProps) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  // Animate the percentage score from 0 to the actual value
  useEffect(() => {
    // Play transition sound when component mounts
    playSound(transitionSound, 0.2);

    const intervalId = setInterval(() => {
      setAnimatedPercentage(prev => {
        const nextValue = Math.min(prev + 1, percentage);
        if (nextValue === percentage) {
          clearInterval(intervalId);
        }
        return nextValue;
      });
    }, 20);
    
    return () => clearInterval(intervalId);
  }, [percentage]);
  
  let scoreMessage = "";
  if (percentage >= 90) {
    scoreMessage = "Excellent! You're a master of this topic!";
  } else if (percentage >= 70) {
    scoreMessage = "Great job! You have a solid understanding of this topic.";
  } else if (percentage >= 50) {
    scoreMessage = "Good effort! You're on the right track.";
  } else {
    scoreMessage = "Keep practicing! You'll get better!";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-6"
    >
      <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
      <p className="text-muted-foreground mb-8">{scoreMessage}</p>
      
      {/* Circular progress indicator */}
      <div className="relative inline-flex mb-8">
        <div className="w-40 h-40 rounded-full bg-muted">
          <div 
            className="absolute inset-0 flex items-center justify-center shadow-glow"
            style={{
              background: `conic-gradient(#4338ca ${animatedPercentage}%, transparent 0)`,
              borderRadius: '50%',
              width: '10rem',
              height: '10rem',
              boxShadow: animatedPercentage > 70 ? '0 0 15px rgba(67, 56, 202, 0.7)' : 'none',
              transition: 'box-shadow 0.5s ease'
            }}
          >
            <div className="w-32 h-32 rounded-full bg-card flex items-center justify-center">
              <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">{animatedPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score details */}
      <div className="text-center text-primary text-lg font-medium mb-8">
        {score} / {totalQuestions} correct
      </div>
      
      {/* Score breakdown */}
      <div className="bg-accent/30 rounded-lg p-4 mb-8 max-w-sm mx-auto">
        <h3 className="font-semibold mb-3">Score Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Correct Answers:</span>
            </div>
            <span className="font-semibold">{score}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span>Wrong Answers:</span>
            </div>
            <span className="font-semibold">{totalQuestions - score}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
              <span>Total Score:</span>
            </div>
            <span className="font-semibold">{percentage}%</span>
          </div>
        </div>
      </div>
      
      <div className="space-x-4">
        <InteractiveButton 
          onClick={() => {
            playSound(clickSound);
            playSound(transitionSound, 0.3);
            onStartNewQuiz();
          }}
          className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          rippleColor="rgba(255, 255, 255, 0.5)"
        >
          Try Another Topic
        </InteractiveButton>
        
        <InteractiveButton 
          variant="outline"
          onClick={() => {
            playSound(clickSound);
            onRetryQuiz();
          }}
          className="px-5 py-2 border border-border rounded-md hover:bg-muted transition-colors"
          rippleColor="rgba(100, 100, 100, 0.3)"
        >
          Retry This Quiz
        </InteractiveButton>
      </div>
    </motion.div>
  );
}
