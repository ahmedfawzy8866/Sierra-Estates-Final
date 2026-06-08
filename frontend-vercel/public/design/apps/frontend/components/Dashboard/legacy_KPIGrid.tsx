"use client";

import React, { useMemo } from 'react';
import { useSierraEstates } from '@/hooks/useSierraEstates';
import { useI18n } from '../../lib/I18nContext';
import { formatCompactEGP, calcROI, calcGrossYield } from '../../lib/financial-engine';
import { motion } from 'framer-motion';
import { Home, Users, BarChart3, ShieldCheck } from 'lucide-react';

interface KPIGridProps {
  onNavigate: (screen: 'dashboard' | 'listings' | 'crm' | 'reports' | 'team') => void;
}

export default function KPIGrid({ onNavigate }: KPIGridProps) {
  const { locale } = useI18n();
  const { units, leads, partners, sales, loading } = useSierraEstates();

  const stats = useMemo(() => {
    let totalROI = 0, totalYield = 0, totalPricePerSqm = 0, roiCount = 0, yieldCount = 0, priceCount = 0;
    
    units.forEach(unit => {
      if (unit.purchasePrice && unit.currentValue) {
        totalROI += calcROI({ purchasePrice: unit.purchasePrice, currentMarketValue: unit.currentValue, monthlyRent: unit.monthlyRent || 0 });
        roiCount++;
      }
      if (unit.annualRent && unit.purchasePrice) {
        totalYield += calcGrossYield(unit.annualRent, unit.purchasePrice);
        yieldCount++;
      }
      if (unit.price && unit.area) {
        totalPricePerSqm += unit.price / unit.area;
        priceCount++;
      }
    });

    const hotCount = leads.filter((d: any) => d.strategicIntensity === 'hot' || d.priority === 'hot').length;
    
    let totalSalesVolume = 0;
    sales.forEach((d: any) => { totalSalesVolume += d.amount || 0; });

    return {
      listings: units.length,
      stakeholders: leads.length,
      partners: partners.length,
      totalVolume: totalSalesVolume,
      hotLeads: hotCount,
      avgROI: roiCount > 0 ? totalROI / roiCount : 0,
      avgYield: yieldCount > 0 ? totalYield / yieldCount : 0,
      avgPricePerSqm: priceCount > 0 ? totalPricePerSqm / priceCount : 0,
    };
  }, [units, leads, partners, sales]);

  const cards = useMemo(() => [
    {
      id: 'portfolio',
      label: locale === 'ar' ? 'أصول المحفظة' : 'Portfolio Assets',
      value: stats.listings.toLocaleString(),
      badge: locale === 'ar' ? 'مخزون مباشر' : 'Live Inventory',
      icon: <Home size={22} />,
      screen: 'listings' as const,
      color: '#C8A96E'
    },
    {
      id: 'stakeholders',
      label: locale === 'ar' ? 'المستثمرون النشطون' : 'Active Stakeholders',
      value: stats.stakeholders.toString(),
      badge: `${stats.hotLeads} ${locale === 'ar' ? 'أولوية قصوى' : 'High Priority'}`,
      icon: <Users size={22} />,
      screen: 'crm' as const,
      color: '#4299E1'
    },
    {
      id: 'financial',
      label: locale === 'ar' ? 'رأس المال المنقول' : 'Capital Transacted',
      value: formatCompactEGP(stats.totalVolume),
      badge: `ROI ${stats.avgROI.toFixed(1)}%`,
      icon: <BarChart3 size={22} />,
      screen: 'reports' as const,
      color: '#C8A96E'
    },
    {
      id: 'partners',
      label: locale === 'ar' ? 'الشركاء' : 'Strategic Partners',
      value: stats.partners.toString(),
      badge: locale === 'ar' ? 'مؤمن' : 'Secured Status',
      icon: <ShieldCheck size={22} />,
      screen: 'team' as const,
      color: '#A0AEC0'
    },
  ], [stats, locale]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <motion.div 
          key={card.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          whileHover={{ y: -10, boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}
          onClick={() => onNavigate(card.screen as any)}
          className="kpi-card group relative p-8 rounded-3xl bg-navy/40 border border-white/5 backdrop-blur-3xl cursor-pointer overflow-hidden"
        >
          {/* Animated Background Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity duration-500" style={{ background: card.color }} />
          
          <div className="flex items-center justify-between mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-gold shadow-2xl transition-transform group-hover:scale-110 duration-500">
              {card.icon}
            </div>
            <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.05]">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: card.color }} />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{card.badge}</span>
            </div>
          </div>

          <div>
             <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{card.label}</div>
             <div className="serif text-4xl font-bold text-white tracking-tight leading-none">
                {card.value}
             </div>
          </div>

          {/* Interactive Sparkline-like Decorative Element */}
          <div className="absolute bottom-0 left-0 w-full h-[2px] opacity-20 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }} />
        </motion.div>
      ))}

      <style>{`
        .kpi-card {
           transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .kpi-card:hover {
           border-color: rgba(201, 168, 76, 0.2);
           background: rgba(10, 22, 40, 0.6);
        }
      `}</style>
    </div>
  );
}
