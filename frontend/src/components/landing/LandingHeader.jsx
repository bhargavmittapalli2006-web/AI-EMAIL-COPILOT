import React, { useState } from 'react';
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react';
import { Logo } from '../branding/Logo';
import { ThemeToggle } from '../common/ThemeToggle';

export const LandingHeader = ({
  isScrolled,
  theme,
  onToggleTheme,
  onNavigateLogin,
  onGetStarted,
  onScrollToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Product', id: 'features' },
    { label: 'Security', id: 'security-section' },
    { label: 'How It Works', id: 'pipeline' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Docs', id: 'docs' },
  ];

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    if (onScrollToSection) {
      onScrollToSection(id);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-3.5 bg-white/85 dark:bg-[#070B14]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity text-left"
          >
            <Logo size="small" showTagline={true} />
          </button>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-600 dark:text-slate-400">
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => handleNavClick(link.id)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right: Theme Toggle, Sign In, Get Started */}
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <button
            type="button"
            onClick={onNavigateLogin}
            className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={onGetStarted || onNavigateLogin}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition-all cursor-pointer transform active:scale-98"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0B1020] border-b border-slate-200 dark:border-slate-800 px-6 py-5 space-y-4 shadow-lg animate-fade-in">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-700 dark:text-slate-300">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className="text-left py-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateLogin();
              }}
              className="w-full py-2 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onGetStarted) onGetStarted();
                else onNavigateLogin();
              }}
              className="w-full py-2 text-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
