import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { playSound, hoverSound } from '@/lib/sounds';

interface AnimatedTitleProps {
  text: string;
  className?: string;
}

export default function AnimatedTitle({ text, className = '' }: AnimatedTitleProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Animation variants for the container
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  // Animation variants for each letter
  const letterVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.5,
      rotateX: 90,
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 200,
      },
    },
  };

  // Animation for glow effect
  const glowVariants = {
    pulse: {
      textShadow: [
        '0 0 2px rgba(255, 255, 255, 0.5), 0 0 4px currentColor',
        '0 0 4px rgba(255, 255, 255, 0.5), 0 0 8px currentColor, 0 0 12px currentColor',
        '0 0 2px rgba(255, 255, 255, 0.5), 0 0 4px currentColor',
      ],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror" as const,
      },
    },
  };

  // Split text into letters
  const letters = Array.from(text);

  useEffect(() => {
    // Reset animation state when text changes
    setIsAnimating(true);
    
    // Stop animation after all letters are visible
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, (letters.length * 100) + 1000);
    
    return () => clearTimeout(timer);
  }, [text, letters.length]);

  return (
    <motion.div
      className={`flex justify-center ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          animate={!isAnimating ? 'pulse' : undefined}
          className="inline-block"
          style={{ 
            fontSize: 'inherit',
            color: 'currentColor',
          }}
          onMouseEnter={() => playSound(hoverSound, 0.1)}
          whileHover={{
            scale: 1.2,
            rotate: Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1),
            transition: { duration: 0.2 },
          }}
        >
          <motion.span
            variants={glowVariants}
            animate="pulse"
            className="inline-block"
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        </motion.span>
      ))}
    </motion.div>
  );
}