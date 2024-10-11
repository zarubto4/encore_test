import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

const variants = {
  initial: { opacity: 0, x: 5 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -5 },
};

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={variants}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
