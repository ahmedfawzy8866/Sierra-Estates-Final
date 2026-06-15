'use client';

import { Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  section: string;
  badge?: string;
  badgeColor?: 'red' | 'green' | 'blue';
}

const BADGE_COLORS = {
  red: 'bg-[#E63946] text-white',
  green: 'bg-[#34D399] text-[#071422]',
  blue: 'bg-[#1E88D9] text-white',
};

const SECTION_ORDER = ['Main', 'Operations', 'Analytics', 'System'];

interface DashboardSidebarProps {
  items: NavItem[];
  activeTab: string;
  collapsed: boolean;
  onTabChange: (id: NavItem['id']) => void;
  onCollapsedChange: (collapsed: boolean) => void;
  isMobile?: boolean;
  className?: string;
}

export default function DashboardSidebar({
  items,
  activeTab,
  collapsed,
  onTabChange,
  _onCollapsedChange,
  isMobile = false,
  className = '',
}: DashboardSidebarProps) {
  const { role, signOut } = useAuth();

  const sections = SECTION_ORDER.filter(sec => items.some(item => item.section === sec));
  const visibleItems = items.filter(item =>
    item.section === 'Main' ||
    item.section === 'Operations' ||
    (role === 'admin' || role === 'manager') && item.section === 'Analytics' ||
    role === 'admin' && item.section === 'System'
  );

  return (
    <aside
      className={`flex flex-col w-[220px] ${collapsed ? 'lg:w-[56px]' : ''} shrink-0 bg-[#0B1A2E] border-r border-white/5 transition-all duration-300 ${className}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 lg:px-8 py-6 lg:py-8 border-b border-white/5 min-h-[64px]">
        <Shield size={28} className="text-[#C9A84C]" />
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white font-bold text-sm uppercase tracking-tight">
              Sierra Estates
            </div>
            <div className="text-white/30 text-[9px] tracking-widest uppercase font-mono">
              Intelligence OS
            </div>
          </div>
        )}
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 px-3 lg:px-4 py-4 space-y-0.5 overflow-y-auto">
        {sections.map(section => (
          <div key={section}>
            {!collapsed && (
              <div className="px-3 lg:px-4 pt-2 pb-1 text-[8px] font-bold tracking-widest uppercase text-white/25 font-mono">
                {section}
              </div>
            )}
            {visibleItems
              .filter(item => item.section === section)
              .map(item => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg text-sm font-medium transition-all border-l-2 pl-[12px] lg:pl-[14px] ${
                    activeTab === item.id
                      ? 'bg-white/6 text-[#C9A84C] border-[#C9A84C]'
                      : 'text-white/55 hover:text-white/90 hover:bg-white/4 border-transparent'
                  }`}
                  title={collapsed ? item.label : ''}
                >
                  <span className="flex-shrink-0 text-base">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${BADGE_COLORS[item.badgeColor ?? 'blue']}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
          </div>
        ))}
      </nav>

      {/* Role Pill + Sign Out */}
      {!isMobile && (
        <div className="px-3 lg:px-4 pb-6 border-t border-white/5 pt-4">
          {role && !collapsed && (
            <div className="px-3 lg:px-4 pb-3 text-[9px] text-white/30 tracking-widest uppercase font-mono">
              Signed in · <span className="text-[#C9A84C]">{role}</span>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 lg:px-4 py-3 text-white/40 hover:text-white/80 text-sm transition-colors rounded-lg hover:bg-white/4"
          >
            <span className="flex-shrink-0 text-lg">🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
