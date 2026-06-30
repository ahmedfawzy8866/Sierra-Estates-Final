// components/UI/TestimonialCarousel.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple carousel data – could be sourced from a CMS later
const testimonials = [
  {
    q: "Sierra matched me with a villa I hadn't even considered. The AI understood my investment criteria better than I explained them.",
    name: 'Ahmed Fawzy',
    role: 'Investor · Cairo',
    avatar: 'AF'
  },
  {
    q: "A question at 2am, answered in seconds. That's not service — that's a different category.",
    name: 'Layla Hassan',
    role: 'Buyer · Dubai',
    avatar: 'LH'
  },
  {
    q: "We found our compound home in 48 hours. The filtering, the data, the advisor — everything worked like it was built for us.",
    name: 'Omar Mansour',
    role: 'Family Buyer · Fifth Settlement',
    avatar: 'OM'
  }
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

export default function TestimonialCarousel() {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const testimonialIndex = ((page % testimonials.length) + testimonials.length) % testimonials.length;
  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  // Auto‑play on desktop, pause on hover
  useEffect(() => {
    const timer = setInterval(() => paginate(1), 8000);
    return () => clearInterval(timer);
  }, [page]);

  return (
    <div className="sb-testi-grid" style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.6 }}
          className="reveal"
          style={{ padding: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(233,193,118,0.15)' }}
        >
          <p style={{ fontSize: 15, lineHeight: 1.6, color: '#EFF8F7', marginBottom: 16 }}>&ldquo;{testimonials[testimonialIndex].q}&rdquo;</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E9C176', color: '#071422', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
              {testimonials[testimonialIndex].avatar}
            </div>
            <div>
              <strong style={{ color: '#E9C176' }}>{testimonials[testimonialIndex].name}</strong><br />
              <span style={{ fontSize: 12, color: 'rgba(239,248,247,0.6)' }}>{testimonials[testimonialIndex].role}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Navigation arrows */}
      <button
        onClick={() => paginate(-1)}
        aria-label="Previous"
        style={{ position: 'absolute', left: -40, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#E9C176', fontSize: 24 }}
      >&#9664;</button>
      <button
        onClick={() => paginate(1)}
        aria-label="Next"
        style={{ position: 'absolute', right: -40, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#E9C176', fontSize: 24 }}
      >&#9654;</button>
    </div>
  );
}
