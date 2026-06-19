'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard, Building2, RefreshCw, ImageIcon, Settings, LogOut,
  Menu, X, Shield, Bot, BookOpen, ClipboardList, Zap, Handshake,
  BarChart3, Database, Wand2, Briefcase, MessageSquare, BrainCircuit,
  type LucideIcon,
} from 'lucide-react';
import {
  navForRole, canAccessPath, NAV_SECTION_ORDER, type AdminNavItem,
} from '@/lib/admin/permissions';

// Map icon names from the permissions config to lucide components.
const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard, Building2, RefreshCw, ImageIcon, Settings, Bot,
  BookOpen, ClipboardList, Zap, Handshake, BarChart3, Database,
  Wand2, Briefcase, MessageSquare, BrainCircuit,
};

const BADGE_STYLES: Record<string, string> = {
  red: 'bg-[#E63946] text-white',
  green: 'bg-[#34D399] text-[#071422]',
  blue: 'bg-[#1E88D9] text-white',
};

function NavLink({
  item, active, onNavigate,
}: { item: AdminNavItem; active: boolean; onNavigate?: () => void }) {
  const Icon = ICONS[item.icon] ?? LayoutDashboard;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all border-l-2 pl-[14px] ${
        active
          ? 'bg-white/6 text-[#C9A84C] border-[#C9A84C]'
          : 'text-white/55 hover:text-white/90 hover:bg-white/4 border-transparent'
      }`}
    >
      <Icon size={16} />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${BADGE_STYLES[item.badgeColor ?? 'blue']}`}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  // Auth guard — redirect unauthenticated users to login.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user && pathname !== '/admin/login') {
        router.replace('/admin/login');
      }
      setChecking(false);
    });
    return unsub;
  }, [pathname, router]);

  // Role guard — bounce staff away from sections they cannot access.
  useEffect(() => {
    if (checking || !role || pathname === '/admin/login') return;
    if (!canAccessPath(role, pathname)) {
      router.replace('/admin/dashboard');
    }
  }, [checking, role, pathname, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/admin/login');
  };

  // Don't wrap the login page in the admin chrome.
  if (pathname === '/admin/login') return <>{children}</>;

  if (checking) {
    return (
      <div className="min-h-screen bg-[#031632] flex items-center justify-center">
        <div className="text-[#C9A84C] text-xs tracking-widest uppercase animate-pulse font-mono">
          Authenticating...
        </div>
      </div>
    );
  }

  const visibleNav = navForRole(role);
  const currentLabel = visibleNav.find((n) => pathname.startsWith(n.href))?.label ?? 'Admin';

  const renderNav = (onNavigate?: () => void) =>
    NAV_SECTION_ORDER.map((section) => {
      const items = visibleNav.filter((n) => n.section === section);
      if (items.length === 0) return null;
      return (
        <div key={section} className="mb-2">
          <div className="px-4 pt-3 pb-1 text-[8px] font-bold tracking-[0.2em] uppercase text-white/25 font-mono">
            {section}
          </div>
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname.startsWith(item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      );
    });

  return (
    <div className="min-h-screen flex bg-[#f8f9fa] font-body">

      {/* ══ SIDEBAR (Desktop) ══ */}
      <aside className="hidden lg:flex flex-col w-[280px] shrink-0 bg-[#031632] min-h-screen fixed top-0 left-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-3 px-8 py-8 border-b border-white/5">
          <Shield className="text-[#C9A84C]" size={28} />
          <div>
            <div className="text-white font-bold text-base tracking-tight uppercase font-display">
              Sierra Estates
            </div>
            <div className="text-white/30 text-[9px] tracking-widest uppercase font-mono">
              Intelligence OS
            </div>
          </div>
        </div>

        {/* Nav items (role-gated) */}
        <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto">
          {renderNav()}
        </nav>

        {/* Role pill + Sign out */}
        <div className="px-4 pb-8 border-t border-white/5 pt-4">
          {role && (
            <div className="px-4 pb-3 text-[9px] text-white/30 tracking-widest uppercase font-mono">
              Signed in · <span className="text-[#C9A84C]">{role}</span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-white/40 hover:text-white/80 text-sm transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ══ MOBILE SIDEBAR ══ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#031632] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Shield className="text-[#C9A84C]" size={24} />
                <span className="text-white font-bold uppercase tracking-tight font-display">Sierra Estates</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white" aria-label="Close menu" title="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto">
              {renderNav(() => setMobileOpen(false))}
            </nav>
            <div className="px-4 pb-6 border-t border-white/5 pt-4">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-3 text-white/40 hover:text-white/80 text-sm transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ══ MAIN CONTENT ══ */}
      <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-[68px] flex items-center justify-between px-6 md:px-10 bg-white/80 backdrop-blur-xl border-b border-black/5">
          <button
            className="lg:hidden text-[#071422]/60 hover:text-[#071422]"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            title="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="hidden lg:block text-sm font-semibold text-[#071422]/40 capitalize tracking-wide">
            {currentLabel}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
            <span className="text-[9px] text-[#071422]/30 tracking-widest uppercase font-mono">
              Sierra Estates 1.0
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>

      {/* ══ MOBILE BOTTOM NAV ══ */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#031632] border-t border-white/5 flex justify-around py-2">
        {visibleNav.slice(0, 5).map((item) => {
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 ${
                active ? 'text-[#C9A84C]' : 'text-white/40'
              }`}
            >
              <Icon size={18} />
              <span className="text-[8px] tracking-wide uppercase">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
