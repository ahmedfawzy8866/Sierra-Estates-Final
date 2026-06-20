/**
 * next-intl request-scoped configuration.
 *
 * This file is loaded by `getRequestConfig()` in the i18n.ts adapter.
 * It reads the locale from the URL segment (e.g. `/en/listings` or
 * `/ar/listings`) and loads the corresponding JSON message file.
 *
 * Components can then call `useTranslations()` directly (no provider
 * needed) — next-intl handles the React context internally.
 *
 * Migration path:
 *   1. (current) Both I18nContext (custom) and next-intl coexist.
 *   2. (next) Replace I18nContext with next-intl's useTranslations in
 *      new components. Keep I18nContext as a thin wrapper for legacy
 *      code that still imports from it.
 *   3. (final) Once all legacy code is migrated, delete I18nContext.
 */

import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ locale }) => {
  const resolved = (locale ?? defaultLocale) as Locale;
  if (!locales.includes(resolved)) notFound();

  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default,
  };
});
