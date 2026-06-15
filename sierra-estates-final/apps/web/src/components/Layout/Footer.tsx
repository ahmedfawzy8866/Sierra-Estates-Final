import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  const locale = useLocale();
  const t = useTranslations('footer');
  return (
    <footer className="bg-se-navy-deep text-white">
      <div className="container-se py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-se-gold rounded-sm flex items-center justify-center">
                <span className="text-se-gold font-display text-lg">SE</span>
              </div>
              <div>
                <span className="block text-white font-display text-xl">Sierra Estates</span>
                <span className="block text-se-gold/60 text-[10px] tracking-[0.2em] uppercase">New Cairo · Luxury Real Estate</span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">{t('tagline')}</p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-9 h-9 border border-white/20 rounded-full flex items-center justify-center hover:border-se-gold hover:text-se-gold transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 border border-white/20 rounded-full flex items-center justify-center hover:border-se-gold hover:text-se-gold transition-colors"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-se-gold text-xs tracking-[0.2em] uppercase mb-5">{t('navigation')}</h4>
            <ul className="space-y-3">
              {[['properties','/properties'],['new_projects','/projects'],['about','/about'],['contact','/contact'],['careers','/careers']].map(([k,h])=>(
                <li key={k}><Link href={`/${locale}${h}`} className="text-white/50 hover:text-white text-sm transition-colors">{t(k as any)}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-se-gold text-xs tracking-[0.2em] uppercase mb-5">{t('contact_us')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/50 text-sm"><MapPin className="w-4 h-4 text-se-gold mt-0.5 shrink-0" /><span>Fifth Settlement, New Cairo<br />Cairo, Egypt</span></li>
              <li><a href="tel:+201XXXXXXXXX" className="flex items-center gap-3 text-white/50 hover:text-white text-sm transition-colors"><Phone className="w-4 h-4 text-se-gold shrink-0" />+20 1XX XXX XXXX</a></li>
              <li><a href="mailto:hello@sierraestates.ae" className="flex items-center gap-3 text-white/50 hover:text-white text-sm transition-colors"><Mail className="w-4 h-4 text-se-gold shrink-0" />hello@sierraestates.ae</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4 text-white/30 text-xs">
          <span>© {new Date().getFullYear()} Sierra Estates. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">{t('privacy')}</Link>
            <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
