'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import OverviewPage from './pages/OverviewPage';
import AgentsPage from './pages/AgentsPage';
import WorkflowsPage from './pages/WorkflowsPage';
import LeadsPage from './pages/LeadsPage';
import CuratorPage from './pages/CuratorPage';
import ScribePage from './pages/ScribePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import OpenClawPage from './pages/OpenClawPage';
import NexusAIPage from './pages/NexusAIPage';
import DashboardSidebar from './ui/DashboardSidebar';
import DashboardTopbar from './ui/DashboardTopbar';

type PageId =
  | 'overview' | 'agents' | 'workflows' | 'openclaw' | 'nexus'
  | 'leads' | 'listings' | 'curator' | 'scribe' | 'closer'
  | 'reports' | 'settings';

interface NavItem {
  id: PageId;
  label: string;
  icon: string;
  section: string;
  badge?: string;
  badgeColor?: 'red' | 'green' | 'blue';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Intelligence OS', icon: '🏠', section: 'Main' },
  { id: 'agents', label: 'Agents & Bots', icon: '🤖', section: 'Main', badge: '6', badgeColor: 'green' },
  { id: 'workflows', label: 'Workflows & Sync', icon: '⚡', section: 'Main', badge: '8', badgeColor: 'blue' },
  { id: 'openclaw', label: 'OpenClaw Terminal', icon: '⚙️', section: 'Main' },
  { id: 'nexus', label: 'Nexus-AI Telemetry', icon: '📡', section: 'Main', badge: 'LIVE', badgeColor: 'green' },
  { id: 'leads', label: 'CRM · Leads', icon: '👥', section: 'Operations', badge: '23', badgeColor: 'red' },
  { id: 'listings', label: 'Listings Hub', icon: '🏘️', section: 'Operations' },
  { id: 'curator', label: 'The Curator', icon: '🎨', section: 'Operations' },
  { id: 'scribe', label: 'The Scribe', icon: '✍️', section: 'Operations' },
  { id: 'closer', label: 'Stage-9 Closer', icon: '💼', section: 'Operations' },
  { id: 'reports', label: 'Reports', icon: '📊', section: 'Analytics' },
  { id: 'settings', label: 'System Config', icon: '🔧', section: 'System' },
];

export default function DashboardContent() {
  const { loading } = useAuth();
  const [tab, setTab] = useState<PageId>('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  // Persist theme and language
  useEffect(() => {
    const savedTheme = (localStorage.getItem('dashboard_theme') as 'dark' | 'light') || 'dark';
    const savedLang = (localStorage.getItem('dashboard_lang') as 'en' | 'ar') || 'en';
    setTheme(savedTheme);
    setLang(savedLang);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
  }, []);

  const handleThemeChange = useCallback((newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('dashboard_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);

  const handleLangChange = useCallback((newLang: 'en' | 'ar') => {
    setLang(newLang);
    localStorage.setItem('dashboard_lang', newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
  }, []);

  const renderPage = useCallback(() => {
    const pages: Record<PageId, React.ReactNode> = {
      overview: <OverviewPage />,
      agents: <AgentsPage />,
      workflows: <WorkflowsPage />,
      openclaw: <OpenClawPage />,
      nexus: <NexusAIPage />,
      leads: <LeadsPage />,
      listings: <div className="text-center py-16 text-gray-400">Listings Hub · Coming Soon</div>,
      curator: <CuratorPage />,
      scribe: <ScribePage />,
      closer: <div className="text-center py-16 text-gray-400">Stage-9 Closer · Coming Soon</div>,
      reports: <ReportsPage />,
      settings: <SettingsPage />,
    };
    return pages[tab] || pages.overview;
  }, [tab]);

  const getPageTitle = useCallback(() => {
    return NAV_ITEMS.find(n => n.id === tab)?.label || 'Sierra Estates';
  }, [tab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-sm font-mono text-[#C9A84C] tracking-widest uppercase animate-pulse">
            Authenticating…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#07111E]" data-theme={theme} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Desktop Sidebar */}
      <DashboardSidebar
        items={NAV_ITEMS}
        activeTab={tab}
        collapsed={collapsed}
        onTabChange={(id) => setTab(id as PageId)}
        onCollapsedChange={setCollapsed}
        className="hidden lg:flex"
      />

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <DashboardSidebar
            items={NAV_ITEMS}
            activeTab={tab}
            collapsed={false}
            onTabChange={(id) => {
              setTab(id as PageId);
              setMobileOpen(false);
            }}
            onCollapsedChange={() => {}}
            isMobile
            className="absolute left-0 top-0 bottom-0 w-64 z-50"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <DashboardTopbar
          title={getPageTitle()}
          onMenuClick={() => setMobileOpen(true)}
          theme={theme}
          lang={lang}
          onThemeChange={handleThemeChange}
          onLangChange={handleLangChange}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
