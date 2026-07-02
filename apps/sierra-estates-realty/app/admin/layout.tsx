'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';
import { LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/admin/login');
        setIsLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.data()?.role;

        // Only allow admin and manager roles
        if (role === 'admin' || role === 'manager') {
          setIsAuth(true);
          setUserRole(role);
        } else {
          router.replace('/admin/login');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        router.replace('/admin/login');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#071422] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#C9A84C] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading admin console...</p>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#071422] text-[#F4F0E8]">
      {/* Header */}
      <header className="bg-[#0a1829] border-b border-[#C9A84C]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/admin" className="text-2xl font-bold text-[#C9A84C]">
            Sierra Admin
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-[#C9A84C]/10 rounded-lg transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/admin" className="hover:text-[#C9A84C] transition">
              Dashboard
            </Link>
            <Link href="/admin/leads" className="hover:text-[#C9A84C] transition">
              Leads
            </Link>
            <Link href="/admin/listings" className="hover:text-[#C9A84C] transition">
              Listings
            </Link>
            <Link href="/admin/intelligence-os" className="hover:text-[#C9A84C] transition">
              Intelligence OS
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-[#C9A84C]/20 px-6 py-4 space-y-3 bg-[#0a1829]">
            <Link href="/admin" className="block hover:text-[#C9A84C] transition py-2">
              Dashboard
            </Link>
            <Link href="/admin/leads" className="block hover:text-[#C9A84C] transition py-2">
              Leads
            </Link>
            <Link href="/admin/listings" className="block hover:text-[#C9A84C] transition py-2">
              Listings
            </Link>
            <Link href="/admin/intelligence-os" className="block hover:text-[#C9A84C] transition py-2">
              Intelligence OS
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
