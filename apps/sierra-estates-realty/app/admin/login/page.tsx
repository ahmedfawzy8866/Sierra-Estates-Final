'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // User authenticated, layout will check role
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071422] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0a1829] border border-[#C9A84C]/20 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white text-center mb-2">Sierra Admin</h1>
          <p className="text-[#C9A84C]/60 text-center mb-8">Staff Portal</p>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[#C9A84C] font-semibold mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-[#C9A84C]/60" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#071422] border border-[#C9A84C]/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#C9A84C]/40 focus:outline-none focus:border-[#C9A84C]"
                  placeholder="admin@sierra-estates.net"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#C9A84C] font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-[#C9A84C]/60" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#071422] border border-[#C9A84C]/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-[#C9A84C]/40 focus:outline-none focus:border-[#C9A84C]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 disabled:bg-[#C9A84C]/50 text-[#071422] font-bold py-3 rounded-lg transition"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-[#C9A84C]/60 text-center text-sm mt-6">
            Staff only. Unauthorized access prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
