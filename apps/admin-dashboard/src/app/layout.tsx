import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'Sierra Estates Admin Nexus', template: '%s | Admin Nexus' },
  description: 'Agent coordination and workflow hub for Sierra Estates.',
  openGraph: { type: 'website', siteName: 'Admin Nexus' },
};

export const viewport: Viewport = { themeColor: '#0A1628' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#0A1628] text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
