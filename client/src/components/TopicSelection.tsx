import { TOPICS, Topic } from '@shared/types';
import { motion } from 'framer-motion';
import { playSound, hoverSound, clickSound } from '@/lib/sounds';
import { useState, useEffect } from 'react';
import { BarChart } from 'lucide-react';

interface TopicSelectionProps {
  onTopicSelect: (topic: Topic) => void;
  onViewStats?: () => void;
}

// Letter animation for topic names similar to Quiz Master
const LetterAnimation = ({ text, index: wordIndex }: { text: string, index: number }) => {
  // Animation variants for each letter with enhanced entrance
  const letterVariants = {
    hidden: { 
      opacity: 0,
      y: 15,
      scale: 0.5,
      rotateX: 90, // Start with letters flipped
    },
    visible: (i: number) => ({ 
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0, // Rotate to normal position
      transition: {
        // Timing calculation for sequential appearance
        // First wait for card to appear, then start letter animations
        delay: 1.2 + (wordIndex * 0.2) + (i * 0.06),
        type: 'spring',
        damping: 10,
        stiffness: 150,
        mass: 0.8, // Slightly lower mass for more responsive bounce
      },
    }),
  };

  // Enhanced glow effect with more dramatic pulsing
  const glowVariants = {
    idle: {
      textShadow: [
        '0 0 2px rgba(255, 255, 255, 0.4), 0 0 4px currentColor',
        '0 0 5px rgba(255, 255, 255, 0.5), 0 0 12px currentColor, 0 0 18px rgba(var(--primary-rgb), 0.5)',
        '0 0 2px rgba(255, 255, 255, 0.4), 0 0 4px currentColor',
      ],
      opacity: [0.92, 1, 0.92],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        repeatType: "mirror" as const,
        delay: Math.random() * 0.5, // Random delay for each letter to avoid synchronized pulsing
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

export default function TopicSelection({ onTopicSelect, onViewStats }: TopicSelectionProps) {
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
        staggerChildren: 0.3, // Increase stagger delay between children
        delayChildren: 0.5, // Slight delay before starting animations
      },
    },
  };

  const topicCardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.7, // Start smaller for more noticeable zoom effect
    },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.15, // Longer delay between each item
        duration: 0.8, // Slower animation for smoother effect
        type: "spring",
        stiffness: 100, // Less stiff for smoother motion
        damping: 15, // Less damping for slight bounce
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
      className="animate-in slide-in-from-bottom relative"
    >
      {/* Right side fire glow effect */}
      <div className="side-fire-glow" />
      
      <motion.div
        className="animated-bg absolute top-0 left-0 right-0 bottom-0 -z-10 opacity-25"
        initial="hidden"
        animate="visible"
        variants={backgroundVariants}
      />
      
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          className="text-xl font-semibold text-center md:text-left neon-text"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Choose a topic to start your quiz
        </motion.h2>
        
        {onViewStats && (
          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 hover:bg-primary/40 text-primary shadow-glow transition-all"
            onClick={() => {
              playSound(clickSound);
              onViewStats();
            }}
            onMouseEnter={() => playSound(hoverSound, 0.1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <BarChart className="w-4 h-4" />
            <span>Stats</span>
          </motion.button>
        )}
      </div>
      
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
