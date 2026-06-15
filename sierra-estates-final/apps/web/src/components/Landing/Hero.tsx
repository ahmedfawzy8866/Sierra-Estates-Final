'use client';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 gradient-navy" />
      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/images/hero-bg.jpg')" }} />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-se-gold to-transparent opacity-40" />

      <div className="container-se relative z-10 pt-32 pb-20">
        <div className="max-w-4xl">
          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }} className="flex items-center gap-3 mb-8">
            <span className="w-12 h-px bg-se-gold" />
            <span className="text-se-gold text-xs tracking-[0.3em] uppercase">{t('overline')}</span>
          </motion.div>

          <motion.h1 initial={{ opacity:0,y:24 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.7,delay:0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6">
            {t.rich('headline', { gold: (chunks) => <span className="text-gradient-gold italic">{chunks}</span> })}
          </motion.h1>

          <motion.p initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6,delay:0.25 }}
            className="text-white/60 text-lg md:text-xl leading-relaxed max-w-2xl mb-10">
            {t('subtitle')}
          </motion.p>

          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6,delay:0.4 }} className="flex flex-wrap gap-4">
            <Link href={`/${locale}/properties`} className="btn-primary group">
              {t('cta_primary')}<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="btn-outline flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" />{t('cta_secondary')}
            </button>
          </motion.div>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.8,delay:0.7 }}
            className="flex flex-wrap gap-10 mt-16 pt-10 border-t border-white/10">
            {([['value_properties','500+'],['stat_years','12+'],['stat_portfolio','EGP 2B+']] as const).map(([k,v])=>(
              <div key={k}>
                <p className="font-display text-3xl text-se-gold">{v}</p>
                <p className="text-white/40 text-sm mt-1">{t(k as 'value_properties' | 'stat_years' | 'stat_portfolio')}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-white/30 text-[10px] tracking-widest uppercase">Scroll</span>
        <motion.div animate={{ y:[0,8,0] }} transition={{ duration:1.5,repeat:Infinity }} className="w-px h-10 bg-gradient-to-b from-se-gold/60 to-transparent" />
      </motion.div>
    </section>
  );
}
