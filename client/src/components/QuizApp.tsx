import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopicSelection from './TopicSelection';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import QuizQuestions from './QuizQuestions';
import QuizResults from './QuizResults';
import AnimatedTitle from './AnimatedTitle';
import { Question, Topic } from '@shared/types';
import { useToast } from '@/hooks/use-toast';
import { fetchQuizQuestions } from '@/lib/api';
import { playSound, transitionSound } from '@/lib/sounds';

type ActivePage = 'topic-selection' | 'loading' | 'error' | 'quiz-questions' | 'quiz-results';

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export default function QuizApp() {
  const [activePage, setActivePage] = useState<ActivePage>('topic-selection');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);
  const { toast } = useToast();
  
  // Initialize page load animation
  useEffect(() => {
    // Set a small delay to ensure smooth entry animation
    const timer = setTimeout(() => setPageLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic);
    setActivePage('loading');

    try {
      const data = await fetchQuizQuestions(topic.id);
      setQuestions(data.questions);
      // Initialize userAnswers array with nulls
      setUserAnswers(new Array(data.questions.length).fill(null));
      setCurrentQuestionIndex(0);
      setActivePage('quiz-questions');
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error fetching questions",
        description: "We couldn't load your quiz. Please try again.",
        variant: "destructive",
      });
      setActivePage('error');
    }
  };

  const handleRetry = () => {
    if (selectedTopic) {
      handleTopicSelect(selectedTopic);
    } else {
      setActivePage('topic-selection');
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    // Create a copy of userAnswers and update the current answer
    const newUserAnswers = [...userAnswers];
    
    // If optionIndex is -1, it means the timer expired
    if (optionIndex === -1) {
      // Mark as incorrect with a special value -1 (timeout)
      newUserAnswers[currentQuestionIndex] = -1;
      toast({
        title: "Time's up!",
        description: "You ran out of time for this question.",
        variant: "destructive",
      });
    } else {
      // Normal user selection
      newUserAnswers[currentQuestionIndex] = optionIndex;
    }
    
    setUserAnswers(newUserAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      // Calculate final score
      let finalScore = 0;
      
      for (let i = 0; i < questions.length; i++) {
        const answer = userAnswers[i];
        const correctAnswer = questions[i].correctAnswer;
        
        // Only count as correct if answer matches correctAnswer and is not null or -1 (timeout)
        if (answer !== null && answer !== -1 && answer === correctAnswer) {
          finalScore += 1;
        }
      }
      
      setScore(finalScore);
      setActivePage('quiz-results');
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleStartNewQuiz = () => {
    setActivePage('topic-selection');
    setSelectedTopic(null);
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  const handleRetryQuiz = () => {
    setUserAnswers(new Array(questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setScore(0);
    setActivePage('quiz-questions');
  };

  // Handle page transitions with sound
  const setActivePageWithTransition = (newPage: ActivePage) => {
    playSound(transitionSound, 0.15);
    setActivePage(newPage);
  };

  // Override handlers to include transition sounds
  const handlePageTransition = {
    topicSelect: (topic: Topic) => {
      playSound(transitionSound, 0.15);
      handleTopicSelect(topic);
    },
    startNewQuiz: () => {
      playSound(transitionSound, 0.15);
      handleStartNewQuiz();
    },
    retryQuiz: () => {
      playSound(transitionSound, 0.15);
      handleRetryQuiz();
    }
  };

  return (
    <motion.div 
      className="min-h-screen font-sans text-gray-800 py-8 px-4 md:py-12 bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="quiz-container mx-auto bg-white rounded-xl shadow-md overflow-hidden max-w-3xl hover:shadow-glow"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.5, 
          delay: 0.2, 
          type: "spring", 
          stiffness: 120 
        }}
      >
        {/* App Header with Animated Title */}
        <div className="bg-gradient-to-r from-primary to-primary/80 py-6 px-6 md:px-8">
          <AnimatedTitle 
            text="QUIZ MASTER" 
            className="text-2xl md:text-3xl font-bold text-white tracking-wide mb-2" 
          />
          <motion.p 
            className="text-white opacity-90 mt-1"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            Test your knowledge with AI-powered quizzes
          </motion.p>
        </div>

        {/* App Content Area with Page Transitions */}
        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {activePage === 'topic-selection' && (
              <motion.div
                key="topic-selection"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <TopicSelection onTopicSelect={handlePageTransition.topicSelect} />
              </motion.div>
            )}

            {activePage === 'loading' && (
              <motion.div
                key="loading"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <LoadingState />
              </motion.div>
            )}

            {activePage === 'error' && (
              <motion.div
                key="error"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <ErrorState onRetry={handleRetry} />
              </motion.div>
            )}

            {activePage === 'quiz-questions' && questions.length > 0 && (
              <motion.div
                key="quiz-questions"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <QuizQuestions
                  questions={questions}
                  currentQuestionIndex={currentQuestionIndex}
                  userAnswers={userAnswers}
                  selectedTopic={selectedTopic}
                  onAnswerSelect={handleAnswerSelect}
                  onNextQuestion={handleNextQuestion}
                  onPrevQuestion={handlePrevQuestion}
                />
              </motion.div>
            )}

            {activePage === 'quiz-results' && (
              <motion.div
                key="quiz-results"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <QuizResults
                  score={score}
                  totalQuestions={questions.length}
                  onStartNewQuiz={handlePageTransition.startNewQuiz}
                  onRetryQuiz={handlePageTransition.retryQuiz}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
