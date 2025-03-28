import { TOPICS, Topic } from '@shared/types';
import { motion } from 'framer-motion';
import { playSound, hoverSound, clickSound } from '@/lib/sounds';

interface TopicSelectionProps {
  onTopicSelect: (topic: Topic) => void;
}

export default function TopicSelection({ onTopicSelect }: TopicSelectionProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const topicCardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.9,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  const handleTopicClick = (topic: Topic) => {
    playSound(clickSound);
    onTopicSelect(topic);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="animate-in slide-in-from-bottom"
    >
      <motion.h2 
        className="text-xl font-semibold mb-6 text-center md:text-left"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Choose a topic to start your quiz
      </motion.h2>
      
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {TOPICS.map((topic, index) => (
          <motion.div
            key={topic.id}
            variants={topicCardVariants}
            onClick={() => handleTopicClick(topic)}
            onMouseEnter={() => playSound(hoverSound, 0.1)}
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              transition: { duration: 0.2 } 
            }}
            whileTap={{ scale: 0.95 }}
            className="topic-card hover:shadow-glow"
          >
            <motion.div 
              className="text-primary text-3xl mb-3 animate-glow"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [-1, 1, -1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "mirror",
                delay: index * 0.2
              }}
            >
              {topic.emoji}
            </motion.div>
            <h3 className="font-medium">{topic.name}</h3>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
