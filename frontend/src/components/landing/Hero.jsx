import React from 'react';
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { HeroVisual } from './HeroVisual';

export const Hero = ({
  onNavigateLogin,
  onGetStarted,
  onOpenDemo,
  prefersReducedMotion = false,
}) => {
  return (
    <section className="min-h-[92vh] pt-28 pb-16 flex items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
        {/* Left Column: Headlines & Action CTAs */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Small Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            <span>AI-POWERED • EMAIL SECURITY • SMART PRODUCTIVITY</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Intelligent Inbox. <br />
            <span className="bg-gradient-to-r from-indigo-600 to-sky-600 dark:from-indigo-400 dark:to-sky-400 bg-clip-text text-transparent">
              Safer Decisions.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl">
            AI Email Copilot understands your emails, prioritizes what matters, detects threats, and helps you take action.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={onGetStarted || onNavigateLogin}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer transform active:scale-98"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenDemo}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#0B1020] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full border border-current" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Trust Indicators Under CTA */}
          <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              AI-Powered
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Secure by Design
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-sky-500" />
              Real-Time Protection
            </span>
          </div>
        </div>

        {/* Right Column: Hero Visual */}
        <div className="lg:col-span-6">
          <HeroVisual prefersReducedMotion={prefersReducedMotion} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
