'use client';
import { useTranslations } from 'next-intl';
import { Shield, Zap, Star, Globe } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const FEATURES = [{ icon:Shield,key:'trusted' },{ icon:Star,key:'luxury' },{ icon:Zap,key:'fast' },{ icon:Globe,key:'global' }];

export function WhySection() {
  const t = useTranslations('why');
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-80px' });
  return (
    <section ref={ref} className="py-24 bg-se-cream">
      <div className="container-se">
        <div className="text-center mb-16">
          <p className="text-se-gold text-xs tracking-[0.3em] uppercase mb-4">{t('overline')}</p>
          <h2 className="font-display text-4xl md:text-5xl text-se-navy max-w-2xl mx-auto">{t('headline')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map(({ icon:Icon, key }, i) => (
            <motion.div key={key} initial={{ opacity:0,y:24 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.5,delay:i*0.12 }}
              className="group p-8 bg-white rounded-xl card-shadow hover:border-se-gold/30 border border-transparent transition-all duration-300">
              <div className="w-12 h-12 bg-se-cream rounded-lg flex items-center justify-center mb-5 group-hover:bg-se-gold/10 transition-colors">
                <Icon className="w-5 h-5 text-se-gold" />
              </div>
              <h3 className="font-display text-xl text-se-navy mb-2">{t(`${key}.title` as Parameters<typeof t>[0])}</h3>
              <p className="text-se-muted text-sm leading-relaxed">{t(`${key}.desc` as Parameters<typeof t>[0])}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
