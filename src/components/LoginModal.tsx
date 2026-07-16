import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/hooks/useStore";
import { useWorkerLogin, useUserLogin, useUserRegister, useGoogleLogin, useUserLogout } from "@/hooks/useApi";
import { setAuthToken } from "@/providers/trpc";
import { X, Lock, LogIn, Mail, User } from "lucide-react";

// Hardcoded Google Client ID
const GOOGLE_CLIENT_ID = "4388145443-83c9tf3orlt2o6c1llr9ohl61d5fijs3.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function LoginModal() {
  const { currentUser, setUser, visitorAccount, setVisitorAccount } = useStore();
  const workerLogin = useWorkerLogin();
  const userLogin = useUserLogin();
  const userRegister = useUserRegister();
  const googleLogin = useGoogleLogin();
  const userLogout = useUserLogout();

  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredential = useCallback(async (credential: string) => {
    setError("");
    try {
      const result = await googleLogin.mutateAsync({ credential });
      if (result.success && result.user && result.token) {
        setAuthToken(result.token);
        setVisitorAccount(result.user);
        setVisible(false);
      } else {
        setError(result.error || "Google sign-in failed");
      }
    } catch {
      setError("Google sign-in failed");
    }
  }, [googleLogin, setVisitorAccount]);

  // Initialize Google button EVERY time modal opens
  useEffect(() => {
    if (!visible) return;

    let attempts = 0;
    const maxAttempts = 30;

    const initGoogle = () => {
      attempts++;
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response: { credential: string }) => {
              if (response.credential) handleGoogleCredential(response.credential);
            },
          });
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline", size: "large", text: "continue_with", shape: "rectangular", width: 280,
          });
        } catch {
          // Google button render failed
        }
      } else if (attempts < maxAttempts) {
        setTimeout(initGoogle, 200);
      }
    };

    // Wait a bit for script to be ready
    setTimeout(initGoogle, 300);
  }, [visible, handleGoogleCredential]);

  // Staff logged in
  if (currentUser) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-violet-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg">
          <span className="font-semibold text-sm">{currentUser.name}</span>
        </div>
        <button onClick={() => { setUser(null); setAuthToken(null); }} className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm">Logout</button>
      </div>
    );
  }

  // User logged in
  if (visitorAccount) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-teal-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{visitorAccount.name.charAt(0).toUpperCase()}</div>
          <span className="font-semibold text-sm">{visitorAccount.name}</span>
        </div>
        <button onClick={() => { setVisitorAccount(null); setAuthToken(null); if (userLogout) { const token = localStorage.getItem("auth_token"); if (token) userLogout.mutate({ token }); } }} className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm">Logout</button>
      </div>
    );
  }

  if (!visible) {
    return (
      <button onClick={() => setVisible(true)} className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xl">
        <LogIn className="w-5 h-5" /><span className="font-bold text-sm">Login</span>
      </button>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      const staffResult = await workerLogin.mutateAsync({ email, password });
      if (staffResult.success && staffResult.worker && staffResult.token) {
        setAuthToken(staffResult.token);
        setUser({ name: staffResult.worker.name, email: staffResult.worker.email, role: staffResult.worker.role });
        setVisible(false); return;
      }
    } catch { /* not staff */ }
    try {
      const userResult = await userLogin.mutateAsync({ email, password });
      if (userResult.success && userResult.user && userResult.token) {
        setAuthToken(userResult.token);
        setVisitorAccount(userResult.user);
        setVisible(false); return;
      }
      setError(userResult.error || "Invalid credentials");
    } catch { setError("Login failed"); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!name.trim()) { setError("Please enter your name"); return; }
    try {
      const result = await userRegister.mutateAsync({ name, email, password });
      if (result.success && result.user && result.token) {
        setAuthToken(result.token);
        setVisitorAccount(result.user);
        setVisible(false);
      } else { setError(result.error || "Sign up failed"); }
    } catch { setError("Sign up failed"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0f1923] border border-white/20 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-teal-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div><h2 className="text-white font-bold text-lg">Welcome</h2><p className="text-teal-200 text-xs">Sign in or create an account</p></div>
          <button onClick={() => { setVisible(false); setError(""); }} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex border-b border-white/10">
            <button onClick={() => { setTab("login"); setError(""); }} className={`flex-1 py-3 text-sm ${tab === "login" ? "text-teal-400 border-b-2 border-teal-400 bg-white/5" : "text-white/50"}`}>Log In</button>
            <button onClick={() => { setTab("signup"); setError(""); }} className={`flex-1 py-3 text-sm ${tab === "signup" ? "text-teal-400 border-b-2 border-teal-400 bg-white/5" : "text-white/50"}`}>Create Account</button>
          </div>
          <div className="p-6 space-y-4">
            {error && <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">{error}</div>}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div><label className="text-white/80 text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-teal-400" /> Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400" placeholder="your@email.com" /></div>
                <div><label className="text-white/80 text-sm flex items-center gap-2"><Lock className="w-4 h-4 text-teal-400" /> Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400" placeholder="Your password" /></div>
                <button type="submit" disabled={workerLogin.isPending || userLogin.isPending} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 rounded-lg shadow-lg disabled:opacity-50">Log In</button>
              </form>
            )}
            {tab === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div><label className="text-white/80 text-sm flex items-center gap-2"><User className="w-4 h-4 text-teal-400" /> Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400" placeholder="Your name" /></div>
                <div><label className="text-white/80 text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-teal-400" /> Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400" placeholder="your@email.com" /></div>
                <div><label className="text-white/80 text-sm flex items-center gap-2"><Lock className="w-4 h-4 text-teal-400" /> Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400" placeholder="Min 4 characters" /></div>
                <button type="submit" disabled={userRegister.isPending} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 rounded-lg shadow-lg disabled:opacity-50">Create Account</button>
              </form>
            )}
            <div className="flex items-center gap-3"><div className="flex-1 h-px bg-white/20" /><span className="text-white/40 text-xs">OR</span><div className="flex-1 h-px bg-white/20" /></div>
            {/* Google Button - ALWAYS rendered */}
            <div ref={googleBtnRef} className="w-full flex justify-center min-h-[40px]" />
            <button onClick={() => { setVisible(false); setError(""); }} className="w-full py-2 text-white/50 hover:text-white text-sm">Continue as Guest</button>
          </div>
        </div>
      </div>
    </div>
  );
}
