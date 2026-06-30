'use client';

import { useEffect } from 'react';
import { useI18n, Locale } from '@/lib/I18nContext';
import { useTheme } from 'next-themes';

interface ForceThemeAndLocaleProps {
  locale: Locale;
  theme: 'light' | 'dark';
}

export default function ForceThemeAndLocale({ locale, theme }: ForceThemeAndLocaleProps) {
  const { setLocale } = useI18n();
  const { setTheme } = useTheme();

  useEffect(() => {
    setLocale(locale);
    setTheme(theme);
  }, [locale, theme, setLocale, setTheme]);

  return null;
}
