'use client';
import { AuthProvider } from '@/lib/firebase/AuthContext';
export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
