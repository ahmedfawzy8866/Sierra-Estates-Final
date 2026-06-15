'use client';

import { Menu, Sun, Moon } from 'lucide-react';

interface DashboardTopbarProps {
  title: string;
  onMenuClick: () => void;
  theme: 'dark' | 'light';
  lang: 'en' | 'ar';
  onThemeChange: (theme: 'dark' | 'light') => void;
  onLangChange: (lang: 'en' | 'ar') => void;
}

export default function DashboardTopbar({
  title,
  onMenuClick,
  theme,
  lang,
  onThemeChange,
  onLangChange,
}: DashboardTopbarProps) {
  return (
    <header className="h-16 flex-shrink-0 border-b border-white/5 bg-[#0B1A2E] flex items-center justify-between px-6 gap-4">
      {/* Menu Button (Mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-white/60 hover:text-white p-2 hover:bg-white/4 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <h1 className="hidden lg:block text-lg font-semibold text-white/80 tracking-wide capitalize">
        {title}
      </h1>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Live Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
          <span className="text-[9px] text-white/30 tracking-widest uppercase font-mono">
            Sierra Estates 1.0
          </span>
        </div>

        {/* Language Toggle */}
        <button
          onClick={() => onLangChange(lang === 'en' ? 'ar' : 'en')}
          className="px-3 py-1.5 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-[#C9A84C] text-[10px] font-bold transition-all"
          title="Toggle language"
        >
          {lang === 'en' ? 'العربية' : 'English'}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/4 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
