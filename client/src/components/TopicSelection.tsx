import { TOPICS, Topic } from '@shared/types';
import { motion } from 'framer-motion';

interface TopicSelectionProps {
  onTopicSelect: (topic: Topic) => void;
}

export default function TopicSelection({ onTopicSelect }: TopicSelectionProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="animate-in slide-in-from-bottom"
    >
      <h2 className="text-xl font-semibold mb-6">Choose a topic to start your quiz</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TOPICS.map((topic) => (
          <div
            key={topic.id}
            onClick={() => onTopicSelect(topic)}
            className="topic-card bg-white border border-gray-200 rounded-lg p-5 text-center cursor-pointer transition-all duration-300 hover:border-primary hover:translate-y-[-5px] hover:shadow-lg"
          >
            <div className="text-primary text-2xl mb-2">{topic.emoji}</div>
            <h3 className="font-medium">{topic.name}</h3>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
