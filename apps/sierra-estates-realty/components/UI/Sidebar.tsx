"use client";
import React, { useState } from 'react';
import { useI18n } from '../../lib/I18nContext';
import BrandLogo from './BrandLogo';
import { useAuth } from '../../lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Diamond, 
  BarChart3, 
  Group, 
  ShieldCheck, 
  Image as ImageIcon, 
  Sparkles, 
  Wallet, 
  RefreshCcw,
  Zap,
  Wand2,
  Cpu,
  TrendingUp,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  TerminalSquare
} from 'lucide-react';

type Screen = 'dashboard' | 'listings' | 'crm' | 'leads' | 'reports' | 'team' | 'clients' | 'protocols' | 'media' | 'experiences' | 'ledger' | 'sync' | 'processing' | 'nexus' | 'intelligence' | 'map' | 'system' | 'team-crm' | 'admin-dashboard' | 'database' | 'telemetry';

interface SidebarProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  userInitials?: string;
  displayName?: string;
}

interface NavItem {
  labelKey: string;
  icon: React.ReactNode;
  id: Screen;
  sectionKey: string;
}

const navItems: NavItem[] = [
  { labelKey: 'dashboard',   icon: <LayoutDashboard size={18} />, id: 'dashboard',   sectionKey: 'main' },
  { labelKey: 'listings',    icon: <Building2 size={18} />, id: 'listings',    sectionKey: 'main' },
  { labelKey: 'flow',        icon: <Zap size={18} />, id: 'leads',       sectionKey: 'main' },
  { labelKey: 'crm',         icon: <Users size={18} />, id: 'crm',         sectionKey: 'main' },
  { labelKey: 'clients',     icon: <Diamond size={18} />, id: 'clients',     sectionKey: 'main' },
  { labelKey: 'Live Map',    icon: <MapPin size={18} />, id: 'map',         sectionKey: 'main' },
  { labelKey: 'reports',     icon: <BarChart3 size={18} />, id: 'reports',      sectionKey: 'insights' },
  { labelKey: 'team',        icon: <Group size={18} />, id: 'team',         sectionKey: 'insights' },
  { labelKey: 'operations',  icon: <ShieldCheck size={18} />, id: 'protocols',    sectionKey: 'operations' },
  { labelKey: 'Media Hub',    icon: <ImageIcon size={18} />, id: 'media',        sectionKey: 'operations' },
  { labelKey: 'ai',          icon: <Sparkles size={18} />, id: 'experiences',  sectionKey: 'operations' },
  { labelKey: 'commissions', icon: <Wallet size={18} />, id: 'ledger',       sectionKey: 'operations' },
  { labelKey: 'sync',        icon: <RefreshCcw size={18} />, id: 'sync',         sectionKey: 'operations' },
  { labelKey: 'processing',  icon: <Wand2 size={18} />,     id: 'processing',   sectionKey: 'operations' },
  { labelKey: 'Intelligence', icon: <TrendingUp size={18} />, id: 'intelligence', sectionKey: 'insights' },
  { labelKey: 'Nexus Hub',    icon: <Cpu size={18} />,        id: 'nexus',        sectionKey: 'operations' },
];

const adminItems: NavItem[] = [
  { labelKey: 'admin-dashboard', icon: <LayoutDashboard size={18} />, id: 'dashboard',   sectionKey: 'administration' },
  { labelKey: 'team-crm',        icon: <Users size={18} />,           id: 'team-crm',   sectionKey: 'administration' },
  { labelKey: 'listings',        icon: <Building2 size={18} />,       id: 'listings',   sectionKey: 'administration' },
  { labelKey: 'database',        icon: <Zap size={18} />,             id: 'database',   sectionKey: 'administration' },
  { labelKey: 'telemetry',       icon: <TerminalSquare size={18} />,  id: 'telemetry',  sectionKey: 'administration' },
  { labelKey: 'operations',      icon: <Cpu size={18} />,             id: 'nexus',      sectionKey: 'administration' },
  { labelKey: 'Intelligence',    icon: <TrendingUp size={18} />,      id: 'intelligence', sectionKey: 'administration' },
  { labelKey: 'System Hub',      icon: <Cpu size={18} />,             id: 'system',     sectionKey: 'administration' },
  { labelKey: 'Media Hub',       icon: <ImageIcon size={18} />,       id: 'media',      sectionKey: 'administration' },
];

