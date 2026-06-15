import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Sierra Estates | سييرا إستيتس العقارية',
  description:
    "Cinematic Luxury Real Estate — Premium properties across Egypt's most exclusive communities | عقارات فاخرة في أرقى المجتمعات المصرية",
  keywords: ['real estate', 'luxury', 'Egypt', 'New Cairo', 'عقارات', 'فاخرة', 'مصر', 'Sierra Estates'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Sierra Estates',
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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Preconnect to font CDN & image CDNs */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Tajawal:wght@200;300;400;500;700;800;900&family=JetBrains+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&family=Jost:wght@200;300;400;500;600;700&family=Cairo:wght@300;400;600;700&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap" />
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
