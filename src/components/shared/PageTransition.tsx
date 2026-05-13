import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard page transition for the GeePay platform.
 * Provides a subtle fade-in and slide-up animation as specified in the design system.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ 
        duration: 0.35, 
        ease: [0.16, 1, 0.3, 1] // Custom spring-like easing from design system
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
