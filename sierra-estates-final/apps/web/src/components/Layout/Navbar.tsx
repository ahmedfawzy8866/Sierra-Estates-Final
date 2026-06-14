'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X, Phone } from 'lucide-react';
import { clsx } from 'clsx';

const NAV_LINKS = [
  { key: 'properties', href: '/properties' },
  { key: 'projects',   href: '/projects'   },
  { key: 'about',      href: '/about'      },
  { key: 'contact',    href: '/contact'    },
];

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const altLocale = locale === 'en' ? 'ar' : 'en';
  const altPath   = pathname.replace(`/${locale}`, `/${altLocale}`);

  return (
    <header className={clsx('fixed top-0 inset-x-0 z-50 transition-all duration-300', scrolled ? 'bg-se-navy/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5')}>
      <nav className="container-se flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <div className="w-8 h-8 border border-se-gold rounded-sm flex items-center justify-center">
            <span className="text-se-gold font-display text-sm font-semibold">SE</span>
          </div>
          <div className="hidden sm:block">
            <span className="block text-white font-display text-lg leading-tight">Sierra Estates</span>
            <span className="block text-se-gold/70 text-[10px] tracking-[0.2em] uppercase">New Cairo · Luxury</span>
          </div>
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map(({ key, href }) => (
            <li key={key}>
              <Link href={`/${locale}${href}`} className={clsx('text-sm tracking-wide transition-colors duration-200', pathname.includes(href) ? 'text-se-gold' : 'text-white/80 hover:text-white')}>
                {t(key)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-6">
          <Link href={altPath} className="text-xs tracking-widest text-white/60 hover:text-se-gold transition-colors uppercase">
            {altLocale === 'ar' ? 'العربية' : 'English'}
          </Link>
          <a href="tel:+201XXXXXXXXX" className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
            <Phone className="w-4 h-4 text-se-gold" />
            <span>+20 1XX XXX XXXX</span>
          </a>
          <Link href={`/${locale}/contact`} className="btn-primary text-xs py-2.5 px-5">{t('book_viewing')}</Link>
        </div>

        <button className="lg:hidden text-white p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-se-navy-deep border-t border-se-gold/20 px-6 py-6">
          <ul className="flex flex-col gap-5">
            {NAV_LINKS.map(({ key, href }) => (
              <li key={key}>
                <Link href={`/${locale}${href}`} className="text-white/80 hover:text-se-gold text-base transition-colors" onClick={() => setOpen(false)}>
                  {t(key)}
                </Link>
              </li>
            ))}
            <li><Link href={altPath} className="text-se-gold/70 text-sm" onClick={() => setOpen(false)}>{altLocale === 'ar' ? 'العربية' : 'English'}</Link></li>
            <li><Link href={`/${locale}/contact`} className="btn-primary w-full justify-center" onClick={() => setOpen(false)}>{t('book_viewing')}</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
}
