'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './index';

export type UserRole = 'admin' | 'manager' | 'agent' | null;
interface AuthContextValue { user: User | null; role: UserRole; loading: boolean; signIn: (e:string,p:string)=>Promise<void>; signInWithGoogle:()=>Promise<void>; signUp:(e:string,p:string)=>Promise<void>; signOut:()=>Promise<void>; }
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          setRole(snap.exists() ? (snap.data().role as UserRole) : null);
        } catch { setRole(null); }
      } else { setRole(null); }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user, role, loading,
      signIn: (e,p) => signInWithEmailAndPassword(auth, e, p).then(() => {}),
      signInWithGoogle: () => signInWithPopup(auth, new GoogleAuthProvider()).then(() => {}),
      signUp: (e,p) => createUserWithEmailAndPassword(auth, e, p).then(() => {}),
      signOut: async () => { await firebaseSignOut(auth); setRole(null); },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
