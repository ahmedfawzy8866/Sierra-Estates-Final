'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Locale = 'en' | 'ar';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    'dashboard.title': 'Dashboard',
    'dashboard.overview': 'Overview',
    'listings.title': 'Listings',
    'listings.browse': 'Browse Properties',
    'crm.title': 'CRM',
    'crm.leads': 'Manage Leads',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.back': 'Back',
  },
  ar: {
    'dashboard.title': 'لوحة التحكم',
    'dashboard.overview': 'نظرة عامة',
    'listings.title': 'القوائم',
    'listings.browse': 'تصفح العقارات',
    'crm.title': 'إدارة العلاقات',
    'crm.leads': 'إدارة العملاء المحتملين',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.back': 'رجوع',
  },
};

interface I18nContextType {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, subKey?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  dir: 'ltr',
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  }, [locale, setLocale]);

  const t = useCallback((key: string, subKey?: string): string => {
    const fullKey = subKey ? `${key}.${subKey}` : key;
    return translations[locale][fullKey] || translations['en'][fullKey] || fullKey;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, dir, setLocale, toggleLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export default I18nContext;
