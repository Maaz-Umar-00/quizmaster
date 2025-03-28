import { QuizAttempt, TopicStats, UserStats, Topic } from '@shared/types';

// Storage keys
const USER_STATS_KEY = 'quizmaster_user_stats';

// Initialize empty user stats
const initialUserStats: UserStats = {
  quizAttempts: [],
  topicStats: {},
  totalQuizzesTaken: 0,
  totalQuestionsAnswered: 0,
  overallAccuracy: 0
};

// Generate random ID for quiz attempts
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Get user stats from localStorage
export const getUserStats = (): UserStats => {
  try {
    const storedStats = localStorage.getItem(USER_STATS_KEY);
    if (storedStats) {
      return JSON.parse(storedStats);
    }
    return initialUserStats;
  } catch (error) {
    console.error('Error retrieving user stats:', error);
    return initialUserStats;
  }
};

// Save user stats to localStorage
export const saveUserStats = (stats: UserStats): void => {
  try {
    localStorage.setItem(USER_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving user stats:', error);
  }
};

// Add a new quiz attempt and update topic stats
export const recordQuizAttempt = (
  topicId: string,
  topicName: string,
  score: number,
  totalQuestions: number,
  timeSpent: number
): UserStats => {
  const stats = getUserStats();
  
  // Create new quiz attempt
  const newAttempt: QuizAttempt = {
    id: generateId(),
    topicId,
    topicName,
    date: new Date().toISOString(),
    score,
    totalQuestions,
    timeSpent
  };
  
  // Add to attempts list
  stats.quizAttempts = [newAttempt, ...stats.quizAttempts].slice(0, 50); // Keep max 50 recent attempts
  stats.totalQuizzesTaken += 1;
  stats.totalQuestionsAnswered += totalQuestions;
  
  // Calculate total correct answers across all attempts
  const totalCorrectAnswers = stats.quizAttempts.reduce(
    (sum, attempt) => sum + attempt.score, 0
  );
  
  // Update overall accuracy
  stats.overallAccuracy = Math.round(
    (totalCorrectAnswers / stats.totalQuestionsAnswered) * 100
  );
  
  // Update topic stats
  const currentTopicStats = stats.topicStats[topicId] || {
    topicId,
    totalAttempts: 0,
    bestScore: 0,
    averageScore: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    averageTimePerQuestion: 0
  };
  
  // Update topic-specific stats
  const updatedTopicStats: TopicStats = {
    ...currentTopicStats,
    totalAttempts: currentTopicStats.totalAttempts + 1,
    bestScore: Math.max(currentTopicStats.bestScore, Math.round((score / totalQuestions) * 100)),
    totalQuestionsAnswered: currentTopicStats.totalQuestionsAnswered + totalQuestions,
    correctAnswers: currentTopicStats.correctAnswers + score
  };
  
  // Calculate new average score
  updatedTopicStats.averageScore = Math.round(
    (updatedTopicStats.correctAnswers / updatedTopicStats.totalQuestionsAnswered) * 100
  );
  
  // Calculate average time per question
  const topicAttempts = stats.quizAttempts.filter(attempt => attempt.topicId === topicId);
  const totalTimeSpent = topicAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
  const totalTopicQuestions = topicAttempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0);
  
  updatedTopicStats.averageTimePerQuestion = totalTopicQuestions > 0
    ? Math.round(totalTimeSpent / totalTopicQuestions)
    : 0;
  
  // Update topic stats in the stats object
  stats.topicStats = {
    ...stats.topicStats,
    [topicId]: updatedTopicStats
  };
  
  // Save updated stats
  saveUserStats(stats);
  
  return stats;
};

// Get stats for a specific topic
export const getTopicStats = (topicId: string): TopicStats | null => {
  const stats = getUserStats();
  return stats.topicStats[topicId] || null;
};

// Get performance level based on score percentage
export const getPerformanceLevel = (scorePercentage: number): string => {
  if (scorePercentage >= 90) return 'Excellent';
  if (scorePercentage >= 80) return 'Great';
  if (scorePercentage >= 70) return 'Good';
  if (scorePercentage >= 60) return 'Satisfactory';
  if (scorePercentage >= 50) return 'Fair';
  return 'Needs Improvement';
};

// Clear all user statistics (for testing or user reset)
export const clearUserStats = (): void => {
  try {
    localStorage.removeItem(USER_STATS_KEY);
  } catch (error) {
    console.error('Error clearing user stats:', error);
  }
};

// Get recent quiz attempts (limited to a specified number)
export const getRecentAttempts = (limit: number = 5): QuizAttempt[] => {
  const stats = getUserStats();
  return stats.quizAttempts.slice(0, limit);
};

// Get best performing topics
export const getBestPerformingTopics = (limit: number = 3): {topicId: string, score: number}[] => {
  const stats = getUserStats();
  
  return Object.values(stats.topicStats)
    .filter(topic => topic.totalAttempts > 0)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, limit)
    .map(topic => ({
      topicId: topic.topicId,
      score: topic.averageScore
    }));
};

// Get weakest performing topics
export const getWeakestPerformingTopics = (limit: number = 3): {topicId: string, score: number}[] => {
  const stats = getUserStats();
  
  return Object.values(stats.topicStats)
    .filter(topic => topic.totalAttempts > 0)
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, limit)
    .map(topic => ({
      topicId: topic.topicId,
      score: topic.averageScore
    }));
};