import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/hooks/useStore";
import { useWorkerLogin, useUserLogin, useUserRegister, useGoogleLogin, useUserLogout } from "@/hooks/useApi";
import { setAuthToken, getAuthToken } from "@/providers/trpc";
import { X, User, Lock, LogIn, UserPlus, Mail, Shield } from "lucide-react";

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }) => void;
          renderButton: (parent: HTMLElement, options: { theme?: string; size?: string; text?: string; shape?: string; width?: string | number; locale?: string }) => void;
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; getNotDisplayedReason?: () => string }) => void) => void;
          cancel: () => void;
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
  const [googleReady, setGoogleReady] = useState(false);

  // Get Google Client ID from Vite env (must start with VITE_ to be included in client bundle)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  // Check if Google script is loaded
  useEffect(() => {
    if (!googleClientId) return;
    const checkGoogle = () => {
      if (window.google?.accounts?.id) {
        setGoogleReady(true);
      } else {
        setTimeout(checkGoogle, 300);
      }
    };
    checkGoogle();
  }, [googleClientId]);

  // Handle Google credential response
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg);
    }
  }, [googleLogin, setVisitorAccount]);

  // Initialize and render Google button when modal opens
  useEffect(() => {
    if (!visible || !googleReady || !googleClientId || !googleBtnRef.current) return;

    try {
      window.google!.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          if (response.credential) {
            handleGoogleCredential(response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google!.accounts.id.renderButton(googleBtnRef.current, {
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: "100%",
        locale: "en",
      });
    } catch (e) {
      console.error("Google init/render error:", e);
    }
  }, [visible, googleReady, googleClientId, handleGoogleCredential]);

  // ============ STAFF LOGGED IN ============
  if (currentUser) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg border border-violet-400/30">
          <Shield className="w-4 h-4" />
          <span className="font-semibold text-sm hidden sm:inline">{currentUser.name}</span>
          <span className="text-violet-200 text-xs hidden lg:inline">({currentUser.role})</span>
        </div>
        <button
          onClick={() => {
            const token = getAuthToken();
            setUser(null);
            setAuthToken(null);
            fetch("/api/trpc/worker.logout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: currentUser.email, token }),
            }).catch(() => {});
          }}
          className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-all text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  // ============ USER LOGGED IN ============
  if (visitorAccount) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg border border-teal-400/30">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
            {visitorAccount.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-sm hidden sm:inline">{visitorAccount.name}</span>
        </div>
        <button
          onClick={() => {
            const token = getAuthToken();
            setVisitorAccount(null);
            setAuthToken(null);
            if (token) { userLogout.mutate({ token }); }
          }}
          className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-all text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  // ============ NOBODY LOGGED IN ============
  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="bg-gradient-to-r from-teal-600 to-violet-700 hover:from-teal-500 hover:to-violet-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all flex items-center gap-2 shadow-xl border border-white/20"
      >
        <LogIn className="w-5 h-5" />
        <div className="flex flex-col items-start">
          <span className="font-bold text-sm leading-tight">Login</span>
          <span className="text-white/70 text-[10px] leading-tight hidden sm:inline">Staff or user account</span>
        </div>
      </button>
    );
  }

  // ============ LOGIN FORM ============
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Try staff/worker login first
    try {
      const staffResult = await workerLogin.mutateAsync({ email, password });
      if (staffResult.success && staffResult.worker && staffResult.token) {
        setAuthToken(staffResult.token);
        setUser({ name: staffResult.worker.name, email: staffResult.worker.email, role: staffResult.worker.role });
        setVisible(false);
        setEmail(""); setPassword("");
        return;
      }
    } catch {
      // not staff, try user login
    }

    // Try user login
    try {
      const userResult = await userLogin.mutateAsync({ email, password });
      if (userResult.success && userResult.user && userResult.token) {
        setAuthToken(userResult.token);
        setVisitorAccount(userResult.user);
        setVisible(false);
        setEmail(""); setPassword("");
        return;
      }
      setError(userResult.error || "Invalid email or password");
    } catch {
      setError("Invalid email or password");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name"); return; }
    try {
      const result = await userRegister.mutateAsync({ name, email, password });
      if (result.success && result.user && result.token) {
        setAuthToken(result.token);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0f1923] border border-white/20 rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-violet-700 px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="Apple and Oak" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <div>
              <h2 className="text-white font-bold text-base sm:text-lg">Welcome</h2>
              <p className="text-white/70 text-[10px] sm:text-xs">Sign in — staff accounts are recognized automatically</p>
            </div>
          </div>
          <button onClick={() => { setVisible(false); setError(""); }} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
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

          <div className="p-5 sm:p-6 space-y-4">
            {error && <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">{error}</div>}

            {/* LOGIN */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-teal-400" /> Email
                  </label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-400" /> Password
                  </label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors" />
                </div>
                <button type="submit" disabled={workerLogin.isPending || userLogin.isPending}
                  className="w-full bg-gradient-to-r from-teal-600 to-violet-700 hover:from-teal-500 hover:to-violet-600 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg disabled:opacity-50">
                  {workerLogin.isPending || userLogin.isPending ? "Checking..." : "Log In"}
                </button>
              </form>
            )}

            {/* SIGNUP */}
            {tab === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-400" /> Your Name
                  </label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-teal-400" /> Email
                  </label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-400" /> Password
                  </label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password (min 4 characters)" required minLength={4}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400 transition-colors" />
                </div>
                <button type="submit" disabled={userRegister.isPending}
                  className="w-full bg-gradient-to-r from-teal-600 to-violet-700 hover:from-teal-500 hover:to-violet-600 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg disabled:opacity-50">
                  {userRegister.isPending ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/40 text-xs">OR</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* REAL Google Sign-In Button */}
            {googleReady && googleClientId ? (
              <div className="space-y-2">
                <div ref={googleBtnRef} className="w-full flex justify-center" />
                {/* Fallback: Google One Tap prompt */}
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.google?.accounts.id.prompt((notification) => {
                        if (notification.isNotDisplayed()) {
                          const reason = notification.getNotDisplayedReason?.();
                          if (reason === "opt_out_or_no_session" || reason === "browser_not_supported") {
                            setError("Google sign-in blocked by your browser. Please allow third-party cookies or use email login.");
                          } else {
                            setError("Google sign-in unavailable. Please use email login.");
                          }
                        }
                      });
                    } catch {
                      setError("Google sign-in failed to load. Please use email login.");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-2.5 rounded-lg transition-all shadow-lg"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="whitespace-nowrap">Sign in with Google</span>
                </button>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-white/60 text-sm">
                  {googleClientId
                    ? "Loading Google Sign-In..."
                    : "Google sign-in needs to be configured by the admin."}
                </p>
              </div>
            )}

            <button onClick={() => { setVisible(false); setError(""); }}
              className="w-full py-2 text-white/50 hover:text-white text-sm transition-colors">
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
