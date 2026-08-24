import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const Login = ({
  onLoginSuccess,
  onNavigateLanding,
  theme,
  onToggleTheme,
}) => {
  const [email, setEmail] = useState('alex.morgan@company.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
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

    // Simulate instant authentic login
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        email: email.trim(),
        name: email.split('@')[0].replace(/[._-]/g, ' '),
        role: 'SecOps Analyst',
      });
    }, 350);
  };

  const handleGoogleLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        email: 'alex.morgan@company.internal',
        name: 'Alex Morgan',
        role: 'SecOps Lead',
      });
    }, 350);
  };

  const handleFillDemo = () => {
    setEmail('alex.morgan@company.internal');
    setPassword('DemoSecPass2026!');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc] dark:bg-[#050507] text-[#0f172a] dark:text-[#f8fafc] font-sans transition-colors duration-300 relative overflow-hidden selection:bg-indigo-600 selection:text-white">
      {/* Background Ambience Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Radial Center Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-500/5 dark:bg-indigo-600/10 blur-[130px] rounded-full" />
        
        {/* Subtle geometric dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Top Bar with Brand Link & Theme Toggle */}
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

      {/* Centered Compact Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[420px] rounded-[24px] bg-white/90 dark:bg-white/[0.045] border border-slate-200/80 dark:border-white/[0.09] backdrop-blur-[20px] p-6 sm:p-8 shadow-sm space-y-6">
          {/* Card Top: Medium Logo & Welcome Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <Logo size="medium" showText={false} />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in to your intelligent inbox.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Work Email */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="login-email"
                className="block font-medium text-slate-700 dark:text-slate-300"
              >
                Work email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:bg-white dark:focus:bg-white/[0.08] focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 text-xs transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block font-medium text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                >
                  Auto-fill demo
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:bg-white dark:focus:bg-white/[0.08] focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 text-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-white/10 w-full" />
            <span className="bg-white dark:bg-[#050507] px-3 text-[11px] text-slate-400 uppercase font-medium">
              or
            </span>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-sm"
          >
            {/* Google SVG Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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

          {/* Bottom Link: Get Started */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            <span>Don't have an account? </span>
            <button
              type="button"
              onClick={onNavigateLanding}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer ml-1"
            >
              Get Started
            </button>
          </div>
        </div>
      </main>

      {/* Security Disclaimer Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-[11px] text-slate-400 dark:text-slate-500 font-sans">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          SOC-2 compliant end-to-end encrypted inbox intelligence
        </span>
      </footer>
    </div>
  );
};

export default Login;
