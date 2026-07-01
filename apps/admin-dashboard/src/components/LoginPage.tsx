import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginPageProps {
  onLoginSuccess: () => void;
  isAdminUser: boolean;
  currentUser: any;
  loading: boolean;
}

export default function LoginPage({ onLoginSuccess, isAdminUser, currentUser, loading }: LoginPageProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setErrorMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      // Enforce custom query to prompt email account selector
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Authentication cancelled or failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setErrorMsg(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#05080f] text-slate-300 selection:bg-cyan-500/30 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute inset-0 bg-radial-[circle_800px_at_center] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md bg-[#0a0f1d]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-8 relative shadow-2xl z-10 text-center animate-fade-in animate-duration-500">
        {/* Shield Logo Wrapper */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="text-3xl">🛡️</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          SIERRA ESTATES 3.0
        </h1>
        <p className="font-mono text-[9px] tracking-[0.22em] text-slate-500 uppercase mb-8">
          INTELLIGENCE OS · SECURITY PORTAL
        </p>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Verifying Identity...</p>
          </div>
        ) : currentUser ? (
          <div className="py-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 mb-6 text-left">
              <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-1">Authenticated Authenticity</p>
              <p className="text-xs font-semibold text-white truncate">{currentUser.displayName || "Unknown Identity"}</p>
              <p className="text-[11px] font-mono text-cyan-400 truncate mt-0.5">{currentUser.email}</p>
              
              {!isAdminUser && (
                <div className="mt-4 p-3 bg-red-950/40 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400 font-medium">
                    ⚠️ Access Restricted
                  </p>
                  <p className="text-[11px] text-red-350/80 mt-1 leading-relaxed">
                    Account is not signed in with authorized permissions. Direct configuration requires bootstrapped admin credentials from Sierra Estates.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {isAdminUser ? (
                <button
                  onClick={onLoginSuccess}
                  className="w-full py-3 px-4 bg-cyan-500 text-black rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:bg-cyan-400 active:scale-98 transition duration-150 cursor-pointer"
                  id="btn-goto-dash"
                >
                  Enter intelligence OS
                </button>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 font-medium active:scale-98 transition duration-150 cursor-pointer"
                  id="btn-try-another-auth"
                >
                  Authenticate Diff User
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="text-xs text-slate-500 hover:text-white underline font-mono tracking-widest uppercase py-2 transition cursor-pointer"
                id="btn-signout"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-slate-450 leading-relaxed mb-6">
              You must sign in with a registered Google Admin account to download live state, trigger SCR scraper algorithms, and configure stage pricing.
            </p>

            {errorMsg && (
              <div className="bg-red-950/30 border border-red-500/15 rounded-xl p-3 mb-4 text-left">
                <p className="text-xs text-red-400 font-medium">Authentication Error</p>
                <p className="text-[11px] text-slate-400 mt-1">{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-98 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
              id="google-login-trigger"
            >
              {authLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  <span>Connecting Securely...</span>
                </>
              ) : (
                <>
                  <span className="font-bold">🔑</span>
                  <span>Google SSO Administration</span>
                </>
              )}
            </button>
            <div className="mt-8 text-[11px] text-slate-500 font-mono tracking-widest uppercase">
              Bootstrapped: A.fawzy8866@gmail.com
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
