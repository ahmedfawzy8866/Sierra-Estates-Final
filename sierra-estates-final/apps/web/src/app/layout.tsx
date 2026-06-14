import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { Providers } from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'Sierra Estates — Luxury Real Estate New Cairo', template: '%s | Sierra Estates' },
  description: 'Discover premium properties in New Cairo. Sierra Estates curates an exclusive portfolio of luxury residences, compounds, and investment assets.',
  openGraph: { type: 'website', siteName: 'Sierra Estates' },
};

export const viewport: Viewport = { themeColor: '#1B2B4B' };

export default async function RootLayout({
  children, params
}: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'en' | 'ar')) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&family=Noto+Kufi+Arabic:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-se-cream text-se-navy">
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
