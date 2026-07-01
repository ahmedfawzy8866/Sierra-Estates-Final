/**
 * ══════════════════════════════════════════════════════════════════════════════
 * PRESERVED ANIMATION CODE FROM OLD CLIENT PAGE & HERO COMPONENTS
 * Source: components/Hero.tsx, components/HeroFilter.tsx, app/designTokens.css
 * Date Archived: 2026-06-29
 * Purpose: Save all animation logic before refactoring UI
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ══ COUNTER ANIMATION (from Hero.tsx) ══════════════════════════════════════════
// Animated counter with IntersectionObserver and cubic easeOut timing
export const counterAnimationLogic = `
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // cubic easeOut
            setCount(Math.round(ease * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}
`;

// ══ SCROLL CUE ANIMATION ══════════════════════════════════════════════════════
// Bounce-down SVG indicator with requestAnimationFrame loop
export const scrollCueLogic = `
function ScrollCue() {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10" style={{ animation: 'bounce-down 2s infinite' }}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="rgba(7,20,34,0.4)" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v14M12 16l-4-4M12 16l4-4" />
      </svg>
    </div>
  );
}
`;

// ══ KEYFRAME ANIMATIONS (from designTokens.css) ═════════════════════════════════
export const keyframeAnimations = `
@keyframes aura-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.05); }
}

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-live {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  50%       { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
}

@keyframes bounce-down {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%       { transform: translateX(-50%) translateY(10px); }
}

@keyframes counter-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

// ══ ANIMATION TIMING DELAYS (Staggered Reveal) ═════════════════════════════════
export const animationDelays = {
  // Hero component uses 700ms animation with these delays:
  delay300: 'reveal-up 700ms 300ms both',  // Logo + Badge
  delay450: 'reveal-up 700ms 450ms both',  // Headline
  delay600: 'reveal-up 700ms 600ms both',  // Filter bar
  delay700: 'reveal-up 700ms 700ms both',  // CTA links
  delay800: 'reveal-up 700ms 800ms both',  // Stats counter
};

// ══ EASING FUNCTION (Cubic Bezier) ═════════════════════════════════════════════
export const easingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Silk ease

// ══ FRAMER MOTION TRANSITIONS (from clients/page.tsx) ═════════════════════════
export const framerMotionTransitions = {
  // Page transitions with AnimatePresence
  stepTransition: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  },
  // Success modal animation
  successModal: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5, type: 'spring' },
  },
};

// ══ LOGO WITH AURA ANIMATION ══════════════════════════════════════════════════
export const logoAuraAnimation = `
{/* Aura ring */}
<div
  className="absolute rounded-full pointer-events-none"
  style={{
    inset: '-40px',
    background: 'radial-gradient(circle, rgba(230,57,70,0.22) 0%, rgba(200,150,26,0.10) 40%, transparent 70%)',
    animation: 'aura-pulse 4s ease-in-out infinite',
    zIndex: -1,
  }}
/>
`;

// ══ NOTES FOR IMPLEMENTATION ═══════════════════════════════════════════════════
/**
 * ANIMATION BEST PRACTICES USED:
 *
 * 1. IntersectionObserver for viewport-triggered animations
 * 2. requestAnimationFrame for smooth counter updates
 * 3. Cubic Bezier easing for polished motion feel
 * 4. Staggered delays for sequential reveal pattern
 * 5. Scale + opacity combinations for layered depth
 * 6. 700ms base animation duration with 100-150ms delays
 * 7. Aura pulse uses 4s cycle for subtle background motion
 * 8. Framer Motion for page transitions with spring physics
 *
 * PERFORMANCE NOTES:
 * - All animations use CSS transforms (GPU accelerated)
 * - No layout thrashing; all values pre-calculated
 * - IntersectionObserver prevents off-screen animation waste
 * - Counter animation uses cubic easeOut for natural deceleration
 */
