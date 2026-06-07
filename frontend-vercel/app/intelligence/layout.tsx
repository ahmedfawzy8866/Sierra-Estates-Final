'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import './intelligence.css';

/**
 * Intelligence OS layout — full-screen, auth-gated (mirrors /admin's guard).
 * Renders no app chrome; the OS provides its own sidebar/topbar.
 */
export default function IntelligenceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.replace('/admin/login');
      setChecking(false);
    });
    return unsub;
  }, [router]);

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07111e' }}>
        <div style={{ color: '#C8961A', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
          Authenticating…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
