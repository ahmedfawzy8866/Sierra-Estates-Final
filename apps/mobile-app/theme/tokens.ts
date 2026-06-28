/**
 * Design Tokens - Sierra Estates
 * Comprehensive design system for web & mobile
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colors = {
  // Primary Brand Colors
  primary: {
    dark: '#040C16',      // Navy Deep - Primary background
    gold: '#D4AF37',      // Gold - Accents, highlights
    cream: '#FAF8F5',     // Cream - Primary text
  },

  // Neutrals
  neutral: {
    50: '#F9F9F8',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A39E9B',
    500: '#78716B',
    600: '#57534E',
    700: '#44403C',
    800: '#292422',
    900: '#1C1917',
    950: '#0F0E0D',
  },

  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Backgrounds
  bg: {
    primary: '#040C16',
    secondary: '#0F1423',
    tertiary: '#1A1F2E',
    overlay: 'rgba(4, 12, 22, 0.95)',
  },

  // Text Colors
  text: {
    primary: '#FAF8F5',    // Cream
    secondary: '#D4AF37',  // Gold
    tertiary: '#A39E9B',   // Neutral 400
    muted: '#78716B',      // Neutral 500
  },

  // Borders
  border: {
    light: '#2A3040',
    medium: '#3F4651',
    dark: '#1A1F2E',
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  family: {
    primary: {
      regular: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      bold: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    secondary: '"Playfair Display", serif',
  },

  size: {
    xs: { size: 12, lineHeight: 16 },
    sm: { size: 14, lineHeight: 20 },
    base: { size: 16, lineHeight: 24 },
    lg: { size: 18, lineHeight: 28 },
    xl: { size: 20, lineHeight: 28 },
    '2xl': { size: 24, lineHeight: 32 },
    '3xl': { size: 30, lineHeight: 36 },
    '4xl': { size: 36, lineHeight: 40 },
    '5xl': { size: 48, lineHeight: 48 },
  },

  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Predefined text styles
  styles: {
    h1: {
      size: 48,
      weight: 700,
      lineHeight: 48,
      letterSpacing: -2,
    },
    h2: {
      size: 36,
      weight: 700,
      lineHeight: 40,
      letterSpacing: -1.5,
    },
    h3: {
      size: 30,
      weight: 600,
      lineHeight: 36,
      letterSpacing: -1,
    },
    h4: {
      size: 24,
      weight: 600,
      lineHeight: 32,
    },
    h5: {
      size: 20,
      weight: 600,
      lineHeight: 28,
    },
    body: {
      size: 16,
      weight: 400,
      lineHeight: 24,
    },
    bodySmall: {
      size: 14,
      weight: 400,
      lineHeight: 20,
    },
    caption: {
      size: 12,
      weight: 500,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
  },
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  gold: '0 10px 30px -5px rgba(212, 175, 55, 0.2)',
  goldLg: '0 20px 50px -10px rgba(212, 175, 55, 0.3)',
} as const;

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const animation = {
  duration: {
    instant: 0,
    fast: 150,
    base: 300,
    slow: 500,
    slower: 700,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ============================================================================
// COMPLETE THEME EXPORT
// ============================================================================

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
} as const;

export type Theme = typeof theme;