const sectionLabels: Record<string, { en: string; ar: string }> = {
  main:           { en: 'Main', ar: 'الرئيسية' },
  insights:       { en: 'Insights', ar: 'التقارير' },
  operations:     { en: 'Operations', ar: 'العمليات' },
  administration: { en: 'Administration', ar: 'الإدارة' },
};

export default function Sidebar({ 
  activeScreen, 
  onNavigate, 
  userInitials = 'AF', 
  displayName = 'Ahmed Fawzy' 
}: SidebarProps) {
  const { t, locale } = useI18n();
  const { isAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const currentNavItems = isAdmin ? adminItems : navItems;
  const sections = [...new Set(currentNavItems.map(i => i.sectionKey))];

  return (
    <motion.aside 
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="sidebar midnight-mode h-screen fixed top-0 left-0 flex flex-col border-r border-white/[0.05] z-50 overflow-hidden" 
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* ── Logo & Toggle ── */}
      <div className="p-6 mb-2 flex items-center justify-between">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
              <BrandLogo size="md" />
              <div className="text-[9px] font-black tracking-[0.3em] text-gold mt-2 opacity-50 uppercase">Intelligence Terminal</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 bg-white/5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-4 overflow-y-auto space-y-6 scrollbar-hide pb-20">
        {sections.map(section => (
          <div key={section} className="space-y-1">
            {!isCollapsed && (
              <div className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 mt-2">
                {sectionLabels[section]?.[locale] || section}
              </div>
            )}
            <div className="space-y-1">
              {currentNavItems.filter(i => i.sectionKey === section).map(item => {
                const isActive = activeScreen === item.id;
                return (
                  <motion.button
                    whileHover={{ x: locale === 'ar' && !isCollapsed ? -4 : (isCollapsed ? 0 : 4), background: 'rgba(255,255,255,0.03)' }}
                    whileTap={{ scale: 0.98 }}
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      w-full flex items-center justify-center lg:justify-start gap-3 py-3 rounded-xl transition-all duration-300
                      ${isCollapsed ? 'px-0' : 'px-4'}
                      ${isActive ? 'bg-gold/10 text-gold shadow-[0_0_20px_rgba(201,168,76,0.1)]' : 'text-white/50 hover:text-white'}
                    `}
                    title={isCollapsed ? (t('nav', item.labelKey) || item.labelKey) : undefined}
                  >
                    <span className={`transition-colors duration-300 ${isActive ? 'text-gold' : 'opacity-60'}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="text-sm font-bold tracking-wide flex-1 text-left rtl:text-right whitespace-nowrap">
                        {t('nav', item.labelKey) || item.labelKey}
                      </span>
                    )}
                    {isActive && !isCollapsed && (
                      <motion.div 
                        layoutId="activeDot"
                        className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_10px_#C8A96E]"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User Profile ── */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-navy/90 backdrop-blur-xl border-t border-white/5">
        <div className={`flex items-center group cursor-pointer ${isCollapsed ? 'justify-center' : 'gap-4 px-2'}`}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center text-navy font-black shadow-2xl overflow-hidden">
               {userInitials}
               <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-navy animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold text-white truncate group-hover:text-gold transition-colors">{displayName}</div>
              <div className="text-[9px] font-black text-gold/60 uppercase tracking-widest">
                {locale === 'ar' ? 'مستشار تنفيذي' : 'Exec'}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .midnight-mode {
          background: #050B14;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.aside>
  );
}
