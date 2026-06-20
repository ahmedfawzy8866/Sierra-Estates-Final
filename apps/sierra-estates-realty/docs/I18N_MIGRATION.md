# i18n Migration Guide — next-intl

The codebase has **two i18n systems coexisting**:

1. **Legacy**: `lib/I18nContext.tsx` — custom React context with hardcoded `translations` map.
2. **New**: `next-intl` v4 (Next.js 16 compatible) with JSON message files in `messages/{en,ar}.json`.

This guide explains how to migrate component-by-component without breaking the app.

## Current state

- `messages/en.json` and `messages/ar.json` — JSON message catalogs (start small, expand as you migrate)
- `i18n/request.ts` — next-intl request config (loads messages based on URL locale segment)
- `i18n/routing.ts` — next-intl routing (locale prefix: `as-needed`, so `/` is the default `en` and `/ar` for Arabic)
- `lib/I18nContext.tsx` — still the default for components that haven't been migrated

## Migration path (per-component)

### Step 1 — Pick a leaf component (no children that use `t()`)

Replace:

```tsx
import { useI18n } from '@/lib/I18nContext';

function MyComponent() {
  const { t } = useI18n();
  return <h1>{t('listings.title')}</h1>;
}
```

With:

```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('listings');
  return <h1>{t('title')}</h1>;
}
```

### Step 2 — Add the message key

Make sure `messages/en.json` and `messages/ar.json` both have the key under the right namespace. The namespace argument to `useTranslations('listings')` matches a top-level key in the JSON.

### Step 3 — Run type-check + tests

```bash
pnpm --filter sierra-estates-realty type-check
pnpm --filter sierra-estates-realty test
```

If both pass, the migration is complete for that component. Move on to the next.

## When you're ready to enable locale segments in URLs

Currently the app uses a single `/` prefix with locale stored in client state. To switch to `/en/...` and `/ar/...` URL segments:

1. Move everything inside `app/` to `app/[locale]/` (one big `git mv`).
2. Update `app/[locale]/layout.tsx` to wrap children in `NextIntlClientProvider`.
3. Update `proxy.ts` (formerly `middleware.ts`) to call `createMiddleware(routing)` from `i18n/routing.ts` at the top.
4. Update `next.config.ts` to register the i18n plugin:

```ts
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = { /* ...existing... */ };
export default withNextIntl(nextConfig);
```

5. Run type-check + tests + build. Fix any remaining `useI18n()` calls.

This is the 3-5 day refactor mentioned in `RECOMMENDATIONS.md` §4.4 — do it as a dedicated PR, not a drive-by change.

## Why both systems?

Migration risk. The legacy `I18nContext` is used by ~30+ components (admin dashboard, CRM, listings, etc.). Doing a big-bang rewrite would block all other work for a week. By keeping both systems coexisting, you can migrate one component per PR, test thoroughly, and roll back easily if something breaks.

Once all components use `next-intl`, delete `lib/I18nContext.tsx` and remove its provider from `app/providers.tsx`.
