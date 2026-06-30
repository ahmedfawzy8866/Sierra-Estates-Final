import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { onSnapshot, doc as fireDoc, getDoc as getFireDoc } from 'firebase/firestore';
import { auth, db, createSierraNotification } from './firebase';
import { seedFirestore } from './seed';

// Modular Component Imports
import LoginPage from './components/LoginPage';
import Sidebar, { NAV_ITEMS } from './components/Sidebar';
import OverviewPage from './components/OverviewPage';
import AgentsPage from './components/AgentsPage';
import WorkflowsPage from './components/WorkflowsPage';
import OpenClawPage from './components/OpenClawPage';
import LeadsPage from './components/LeadsPage';
import ListingsHubPage from './components/ListingsHubPage';
import CuratorPage from './components/CuratorPage';
import ScribePage from './components/ScribePage';
import NexusAIPage from './components/NexusAIPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import Stage9CloserPage from './components/Stage9CloserPage';
import NotificationCenter from './components/NotificationCenter';
import ClientHub from './components/ClientHub';

// Text translations conforming to standard arabic/english requirements
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    brand: 'SIERRA ESTATES 3.0',
    brandSub: 'INTELLIGENCE OS',
    overview: 'Intelligence OS',
    agents: 'Agents & Bots',
    workflows: 'Workflows',
    openclaw: 'OpenClaw Terminal',
    nexus: 'Nexus-AI Telemetry',
    leads: 'CRM · Leads',
    listings: 'Listings Hub',
    curator: 'The Curator',
    scribe: 'The Scribe',
    closer: 'Stage-9 Closer',
    reports: 'Reports',
    settings: 'System Config',
    main: 'Main',
    operations: 'Operations',
    analytics: 'Analytics',
    system: 'System',
    collapse: 'Collapse',
    livesite: 'Live Site',
    theme: 'Theme',
    lang: 'Language',
    addLead: '+ Add Lead',
    exportCSV: 'Export CSV',
    importCSV: 'Import CSV',
    search: 'Search…',
    totalListings: 'Total Listings',
    activeLeads: 'Active Leads',
    avgDeal: 'Avg Deal Value',
    dealsClosed: 'Deals Closed',
    avgResponse: 'Avg Response',
    aiMatch: 'AI Match Rate',
    pending: 'Pending Reviews',
    eliteBrokers: 'Elite Brokers',
    pipelineTitle: 'Pipeline · S1→S10',
    hotLeads: '🔥 Hot Leads',
    agentStatus: 'Agent Status',
    viewingScheduled: 'Viewing Scheduled',
    aiMatched: 'AI Matched',
    contractDraft: 'Contract Draft',
    initialContact: 'Initial Contact',
    negotiating: 'Negotiating',
    online: 'Online',
    running: 'Running',
    idle: 'Idle',
    load: 'Load',
    totalTasks: 'Total tasks',
    config: 'Config',
    logs: 'Logs',
    restart: 'Restart',
    sendMsg: 'Send',
    curator_title: 'The Curator · S3–S5 Inventory & Valuation',
    scribe_title: 'The Scribe · S1–S2 Ingestion Parser',
    avm: 'AVM Engine',
    priceAdj: 'Price Adjustment',
    qualityScore: 'Quality Score',
    rawInput: 'Raw Listing Input (WhatsApp / Prop Finder text)',
    parsedOutput: 'Parsed & Structured Output',
    parseBtn: 'Parse with Scribe',
    compound: 'Compound',
    type: 'Type',
    area: 'Area',
    price: 'Price',
    beds: 'Beds',
    status: 'Status',
    phone: 'Phone',
    interest: 'Interest',
    stage: 'Stage',
    actions: 'Actions',
    client: 'Client',
    view: 'View',
    whatsapp: 'WhatsApp',
    monthlyDeals: '📊 Monthly Deals Closed',
    revPipeline: '💰 Revenue Pipeline',
    perfByCompound: '🗺️ Performance by Compound',
    saveConfig: 'Save Configuration',
    saved: '✓ Saved!',
    githubIntegration: '🔗 GitHub Integration',
    pullLatest: 'Pull Latest',
    openRepo: 'Open Repo',
    pushChanges: 'Push Changes',
  },
  ar: {
    brand: 'سييرا إيستيتس 3.0',
    brandSub: 'نظام التشغيل الذكي',
    overview: 'لوحة التحكم والذكاء',
    agents: 'الوكلاء والبوتات',
    workflows: 'سير العمل',
    openclaw: 'طرفية أوبن كلو',
    nexus: 'نيكسوس · البث المباشر',
    leads: 'إدارة العملاء',
    listings: 'قاعدة العقارات',
    curator: 'المنظم المالي',
    scribe: 'الكاتب اللغوي',
    closer: 'المغلق · المرحلة 9',
    reports: 'التقارير التحليلية',
    settings: 'إعدادات النظام',
    main: 'رئيسي',
    operations: 'العمليات',
    analytics: 'التحليلات والمحاسبة',
    system: 'النظام المستقر',
    collapse: 'طي القائمة',
    livesite: 'موقع المعاينة',
    theme: 'المظهر والسمات',
    lang: 'اللغة الحالية',
    addLead: '+ إضافة عميل جديد',
    exportCSV: 'تصدير جدول CSV',
    importCSV: 'استيراد CSV',
    search: 'بحث…',
    totalListings: 'إجمالي العقارات',
    activeLeads: 'العملاء النشطين',
    avgDeal: 'متوسط قيمة الصفقة',
    dealsClosed: 'الصفقات المغلقة',
    avgResponse: 'متوسط الاستجابة بالثانية',
    aiMatch: 'دقة الذكاء الاصطناعي',
    pending: 'قيد المراجعة',
    eliteBrokers: 'الوسطاء النخبة',
    pipelineTitle: 'مراحل خط الأنابيب',
    hotLeads: '🔥 العملاء الساخنين',
    agentStatus: 'نشاط الوكلاء',
    viewingScheduled: 'معاينة مجدولة',
    aiMatched: 'مطابقة ذكية',
    contractDraft: 'مسودة عقد',
    initialContact: 'تواصل أولي',
    negotiating: 'مفاوضات هامة',
    online: 'متصل وجاهز',
    running: 'قيد التشغيل',
    idle: 'مستقر خامل',
    load: 'الحمل الفعلي',
    totalTasks: 'إجمالي المهام المنجزة',
    config: 'إعداد المعايير',
    logs: 'السجلات السرية',
    restart: 'إعادة التشغيل',
    sendMsg: 'إرسال',
    curator_title: 'المنظم المالي · مخزون ميفيدا وبالم هيلز',
    scribe_title: 'الكاتب اللغوي · إدخال وتحليل نصوص واتس اب',
    avm: 'محرك التقييم الآلي AVM',
    priceAdj: 'تعديل أسعار السوق',
    qualityScore: 'نقاط الجودة والتقييم',
    rawInput: 'نص إدخال الواتساب الخام',
    parsedOutput: 'المخرجات المنظمة بقاعدة البيانات',
    parseBtn: 'تحليل النص بالكاتب',
    compound: 'المجمع السكني',
    type: 'نوع العقار',
    area: 'المساحة الإجمالية',
    price: 'سعر السوق المطلوب',
    beds: 'غرف النوم',
    status: 'حالة الإعلان',
    phone: 'رقم هاتف العميل',
    interest: 'تفاصيل الاهتمام',
    stage: 'المرحلة الحالية',
    actions: 'إجراءات لوحة التحكم',
    client: 'العميل المستهدف',
    view: 'عرض التفاصيل',
    whatsapp: 'واتساب',
    monthlyDeals: '📊 الصفقات الشهرية المغلقة',
    revPipeline: '💰 خط الإيرادات المالية',
    perfByCompound: '🗺️ الأداء حسب المجمع السكني',
    saveConfig: 'حفظ الإعدادات الفنية',
    saved: '✓ تم الحفظ بنجاح!',
    githubIntegration: '🔗 تكامل مستودع GitHub',
    pullLatest: 'سحب آخر التحديثات',
    openRepo: 'فتح المستودع الفرعي',
    pushChanges: 'رفع التغييرات الفورية',
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // App layouts states
  const [viewMode, setViewMode] = useState<'client' | 'admin'>(() => {
    return (localStorage.getItem('sierra_view_mode') as 'client' | 'admin') || 'client';
  });
  const [tab, setTab] = useState<string>(() => localStorage.getItem('sierra_admin_tab') || 'overview');
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('sierra_admin_theme') || 'dark');
  const [langKey, setLangKey] = useState<string>(() => localStorage.getItem('sierra_admin_lang') || 'en');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Translate handler callback
  const T = useCallback((key: string) => TRANSLATIONS[langKey]?.[key] || key, [langKey]);
  const isAr = langKey === 'ar';

  useEffect(() => {
    localStorage.setItem('sierra_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    // Core document layouts configuration updates
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    localStorage.setItem('sierra_admin_theme', theme);
    localStorage.setItem('sierra_admin_lang', langKey);
  }, [theme, langKey, isAr]);

  useEffect(() => {
    localStorage.setItem('sierra_admin_tab', tab);
    setSearchQuery(''); // Reset search input on navigation change
  }, [tab]);

  // Auth changes listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Enforce verified emails admin rules checking:
        const emailLower = user.email?.toLowerCase();
        const isVerified = user.emailVerified || emailLower === 'a.fawzy8866@gmail.com'; // allow bypass verification check for the exact bootstrapped email
        const isBootstrapped = emailLower === 'a.fawzy8866@gmail.com';
        
        let hasRegisterDoc = false;
        try {
          const admSnap = await getFireDoc(fireDoc(db, 'admins', user.uid));
          if (admSnap.exists()) {
            hasRegisterDoc = true;
          }
        } catch (e) {
          console.error("Admins directory check returned: ", e);
        }

        const passesAdminRule = isVerified && (isBootstrapped || hasRegisterDoc);
        setIsAdminUser(passesAdminRule);

        if (passesAdminRule) {
          // Pre-seed clean Firebase indexes on absolute initial setup run
          await seedFirestore();
        } else {
          await createSierraNotification(
            'error',
            'Intrusion Warning: Access Denied',
            `Unauthorized login attempt from ${user.email || 'anonymous-user'}. Resource access blocked.`,
            'تحذير اختراق: تم رفض الدخول',
            `محاولة دخول غير مصرح بها من ${user.email || 'مجهول'}. تم حجب الوصول بنجاح.`
          );
        }
      } else {
        setIsAdminUser(false);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const renderActiveProductPage = () => {
    switch (tab) {
      case 'overview':
        return <OverviewPage T={T} />;
      case 'agents':
        return <AgentsPage T={T} searchQuery={searchQuery} />;
      case 'workflows':
        return <WorkflowsPage T={T} isAr={isAr} searchQuery={searchQuery} />;
      case 'openclaw':
        return <OpenClawPage />;
      case 'nexus':
        return <NexusAIPage />;
      case 'leads':
        return <LeadsPage T={T} isAr={isAr} searchQuery={searchQuery} />;
      case 'listings':
        return <ListingsHubPage T={T} searchQuery={searchQuery} />;
      case 'curator':
        return <CuratorPage T={T} />;
      case 'scribe':
        return <ScribePage T={T} />;
      case 'closer':
        return <Stage9CloserPage />;
      case 'reports':
        return <ReportsPage T={T} isAr={isAr} />;
      case 'settings':
        return <SettingsPage T={T} isAr={isAr} currentUser={currentUser} />;
      default:
        return <OverviewPage T={T} />;
    }
  };

  const navItems = NAV_ITEMS(T);
  const activeTitle = navItems.find((n) => n.id === tab)?.label || 'Sierra Estates Intelligence';

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#05080f] text-white">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-500/15 border-t-cyan-500 animate-spin mb-4" />
        <p className="font-mono text-xs tracking-widest text-slate-500 select-none uppercase">Booting SIERRA OS...</p>
      </div>
    );
  }

  // Dual product line mapping: Client facing landing viewport vs Admin backbuilding
  if (viewMode === 'client') {
    return (
      <ClientHub
        T={T}
        langKey={langKey}
        theme={theme}
        setTheme={setTheme}
        setTab={setTab}
        onEnterAdminSession={() => setViewMode('admin')}
      />
    );
  }

  // Enforce zero-trust authenticated admin login screen
  if (!currentUser || !isAdminUser) {
    return (
      <LoginPage
        onLoginSuccess={() => setTab('overview')}
        isAdminUser={isAdminUser}
        currentUser={currentUser}
        loading={loading}
      />
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden bg-[#05080f] text-slate-300 selection:bg-cyan-500/30 font-sans ${isAr ? 'font-serif' : ''}`}>
      {/* Mobile Drawer sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-56 h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar
              T={T}
              tab={tab}
              setTab={setTab}
              collapsed={false}
              setCollapsed={() => {}}
              onClose={() => setMobileOpen(false)}
              theme={theme}
              setTheme={setTheme}
              langKey={langKey}
              setLangKey={setLangKey}
            />
          </div>
        </div>
      )}

      {/* Desktop Main Sidebar */}
      <aside className="hidden md:block shrink-0 h-full border-r border-slate-800">
        <Sidebar
          T={T}
          tab={tab}
          setTab={setTab}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onClose={null}
          theme={theme}
          setTheme={setTheme}
          langKey={langKey}
          setLangKey={setLangKey}
        />
      </aside>

      {/* Primary viewport stage */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Header bar */}
        <header className="h-[64px] border-b border-slate-800 bg-[#0a0f1d]/80 backdrop-blur-md px-6 flex items-center gap-4 shrink-0 select-none z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 active:scale-95 transition"
            id="mobile-drawer-toggle"
          >
            ☰
          </button>
          <h1 className="text-sm font-serif md:text-[#F0EDE5] font-semibold tracking-wide shrink-0">
            {activeTitle}
          </h1>

          {/* Real-time Global Search Input */}
          <div className="hidden sm:flex items-center relative max-w-xs w-full ml-1" id="global-header-search-container">
            <span className="absolute left-3 text-slate-500 pointer-events-none text-xs select-none">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "البحث بالترجمة الفورية..." : "Real-time multilingual search..."}
              className="w-full bg-[#05080f]/90 border border-slate-800 rounded px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-all font-mono pl-8 pr-7"
              id="global-header-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-500 hover:text-white transition duration-100 text-[10px] w-4 h-4 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10"
                title="Clear Search"
                id="btn-global-search-clear"
              >
                ✕
              </button>
            )}
          </div>

          <div className="ml-auto inline-flex items-center gap-3">
            {/* Lang toggler */}
            <button
              onClick={() => setLangKey((l) => (l === 'en' ? 'ar' : 'en'))}
              className="text-[10px] uppercase font-bold tracking-widest font-mono border border-slate-800 rounded-full px-2.5 py-1 text-slate-400 hover:text-white hover:border-cyan-500/40 transition duration-150 active:scale-95 select-none"
              id="btn-toggle-lang"
            >
              {isAr ? 'English' : 'عربي'}
            </button>

            {/* Dark & light theme toggler */}
            <button
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              className="p-1 rounded-full border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/40 transition duration-150 active:scale-95 text-xs select-none"
              id="btn-toggle-theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* View client hub public link */}
            <button
              onClick={() => setViewMode('client')}
              className="text-[10px] uppercase font-bold tracking-widest font-mono border border-[#C8961A]/20 hover:border-[#C8961A]/40 rounded-full px-2.5 py-1 text-[#C8961A] hover:text-[#E9C176] transition duration-150 active:scale-95 select-none cursor-pointer"
              id="btn-client-hub-link"
            >
              ↗ {T('livesite')}
            </button>

            {/* Real-time Administrative Notification Center */}
            <NotificationCenter isAr={isAr} />

            {/* Live active connection tag */}
            <div className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-[9.5px] rounded-full font-bold inline-flex items-center gap-1.5 uppercase font-mono tracking-widest select-none shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              <span>3.0 AI Connect</span>
            </div>
          </div>
        </header>

        {/* Dynamic page container viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#05080f]" id="main-content-viewport">
          {renderActiveProductPage()}
        </div>
      </div>
    </div>
  );
}
