import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setLocation("/agent-dashboard");
    });
    return unsub;
  }, [setLocation]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLocation("/agent-dashboard");
    } catch (err: any) {
      const msg = err?.code ?? "";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("Invalid email or password.");
      } else if (msg.includes("too-many-requests")) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setLocation("/agent-dashboard");
    } catch (err: any) {
      if (!err?.code?.includes("popup-closed")) {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(135deg, #07111e 0%, #0d2035 50%, #07111e 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(211,167,71,.07) 0%, transparent 65%)", top: "-20%", right: "-10%", animation: "orbFloat1 14s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,90,180,.06) 0%, transparent 65%)", bottom: "-10%", left: "-8%", animation: "orbFloat2 18s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(211,167,71,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(211,167,71,.025) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <a href="/" style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 54, height: 54, borderRadius: 14,
              background: "linear-gradient(135deg,#C9A96E,#A07840)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 900, color: "#07111e",
              boxShadow: "0 8px 24px rgba(211,167,71,.35)",
              fontFamily: "var(--font-serif,serif)",
            }}>SE</div>
            <div style={{ fontFamily: "var(--font-serif,'Cormorant Garamond',serif)", fontSize: 22, color: "#fff", letterSpacing: ".04em" }}>Sierra Estates</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", letterSpacing: ".2em", textTransform: "uppercase" }}>Cairo's Premier AI Real Estate Engine</div>
          </a>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(211,167,71,.15)",
          borderRadius: 24,
          padding: "36px 32px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 32px 80px rgba(0,0,0,.4)",
        }}>
          <h1 style={{ fontFamily: "var(--font-serif,'Cormorant Garamond',serif)", fontSize: 26, color: "#fff", marginBottom: 4, fontWeight: 400 }}>Welcome Back</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 28, letterSpacing: ".02em" }}>Sign in to continue to Sierra Estates</p>

          {/* Demo hint */}
          <div style={{
            background: "rgba(211,167,71,.07)",
            border: "1px solid rgba(211,167,71,.18)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 20,
            fontSize: 11,
            color: "rgba(255,255,255,.5)",
          }}>
            <span style={{ color: "var(--gold,#C9A96E)", fontWeight: 700 }}>Demo: </span>
            agent@sierra-estates.com · demo2024
          </div>

          {error && (
            <div style={{
              background: "rgba(220,38,38,.08)",
              border: "1px solid rgba(220,38,38,.25)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 12,
              color: "#fca5a5",
            }}>{error}</div>
          )}

          <form onSubmit={handleEmail} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 10.5, color: "rgba(255,255,255,.4)", letterSpacing: ".12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="agent@sierra-estates.com"
                required
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "12px 14px",
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(211,167,71,.15)",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 13,
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color .2s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(211,167,71,.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(211,167,71,.15)")}
              />
            </div>

            <div>
              <label style={{ fontSize: 10.5, color: "rgba(255,255,255,.4)", letterSpacing: ".12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "12px 40px 12px 14px",
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(211,167,71,.15)",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 13,
                    fontFamily: "inherit",
                    outline: "none",
                    transition: "border-color .2s",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(211,167,71,.5)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(211,167,71,.15)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,.3)", fontSize: 12,
                  }}
                >{showPass ? "HIDE" : "SHOW"}</button>
              </div>
              <div style={{ textAlign: "right", marginTop: 6 }}>
                <button type="button" style={{ background: "none", border: "none", color: "rgba(211,167,71,.7)", fontSize: 11, cursor: "pointer", padding: 0 }}>Forgot password?</button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                padding: "13px",
                borderRadius: 11,
                background: loading ? "rgba(211,167,71,.4)" : "linear-gradient(135deg,#C9A96E,#A07840)",
                color: "#07111e",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                boxShadow: "0 6px 24px rgba(211,167,71,.3)",
                transition: "all .3s",
              }}
            >{loading ? "Signing in…" : "Sign In"}</button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)", letterSpacing: ".1em" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
          </div>

          {/* Google sign-in */}
          <button
            id="login-google"
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 11,
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.1)",
              color: "rgba(255,255,255,.8)",
              fontSize: 12,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "all .2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.09)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.05)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "rgba(255,255,255,.25)" }}>
            Don't have an account?{" "}
            <button onClick={() => setLocation("/register")} style={{ background: "none", border: "none", color: "rgba(211,167,71,.8)", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
              Request Access
            </button>
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 10, color: "rgba(255,255,255,.15)", letterSpacing: ".05em" }}>
          © 2026 Sierra Estates · All rights reserved
        </p>
      </div>

      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(30px,-20px) scale(1.04);} 66%{transform:translate(-15px,25px) scale(.97);} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1);} 40%{transform:translate(-25px,15px) scale(1.06);} 75%{transform:translate(20px,-30px) scale(.95);} }
      `}</style>
    </div>
  );
}
