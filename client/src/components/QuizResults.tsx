import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

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
  
  let scoreMessage = "";
  if (percentage >= 90) {
    scoreMessage = "Excellent! You're a master of this topic!";
  } else if (percentage >= 70) {
    scoreMessage = "Great job! You have a solid understanding of this topic.";
  } else if (percentage >= 50) {
    scoreMessage = "Good effort! You're on the right track.";
  } else {
    scoreMessage = "Keep learning! This topic might need more study.";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-10"
    >
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
        <p className="text-gray-600 mb-4">Here's how you did:</p>
        
        <div className="text-3xl font-bold text-primary mb-1">
          {score} / {totalQuestions}
        </div>
        <div className="text-lg text-gray-600">{percentage}% Correct</div>
      </div>
      
      {/* Feedback based on score */}
      <div className="mb-8 px-6">
        <div className="text-gray-700">{scoreMessage}</div>
      </div>
      
      <div className="space-x-4">
        <Button 
          onClick={onStartNewQuiz}
          className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Try Another Topic
        </Button>
        
        <Button 
          variant="outline"
          onClick={onRetryQuiz}
          className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          Retry This Quiz
        </Button>
      </div>
    </motion.div>
  );
}
