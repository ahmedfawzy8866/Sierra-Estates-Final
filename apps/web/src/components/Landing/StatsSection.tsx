'use client';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const STATS = [{ key:'properties',value:'500+' },{ key:'clients',value:'1,200+' },{ key:'years',value:'12+' },{ key:'portfolio',value:'EGP 2B+' }];

export function StatsSection() {
  const t = useTranslations('stats');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <section ref={ref} className="py-16 bg-se-navy">
      <div className="container-se">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map(({ key, value }, i) => (
            <motion.div key={key} initial={{ opacity:0,y:20 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.5,delay:i*0.1 }} className="text-center">
              <p className="font-display text-4xl text-se-gold mb-2">{value}</p>
              <p className="text-white/50 text-sm tracking-wide">{t(key as 'properties' | 'clients' | 'years' | 'portfolio')}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
