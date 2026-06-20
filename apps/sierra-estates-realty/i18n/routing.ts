/**
 * next-intl routing configuration.
 *
 * Maps URL segments to locales and sets up redirects for the default
 * locale (e.g. `/` → `/en`). Wired into Next.js middleware via
 * `createMiddleware()` — but for now we keep this opt-in to avoid
 * breaking existing routes that don't yet use the [locale] segment.
 *
 * Enable by:
 *   1. Wrapping app routes in `app/[locale]/...` (move existing app/
 *      contents into that segment)
 *   2. Updating `proxy.ts` to call `createMiddleware(routing)` first
 *   3. Updating `app/layout.tsx` to use `NextIntlClientProvider`
 */

import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
