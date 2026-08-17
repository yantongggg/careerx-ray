import { useState } from "react";
import { ArrowRight, BarChart3, Lock, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { demoToast } from "./toast";

interface AuthPageProps {
  mode: "login" | "register";
  onAuthed: (user: { name: string; email: string; isNew: boolean }) => void;
  onBack: () => void;
  onSwitchMode: () => void;
}

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function AuthPage({ mode, onAuthed, onBack, onSwitchMode }: AuthPageProps) {
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const termsBlocked = isRegister && !termsAccepted;

  const validate = () => {
    const next: { name?: string; email?: string; password?: string } = {};
    if (isRegister && !name.trim()) next.name = "Please tell us your name.";
    if (!email.includes("@")) next.email = "Enter a valid email address (must contain @).";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (termsBlocked) return;
    if (!validate()) return;
    onAuthed({
      name: isRegister ? name.trim() : "Jordan Kim",
      email: email.trim(),
      isNew: isRegister,
    });
  };

  const handleGoogle = () => {
    if (termsBlocked) return;
    onAuthed({ name: "Jordan Kim", email: "jordan.kim@gmail.com", isNew: isRegister });
  };

  const inputClass = (hasError?: string) =>
    `w-full pl-9 pr-3 py-2.5 text-sm bg-white border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-shadow ${
      hasError ? "border-red-400 focus:ring-red-200" : "border-border focus:ring-primary/20 focus:border-primary/40"
    }`;

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Nav */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">CareerX-Ray</span>
          </button>
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-3.5 py-1.5 mb-5 shadow-sm">
              <Sparkles size={12} className="text-primary" />
              <span className="text-xs text-muted-foreground font-medium">
                {isRegister ? "Free to start · 3-minute X-Ray scan" : "Welcome back to your Career Intelligence"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {isRegister ? "Create your account" : "Sign in"}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {isRegister
                ? "See your career the way the Malaysian job market sees it."
                : "Pick up where you left off — your Career DNA is waiting."}
            </p>
          </div>

          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={termsBlocked}
              className={`w-full flex items-center justify-center gap-2.5 bg-white border border-border rounded-lg py-2.5 text-sm font-semibold text-foreground transition-all ${
                termsBlocked ? "opacity-50 cursor-not-allowed" : "hover:shadow-md hover:-translate-y-px"
              }`}
            >
              <GoogleLogo />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70 font-medium">or with email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Full name</label>
                  <div className="relative">
                    <UserRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Aisyah Rahman"
                      className={inputClass(errors.name)}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass(errors.email)}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={isRegister ? "At least 6 characters" : "••••••••"}
                    className={inputClass(errors.password)}
                  />
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>

              {isRegister && (
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-border accent-[#16284B] flex-shrink-0"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    I have read and understand the{" "}
                    <button
                      type="button"
                      onClick={e => { e.preventDefault(); demoToast("Terms & Conditions opened ✓"); }}
                      className="text-primary font-semibold underline underline-offset-2 hover:opacity-80"
                    >
                      Terms &amp; Conditions
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={e => { e.preventDefault(); demoToast("Privacy Policy opened ✓"); }}
                      className="text-primary font-semibold underline underline-offset-2 hover:opacity-80"
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={termsBlocked}
                className={`w-full flex items-center justify-center gap-1.5 bg-primary text-white rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  termsBlocked ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 hover:shadow-md"
                }`}
              >
                {isRegister ? "Create account" : "Sign in"} <ArrowRight size={14} />
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-5">
              {isRegister ? "Already have an account?" : "New here?"}{" "}
              <button onClick={onSwitchMode} className="text-primary font-semibold hover:underline underline-offset-2">
                {isRegister ? "Sign in" : "Create an account"}
              </button>
            </p>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/70 mt-4">
            <ShieldCheck size={12} />
            Demo build — no real credentials are stored.
          </p>
        </div>
      </div>
    </div>
  );
}
