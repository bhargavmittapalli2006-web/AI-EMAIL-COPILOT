import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  User,
  Shield,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  X,
  KeyRound,
  Info,
  Server,
  Zap,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { authService } from '../services/authService';

/**
 * Standard Email Format Validator (RFC-compliant practical email validation)
 * Supports: @gmail.com, @outlook.com, @university.edu, @company.co.in, user+tag@domain.com, etc.
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

export const Login = ({
  onLoginSuccess,
  onNavigateLanding,
  theme,
  onToggleTheme,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Modals for Google Auth and Forgot Password
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address (e.g., user@company.com or user@gmail.com).');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your password.');
      return;
    }

    if (isRegisterMode) {
      if (cleanPassword.length < 6) {
        setError('Password must be at least 6 characters in length.');
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        setError('Passwords do not match. Please verify your confirmation password.');
        return;
      }
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isRegisterMode) {
        const result = await authService.register({
          email: cleanEmail,
          password: cleanPassword,
          displayName: displayName.trim() || cleanEmail.split('@')[0],
          role: 'SecOps Analyst',
        });
        onLoginSuccess({
          token: result.token,
          user_id: result.user_id,
          email: result.email,
          name: result.display_name,
          role: result.role,
        });
      } else {
        const result = await authService.login({
          email: cleanEmail,
          password: cleanPassword,
        });
        onLoginSuccess({
          token: result.token,
          user_id: result.user_id,
          email: result.email,
          name: result.display_name,
          role: result.role,
        });
      }
    } catch (err) {
      console.warn('Backend authentication response:', err.message);
      const msg = err.message || '';
      if (msg.includes('401') || msg.toLowerCase().includes('invalid email or password')) {
        setError('Incorrect email or password. Please verify your credentials.');
      } else if (msg.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (msg.includes('Failed to fetch') || msg.toLowerCase().includes('network')) {
        setError('Unable to connect to the security server. Please verify backend service availability.');
      } else {
        setError(msg || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 relative overflow-hidden selection:bg-blue-600 selection:text-white select-none">
      {/* Background Ambience Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500/5 dark:bg-sky-600/10 blur-[140px] rounded-full" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-600/10 blur-[140px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateLanding}
          className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer text-left"
        >
          <Logo size="small" showTagline={true} />
        </button>

        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* Main Enterprise Symmetrical Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Brand & Security Value Proposition (Desktop) */}
          <div className="lg:col-span-6 space-y-6 text-left hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-sky-950/80 border border-blue-200 dark:border-sky-800 text-blue-800 dark:text-sky-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              <span>Zero-Trust Enterprise Phishing Defense</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Intelligent Email Security &amp; Workspace Copilot
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                Protect your organization from credential theft, BEC attacks, and malicious payloads with ML-powered threat classification and Gemini intelligence.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-blue-600 dark:text-sky-400 font-bold text-xs">
                  <Shield className="w-4 h-4" />
                  <span>ML-10 Threat Engine</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Scikit-Learn TF-IDF + Heuristic signal analysis scoring 0-100 risk.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini Intelligence</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Executive summaries, action items, and deadline timeline extraction.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>Server Security Gate</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Fail-closed architecture blocking AI replies on malicious emails.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Server className="w-4 h-4" />
                  <span>User Isolation</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  PBKDF2-HMAC-SHA256 password security with SQLite persistence.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Centered Authentication Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-5">
              {/* Card Header */}
              <div className="text-center space-y-1">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-sky-950/60 border border-blue-200 dark:border-sky-800 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto shadow-xs mb-2">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {isRegisterMode ? 'Create SecOps Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isRegisterMode
                    ? 'Register for persistent threat analysis & email management'
                    : 'Sign in to access your secure AI email workspace'}
                </p>
              </div>

              {/* Error Alert Banner */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Login / Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {isRegisterMode && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 absolute left-3 text-slate-400" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Bhargav Mittapalli"
                        required
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Email Field with validation support for all domains */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 absolute left-3 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="user@company.com or user@gmail.com"
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {!isRegisterMode && (
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[11px] text-blue-600 dark:text-sky-400 font-medium hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 absolute left-3 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field in Registration Mode */}
                {isRegisterMode && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 absolute left-3 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="••••••••••••"
                        required
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-sky-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-60 cursor-pointer mt-1"
                >
                  <span>{isSubmitting ? 'Checking your credentials...' : isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                <span className="absolute px-3 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  OR
                </span>
              </div>

              {/* Secondary: Continue with Google Button */}
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                {/* Google G SVG */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Mode Switcher */}
              <div className="pt-3 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">

                {isRegisterMode ? (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(false);
                        setError('');
                      }}
                      className="font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(true);
                        setError('');
                      }}
                      className="font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Create Account
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Google OAuth Modal (Part 6 Requirement: Clean Professional State) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-sky-950 text-blue-600 dark:text-sky-400">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Google Sign-In
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Google Sign-In is not configured for this environment.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Enterprise federated authentication requires Google OAuth 2.0 client credentials configured on the backend server. Please sign in using your enterprise email and password.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal (Part 1 Requirement: Zero Credential Disclosure) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Password Recovery
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Password recovery is not configured for this environment.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                In this enterprise deployment, automated self-service password reset is disabled. Please contact your organization's SecOps administrator to request a credential reset, or sign in using your configured account credentials.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
        AI Email Copilot &copy; 2026 Enterprise Cybersecurity Suite &bull; FastAPI + Scikit-Learn ML Phishing Engine
      </footer>
    </div>
  );
};
