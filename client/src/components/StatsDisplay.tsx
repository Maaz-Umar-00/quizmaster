import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Clock, Check, BarChart2, Percent, BarChart, Calendar } from 'lucide-react';
import {
  getUserStats,
  getTopicStats,
  getBestPerformingTopics,
  getWeakestPerformingTopics,
  getRecentAttempts
} from '@/lib/userStatsService';
import { TOPICS } from '@shared/types';
import { playSound, clickSound } from '@/lib/sounds';

interface StatsDisplayProps {
  onClose: () => void;
}

export default function StatsDisplay({ onClose }: StatsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'history'>('overview');
  const [stats, setStats] = useState(getUserStats());
  
  // Recalculate stats each time the component is shown
  useEffect(() => {
    setStats(getUserStats());
  }, []);
  
  // Find topic name by id
  const getTopicName = (topicId: string): string => {
    const topic = TOPICS.find(t => t.id === topicId);
    return topic ? topic.name : topicId;
  };
  
  const getTopicEmoji = (topicId: string): string => {
    const topic = TOPICS.find(t => t.id === topicId);
    return topic ? topic.emoji : '📚';
  };

  // Format date to readable string
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format seconds to minutes and seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  // Performance color based on percentage
  const getPerformanceColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-blue-400';
    if (percentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const handleTabClick = (tab: 'overview' | 'performance' | 'history') => {
    playSound(clickSound);
    setActiveTab(tab);
  };
  
  // Empty state when no quizzes taken
  if (stats.totalQuizzesTaken === 0) {
    return (
      <div className="p-6 md:p-8 relative">
        <div className="absolute top-2 right-2">
          <button 
            onClick={onClose} 
            className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-center">Your Quiz Statistics</h2>
        
        <div className="text-center py-12">
          <motion.div 
            className="text-6xl mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' }}
          >
            📊
          </motion.div>
          <h3 className="text-xl font-semibold mb-2">No quiz stats yet</h3>
          <p className="text-muted-foreground">
            Take your first quiz to start tracking your progress!
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Close button */}
      <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={onClose} 
          className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Header with title and tabs */}
      <div className="bg-card border-b border-border p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-4 text-gradient">Your Quiz Statistics</h2>
        
        <div className="flex space-x-1 overflow-x-auto">
          <button 
            onClick={() => handleTabClick('overview')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              activeTab === 'overview' ? 'bg-primary/20 text-primary shadow-glow-sm' : 'hover:bg-primary/10'
            }`}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Overview</span>
          </button>
          
          <button 
            onClick={() => handleTabClick('performance')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              activeTab === 'performance' ? 'bg-primary/20 text-primary shadow-glow-sm' : 'hover:bg-primary/10'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Performance</span>
          </button>
          
          <button 
            onClick={() => handleTabClick('history')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              activeTab === 'history' ? 'bg-primary/20 text-primary shadow-glow-sm' : 'hover:bg-primary/10'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>History</span>
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="stat-card flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Quizzes</p>
                    <h3 className="text-2xl font-bold">{stats.totalQuizzesTaken}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <BarChart className="h-6 w-6" />
                  </div>
                </div>
                
                <div className="stat-card flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                    <h3 className={`text-2xl font-bold ${getPerformanceColor(stats.overallAccuracy)}`}>
                      {Math.round(stats.overallAccuracy)}%
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <Percent className="h-6 w-6" />
                  </div>
                </div>
                
                <div className="stat-card flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Questions Answered</p>
                    <h3 className="text-2xl font-bold">{stats.totalQuestionsAnswered}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <Check className="h-6 w-6" />
                  </div>
                </div>
                
                <div className="stat-card flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Topics</p>
                    <h3 className="text-2xl font-bold">{Object.keys(stats.topicStats).length}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <Award className="h-6 w-6" />
                  </div>
                </div>
              </div>
              
              {/* Top performing topics */}
              <h3 className="text-lg font-semibold mb-3">Top Performing Topics</h3>
              <div className="space-y-3 mb-6">
                {getBestPerformingTopics(3).map((topic, index) => (
                  <div key={topic.topicId} className="performance-card flex items-center">
                    <div className="text-2xl mr-3">{getTopicEmoji(topic.topicId)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{getTopicName(topic.topicId)}</p>
                        <p className={`font-semibold ${getPerformanceColor(topic.score)}`}>
                          {Math.round(topic.score)}%
                        </p>
                      </div>
                      <div className="w-full bg-muted/50 h-2 rounded-full mt-1 overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${topic.score}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {getBestPerformingTopics(3).length === 0 && (
                  <p className="text-muted-foreground text-center py-2">Not enough data yet</p>
                )}
              </div>
              
              {/* Recent activity */}
              <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {getRecentAttempts(3).map((attempt) => (
                  <div key={attempt.id} className="activity-card p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{getTopicEmoji(attempt.topicId)}</span>
                        <div>
                          <p className="font-medium">{attempt.topicName}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(attempt.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getPerformanceColor((attempt.score / attempt.totalQuestions) * 100)}`}>
                          {attempt.score}/{attempt.totalQuestions}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatTime(attempt.timeSpent)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getRecentAttempts(3).length === 0 && (
                  <p className="text-muted-foreground text-center py-2">No recent activity</p>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Topic Performance</h3>
                <div className="space-y-4">
                  {Object.entries(stats.topicStats).map(([topicId, topicStat], index) => {
                    const accuracy = topicStat.correctAnswers / topicStat.totalQuestionsAnswered * 100 || 0;
                    return (
                      <div key={topicId} className="performance-card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{getTopicEmoji(topicId)}</span>
                            <h4 className="font-semibold">{getTopicName(topicId)}</h4>
                          </div>
                          <div className={`font-bold ${getPerformanceColor(accuracy)}`}>
                            {Math.round(accuracy)}%
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Attempts</p>
                            <p className="font-medium">{topicStat.totalAttempts}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Best Score</p>
                            <p className="font-medium">{Math.round(topicStat.bestScore * 100)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Questions</p>
                            <p className="font-medium">{topicStat.totalQuestionsAnswered}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Avg. Time/Question</p>
                            <p className="font-medium">{Math.round(topicStat.averageTimePerQuestion)}s</p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
                          <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${accuracy}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {Object.keys(stats.topicStats).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No performance data yet</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Top Performers</h3>
                  <div className="space-y-2">
                    {getBestPerformingTopics(5).map((topic, index) => (
                      <div key={topic.topicId} className="flex items-center justify-between p-2 rounded bg-primary/5">
                        <div className="flex items-center">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/20 text-primary mr-2">
                            {index + 1}
                          </span>
                          <span className="mr-2">{getTopicEmoji(topic.topicId)}</span>
                          <span>{getTopicName(topic.topicId)}</span>
                        </div>
                        <span className={`font-semibold ${getPerformanceColor(topic.score)}`}>
                          {Math.round(topic.score)}%
                        </span>
                      </div>
                    ))}
                    
                    {getBestPerformingTopics(5).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No data yet</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Needs Improvement</h3>
                  <div className="space-y-2">
                    {getWeakestPerformingTopics(5).map((topic, index) => (
                      <div key={topic.topicId} className="flex items-center justify-between p-2 rounded bg-primary/5">
                        <div className="flex items-center">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/20 text-primary mr-2">
                            {index + 1}
                          </span>
                          <span className="mr-2">{getTopicEmoji(topic.topicId)}</span>
                          <span>{getTopicName(topic.topicId)}</span>
                        </div>
                        <span className={`font-semibold ${getPerformanceColor(topic.score)}`}>
                          {Math.round(topic.score)}%
                        </span>
                      </div>
                    ))}
                    
                    {getWeakestPerformingTopics(5).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No data yet</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-3">Quiz History</h3>
              
              <div className="space-y-3">
                {stats.quizAttempts.map((attempt) => {
                  const scorePercentage = (attempt.score / attempt.totalQuestions) * 100;
                  return (
                    <div key={attempt.id} className="history-card p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{getTopicEmoji(attempt.topicId)}</span>
                            <h4 className="font-semibold">{attempt.topicName}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{formatDate(attempt.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getPerformanceColor(scorePercentage)}`}>
                            {attempt.score}/{attempt.totalQuestions}
                          </p>
                          <p className="text-sm text-muted-foreground">{Math.round(scorePercentage)}%</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full ${scorePercentage >= 60 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${scorePercentage}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Time: {formatTime(attempt.timeSpent)}</span>
                      </div>
                    </div>
                  );
                })}
                
                {stats.quizAttempts.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No quiz history yet</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}