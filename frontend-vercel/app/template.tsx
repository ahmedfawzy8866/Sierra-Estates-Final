'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* The Curtain Overlay */}
      <motion.div
        className="fixed inset-0 z-[99999] pointer-events-none bg-[#0D2035]"
        initial={{ top: 0 }}
        animate={{ top: '-100vh' }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      />
      
      {/* The Content Fade-in */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      >
        {children}
      </motion.div>
    </>
  );
}
