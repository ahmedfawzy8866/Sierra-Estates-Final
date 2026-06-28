/**
 * Theme Utility Functions
 * Helper functions for working with design tokens
 */

import { theme, spacing, colors, typography, borderRadius, shadows } from './tokens';

// ============================================================================
// MEDIA QUERY HELPERS
// ============================================================================

export const media = {
  xs: `@media (min-width: ${theme.breakpoints.xs}px)`,
  sm: `@media (min-width: ${theme.breakpoints.sm}px)`,
  md: `@media (min-width: ${theme.breakpoints.md}px)`,
  lg: `@media (min-width: ${theme.breakpoints.lg}px)`,
  xl: `@media (min-width: ${theme.breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${theme.breakpoints['2xl']}px)`,
} as const;

// ============================================================================
// CSS HELPER FUNCTIONS
// ============================================================================

/**
 * Create a responsive padding utility
 * @example
 * padding: `${pad(4)}` // single value
 * padding: `${pad([4, 8, 12])}` // responsive [mobile, tablet, desktop]
 */
export const pad = (value: keyof typeof spacing | Array<keyof typeof spacing>) => {
  if (Array.isArray(value)) {
    const [mobile, tablet, desktop] = value.map(v => `${spacing[v]}px`);
    return `${mobile} ${
      tablet ? `; ${media.md} { padding: ${tablet}; }` : ''
    }${desktop ? `; ${media.lg} { padding: ${desktop}; }` : ''}`;
  }
  return `${spacing[value as keyof typeof spacing]}px`;
};

/**
 * Create flexbox with common patterns
 * @example
 * display: 'flex';
 * ...flex('center', 'center')
 */
export const flex = (
  justify: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' = 'start',
  align: 'start' | 'end' | 'center' | 'stretch' = 'stretch',
  direction: 'row' | 'column' = 'row'
) => ({
  display: 'flex',
  flexDirection: direction,
  justifyContent: {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  }[justify],
  alignItems: {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    stretch: 'stretch',
  }[align],
});

/**
 * Create grid with gap
 * @example
 * ...grid(2, 4) // 2 columns, gap: 16px
 * ...grid({ cols: [1, 2, 3], gap: 5 }) // responsive columns
 */
export const grid = (
  cols: number | { cols: number | number[]; gap?: keyof typeof spacing },
  gap?: keyof typeof spacing
) => {
  if (typeof cols === 'number') {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: `${spacing[gap || 4]}px`,
    };
  }

  const { cols: columns, gap: gapValue } = cols;
  const gapPx = spacing[gapValue || 4];

  if (Array.isArray(columns)) {
    const [mobile, tablet, desktop] = columns;
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${mobile}, 1fr)`,
      gap: `${gapPx}px`,
      [media.md]: {
        gridTemplateColumns: `repeat(${tablet}, 1fr)`,
      },
      [media.lg]: {
        gridTemplateColumns: `repeat(${desktop}, 1fr)`,
      },
    };
  }

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gapPx}px`,
  };
};

/**
 * Apply text styles
 * @example
 * ...text('h1')
 * ...text('body', { color: 'secondary' })
 */
export const text = (
  style: keyof typeof typography.styles,
  overrides?: Partial<Record<string, any>>
) => {
  const styleValue = typography.styles[style];
  return {
    fontSize: `${styleValue.size}px`,
    fontWeight: styleValue.weight,
    lineHeight: `${styleValue.lineHeight}px`,
    ...(styleValue.letterSpacing && { letterSpacing: `${styleValue.letterSpacing}px` }),
    ...overrides,
  };
};

/**
 * Apply shadow
 * @example
 * boxShadow: shadow('lg')
 * boxShadow: shadow('gold')
 */
export const shadow = (size: keyof typeof shadows) => shadows[size];

/**
 * Create rounded corner utility
 * @example
 * borderRadius: round('md')
 */
export const round = (size: keyof typeof borderRadius) =>
  `${borderRadius[size]}px`;

/**
 * Responsive spacing utility
 * @example
 * marginBottom: responsive({ mobile: 4, tablet: 8, desktop: 12 })
 */
export const responsive = (
  values: {
    mobile?: keyof typeof spacing;
    tablet?: keyof typeof spacing;
    desktop?: keyof typeof spacing;
  }
) => {
  const mobile = values.mobile ? `${spacing[values.mobile]}px` : '0';
  const tablet = values.tablet ? `${spacing[values.tablet]}px` : mobile;
  const desktop = values.desktop ? `${spacing[values.desktop]}px` : tablet;

  if (mobile === tablet && tablet === desktop) {
    return mobile;
  }

  return `${mobile}${
    tablet !== mobile ? `; ${media.md} { margin: ${tablet}; }` : ''
  }${desktop !== tablet ? `; ${media.lg} { margin: ${desktop}; }` : ''}`;
};

/**
 * Truncate text helper
 * @example
 * ...truncate() // single line
 * ...truncate(2) // 2 lines
 */
export const truncate = (lines = 1) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
});

/**
 * Smooth transitions helper
 * @example
 * transition: smooth('all')
 * transition: smooth('color', 'slow')
 */
export const smooth = (
  property = 'all',
  speed: keyof typeof theme.animation.duration = 'base'
) => {
  const duration = `${theme.animation.duration[speed]}ms`;
  return `${property} ${duration} ease-in-out`;
};

/**
 * Hover scale effect
 * @example
 * '&:hover': { transform: hoverScale() }
 */
export const hoverScale = (scale = 1.02) => ({
  transform: `scale(${scale})`,
  transition: smooth('transform', 'fast'),
});

/**
 * Focus ring (accessibility)
 * @example
 * '&:focus': { ...focusRing() }
 */
export const focusRing = (
  ringColor: string = colors.primary.gold,
  width = 2
) => ({
  outline: 'none',
  boxShadow: `0 0 0 ${width}px ${colors.bg.primary}, 0 0 0 ${width + 2}px ${ringColor}`,
});

/**
 * Visually hide element (accessibility)
 * @example
 * ...visuallyHidden()
 */
export const visuallyHidden = () => ({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
});

/**
 * Aspect ratio helper (for images/video containers)
 * @example
 * paddingBottom: aspectRatio(16, 9)
 */
export const aspectRatio = (width: number, height: number) =>
  `${(height / width) * 100}%`;
