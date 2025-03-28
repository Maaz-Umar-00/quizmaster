import { useState } from 'react';
import TopicSelection from './TopicSelection';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import QuizQuestions from './QuizQuestions';
import QuizResults from './QuizResults';
import { Question, Topic } from '@shared/types';
import { useToast } from '@/hooks/use-toast';
import { fetchQuizQuestions } from '@/lib/api';

type ActivePage = 'topic-selection' | 'loading' | 'error' | 'quiz-questions' | 'quiz-results';

export default function QuizApp() {
  const [activePage, setActivePage] = useState<ActivePage>('topic-selection');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen font-sans text-gray-800 py-8 px-4 md:py-12 bg-gray-50">
      <div className="quiz-container mx-auto bg-white rounded-xl shadow-md overflow-hidden max-w-3xl animate-in fade-in">
        {/* App Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 py-6 px-6 md:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">QuizMaster</h1>
          <p className="text-white opacity-90 mt-1">Test your knowledge with AI-powered quizzes</p>
        </div>

        {/* App Content Area */}
        <div className="p-6 md:p-8">
          {activePage === 'topic-selection' && (
            <TopicSelection onTopicSelect={handleTopicSelect} />
          )}

          {activePage === 'loading' && (
            <LoadingState />
          )}

          {activePage === 'error' && (
            <ErrorState onRetry={handleRetry} />
          )}

          {activePage === 'quiz-questions' && questions.length > 0 && (
            <QuizQuestions
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              userAnswers={userAnswers}
              selectedTopic={selectedTopic}
              onAnswerSelect={handleAnswerSelect}
              onNextQuestion={handleNextQuestion}
              onPrevQuestion={handlePrevQuestion}
            />
          )}

          {activePage === 'quiz-results' && (
            <QuizResults
              score={score}
              totalQuestions={questions.length}
              onStartNewQuiz={handleStartNewQuiz}
              onRetryQuiz={handleRetryQuiz}
            />
          )}
        </div>
      </div>
    </div>
  );
}
