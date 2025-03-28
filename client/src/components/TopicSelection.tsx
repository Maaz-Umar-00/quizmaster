import { TOPICS, Topic } from '@shared/types';
import { motion } from 'framer-motion';
import { playSound, hoverSound, clickSound } from '@/lib/sounds';
import { useState, useEffect } from 'react';

interface TopicSelectionProps {
  onTopicSelect: (topic: Topic) => void;
}

// Letter animation for topic names similar to Quiz Master
const LetterAnimation = ({ text, index: wordIndex }: { text: string, index: number }) => {
  // Animation variants for each letter
  const letterVariants = {
    hidden: { 
      opacity: 0,
      y: 10,
      scale: 0.8,
    },
    visible: (i: number) => ({ 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: 0.8 + (wordIndex * 0.1) + (i * 0.05),
        type: 'spring',
        damping: 12,
        stiffness: 200,
      },
    }),
  };

  // Glow effect
  const glowVariants = {
    idle: {
      textShadow: [
        '0 0 2px rgba(255, 255, 255, 0.5), 0 0 5px currentColor',
        '0 0 4px rgba(255, 255, 255, 0.5), 0 0 10px currentColor',
        '0 0 2px rgba(255, 255, 255, 0.5), 0 0 5px currentColor',
      ],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror" as const,
      },
    },
  };

  return (
    <div className="inline-flex justify-center">
      {Array.from(text).map((letter, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          className="inline-block hover:text-primary"
          whileHover={{
            scale: 1.3,
            transition: { duration: 0.2 },
          }}
        >
          <motion.span
            variants={glowVariants}
            animate="idle"
            className="inline-block"
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        </motion.span>
      ))}
    </div>
  );
};

export default function TopicSelection({ onTopicSelect }: TopicSelectionProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.4,
      },
    },
  };

  const topicCardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.85,
    },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.08,
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    }),
  };

  // Background animation for cards
  const backgroundVariants = {
    hidden: { 
      backgroundPosition: '0% 50%' 
    },
    visible: {
      backgroundPosition: '100% 50%',
      transition: {
        duration: 15,
        repeat: Infinity,
        repeatType: "reverse" as const,
      }
    }
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
      <motion.div
        className="animated-bg absolute top-0 left-0 right-0 bottom-0 -z-10 opacity-25"
        initial="hidden"
        animate="visible"
        variants={backgroundVariants}
      />
      
      <motion.h2 
        className="text-xl font-semibold mb-6 text-center md:text-left neon-text"
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
            custom={index}
            variants={topicCardVariants}
            onClick={() => handleTopicClick(topic)}
            onMouseEnter={() => playSound(hoverSound, 0.1)}
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              transition: { duration: 0.2 } 
            }}
            whileTap={{ scale: 0.95 }}
            className="topic-card hover:shadow-glow relative"
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
            
            {mounted && <LetterAnimation text={topic.name} index={index} />}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
