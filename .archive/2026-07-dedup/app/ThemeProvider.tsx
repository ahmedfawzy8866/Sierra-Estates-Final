import React, { ReactNode, useEffect } from 'react';
import '@/app/globals.css';

interface ThemeProviderProps {
  children: ReactNode;
  dark?: boolean;
}

export const ThemeProvider = ({ children, dark = true }: ThemeProviderProps) => {
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.style.setProperty('--bg-primary', '#050B14'); // dark navy
      root.style.setProperty('--bg-secondary', '#0A1128');
    } else {
      root.style.setProperty('--bg-primary', '#F5F5F5'); // light background
      root.style.setProperty('--bg-secondary', '#FFFFFF');
    }
  }, [dark]);

  return <>{children}</>;
};
