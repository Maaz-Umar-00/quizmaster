import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="py-16 text-center"
    >
      <div className="text-4xl mb-4">😕</div>
      <h3 className="text-xl font-semibold text-destructive mb-2">Oops! Something went wrong</h3>
      <p className="text-gray-600 mb-6">We couldn't load your quiz questions. Please try again.</p>
      <Button onClick={onRetry} className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
        Try Again
      </Button>
    </motion.div>
  );
}
