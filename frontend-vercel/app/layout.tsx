import type { Metadata } from 'next';
import { Inter, Cinzel, Josefin_Sans, Noto_Naskh_Arabic, Noto_Sans_Arabic } from 'next/font/google';
import { Providers } from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './styles/design.css';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const josefin = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
  display: 'swap',
});

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-naskh-arabic',
  display: 'swap',
});

const notoSans = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-sans-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sierra Estates Realty | سييرا بلو العقارية',
  description:
    "Cinematic Luxury Real Estate — Premium properties across Egypt's most exclusive communities | عقارات فاخرة في أرقى المجتمعات المصرية",
  keywords: ['real estate', 'luxury', 'Egypt', 'New Cairo', 'عقارات', 'فاخرة', 'مصر', 'Sierra Estates'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Sierra Estates Realty',
    description: "Egypt's Premier Property Intelligence Platform",
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_EG',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${cinzel.variable} ${josefin.variable} ${notoNaskh.variable} ${notoSans.variable}`}>
      <head>
        {/* Preconnect to font CDN & image CDNs */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body>
        <Providers>
          {/* Sticky Header with embedded compact FilterBar */}
          <Header />
          {/* Page content padded below fixed header */}
          <main id="main-content">
            {children}
          </main>
          {/* Global Footer */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
