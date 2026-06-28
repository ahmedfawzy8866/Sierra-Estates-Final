/**
 * Theme Provider Context
 * Provides design tokens to the entire app
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { theme, Theme } from './tokens';

// Create theme context
const ThemeContext = createContext<Theme | undefined>(undefined);

/**
 * ThemeProvider component
 * Wraps the app to provide theme tokens
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme tokens
 * @example
 * const { colors, spacing } = useTheme();
 */
export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

/**
 * Export theme for use outside components
 * @example
 * import { theme } from '@/theme/ThemeProvider';
 */
export { theme };
