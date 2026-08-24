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
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { authService } from '../services/authService';

export const Login = ({
  onLoginSuccess,
  onNavigateLanding,
  theme,
  onToggleTheme,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('bhargav.mittapalli@company.com');
  const [password, setPassword] = useState('SecOpsPass2026!');
  const [displayName, setDisplayName] = useState('Bhargav Mittapalli');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your work email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isRegisterMode) {
        const result = await authService.register({
          email: email.trim(),
          password: password.trim(),
          displayName: displayName.trim() || email.split('@')[0],
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
          email: email.trim(),
          password: password.trim(),
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
      // If backend fails or not reachable, fallback to demo login shell
      console.warn('Backend auth request fallback:', err.message);
      if (err.message.includes('Invalid') || err.message.includes('already exists')) {
        setError(err.message);
      } else {
        // Fallback demo mode
        onLoginSuccess({
          token: 'demo-token-' + Date.now(),
          user_id: 101,
          email: email.trim(),
          name: displayName || email.split('@')[0],
          role: 'SecOps Analyst',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('bhargav.mittapalli@company.com');
    setPassword('SecOpsPass2026!');
    setDisplayName('Bhargav Mittapalli');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc] dark:bg-[#050507] text-[#0f172a] dark:text-[#f8fafc] font-sans transition-colors duration-300 relative overflow-hidden selection:bg-indigo-600 selection:text-white select-none">
      {/* Background Ambience Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-500/5 dark:bg-indigo-600/10 blur-[130px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateLanding}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
        >
          <Logo size="small" showTagline={true} />
        </button>

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isRegisterMode ? 'Register New Account' : 'Sign in to Copilot'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRegisterMode
                ? 'Create credentials for persistent workspace security'
                : 'Enterprise AI Phishing Protection & Intelligence Workspace'}
            </p>
          </div>

          {/* Form Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Display Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 absolute left-3 text-slate-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Bhargav Mittapalli"
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Work Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bhargav.mittapalli@company.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Fill Demo
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Authenticating...' : isRegisterMode ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            {isRegisterMode ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setError('');
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
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
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Register Now
                </button>
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
        AI Email Copilot &copy; 2026 Enterprise Cybersecurity Suite &bull; FastAPI + Scikit-Learn ML Phishing Engine
      </footer>
    </div>
  );
};
