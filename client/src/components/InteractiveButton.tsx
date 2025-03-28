import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ButtonProps } from '@/components/ui/button';
import { playSound, clickSound } from '@/lib/sounds';

interface RippleButtonProps extends ButtonProps {
  rippleColor?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

interface RippleProps {
  x: number;
  y: number;
  size: number;
  color: string;
}

export default function InteractiveButton({
  children,
  rippleColor = 'rgba(255, 255, 255, 0.7)',
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<RippleProps[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle ripple effect on click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    // Play click sound
    playSound(clickSound);
    
    // Get button dimensions and position
    const buttonRect = buttonRef.current.getBoundingClientRect();
    
    // Calculate ripple position relative to button
    const x = e.clientX - buttonRect.left;
    const y = e.clientY - buttonRect.top;
    
    // Calculate ripple size (should be large enough to cover button)
    const size = Math.max(buttonRect.width, buttonRect.height) * 2;
    
    // Add new ripple
    const newRipple = { x, y, size, color: rippleColor };
    setRipples([...ripples, newRipple]);
    
    // Call original onClick if provided
    if (onClick) onClick(e);
  };
  
  // Remove ripples after animation completes
  useEffect(() => {
    if (ripples.length === 0) return;
    
    const timer = setTimeout(() => {
      setRipples(ripples.slice(1));
    }, 600); // Match animation duration
    
    return () => clearTimeout(timer);
  }, [ripples]);

  return (
    <motion.div
      className="relative overflow-hidden"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Button
        ref={buttonRef}
        onClick={handleClick}
        className="relative"
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple, index) => (
          <span
            key={index}
            className="absolute rounded-full pointer-events-none animate-ripple"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              background: ripple.color,
            }}
          />
        ))}
        
        {/* Button content */}
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  );
}