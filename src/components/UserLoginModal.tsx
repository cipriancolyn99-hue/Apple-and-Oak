import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { useUserRegister, useUserLogin } from "@/hooks/useApi";
import { X, User, Lock, LogIn, UserPlus, Mail } from "lucide-react";

export function UserLoginModal() {
  const { visitorAccount, setVisitorAccount, currentUser } = useStore();
  const registerMutation = useUserRegister();
  const loginMutation = useUserLogin();

  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");

  // Hide User Login completely when staff/admin is logged in
  if (currentUser) {
    return null;
  }

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Logged in visitor — show their badge
  if (visitorAccount) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg border border-teal-400/30">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
            {visitorAccount.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-sm">{visitorAccount.name}</span>
        </div>
        <button
          onClick={() => setVisitorAccount(null)}
          className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-all text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  // Button to open login
  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-xl border border-teal-400/30"
      >
        <LogIn className="w-5 h-5" />
        <div className="flex flex-col items-start">
          <span className="font-bold text-sm leading-tight">User Login</span>
          <span className="text-teal-200 text-[10px] leading-tight">Sign in or create account</span>
        </div>
      </button>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success && result.user) {
        setVisitorAccount(result.user);
        setVisible(false);
        setEmail(""); setPassword("");
      } else {
        setError(result.error || "Login failed");
      }
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    try {
      const result = await registerMutation.mutateAsync({ name, email, password });
      if (result.success && result.user) {
        setVisitorAccount(result.user);
        setVisible(false);
        setName(""); setEmail(""); setPassword("");
      } else {
        setError(result.error || "Sign up failed");
      }
    } catch {
      setError("Sign up failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f1923] border border-white/20 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="Apple and Oak" className="w-10 h-10 object-contain" />
            <div>
              <h2 className="text-white font-bold text-lg">Welcome</h2>
              <p className="text-teal-200 text-xs">Sign in to chat and connect</p>
            </div>
          </div>
          <button onClick={() => { setVisible(false); setError(""); }} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => { setTab("login"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
              tab === "login" ? "text-teal-400 border-b-2 border-teal-400 bg-white/5" : "text-white/50 hover:text-white/80"
            }`}
          >
            <LogIn className="w-4 h-4" /> Log In
          </button>
          <button
            onClick={() => { setTab("signup"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
              tab === "signup" ? "text-teal-400 border-b-2 border-teal-400 bg-white/5" : "text-white/50 hover:text-white/80"
            }`}
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">{error}</div>}

          {/* LOGIN FORM */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-400" /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-400" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>
              <button type="submit" disabled={loginMutation.isPending} className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg disabled:opacity-50">
                {loginMutation.isPending ? "Logging in..." : "Log In"}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-400" /> Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-400" /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-400" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 4 characters)"
                  required
                  minLength={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>
              <button type="submit" disabled={registerMutation.isPending} className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg disabled:opacity-50">
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          <button
            onClick={() => { setVisible(false); setError(""); }}
            className="w-full py-2 text-white/50 hover:text-white text-sm transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
