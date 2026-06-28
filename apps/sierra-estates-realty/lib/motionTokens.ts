/**
 * SIERRA ESTATES — MOTION TOKENS
 * Single source of truth for animation timing across the app.
 * Use with framer-motion (the project standard — do not mix with motion/react):
 *
 *   import { motionTokens } from '@/lib/motionTokens';
 *   <motion.div
 *     initial={{ opacity: 0, y: motionTokens.distance.md }}
 *     animate={{ opacity: 1, y: 0 }}
 *     transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.silk }}
 *   />
 *
 * Pair with useReducedMotion() — zero the distance and shorten duration
 * when the user prefers reduced motion (globals.css also enforces this
 * for CSS-driven animation).
 */
export const motionTokens = {
  duration: {
    fast: 0.18,
    normal: 0.35,
    slow: 0.6,
  },
  easing: {
    /** Brand curve — matches --ease-silk in globals.css */
    silk: [0.16, 1, 0.3, 1] as [number, number, number, number],
    sharp: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
  distance: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  /** Keep list staggers at or under 0.1s — beyond that feels sluggish */
  stagger: 0.08,
} as const;
