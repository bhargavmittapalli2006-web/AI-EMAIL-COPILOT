import React, { useState, useEffect } from 'react';
import {
  Zap,
  ShieldCheck,
  CheckSquare,
  Clock,
  ArrowRight,
  ChevronRight,
  Play,
  X,
  Lock,
  Mail,
  Sparkles,
} from 'lucide-react';
import { Logo } from '../components/branding/Logo';
import { LandingHeader } from '../components/landing/LandingHeader';
import { Hero } from '../components/landing/Hero';
import { FeatureCard } from '../components/landing/FeatureCard';
import { TrustIndicators } from '../components/landing/TrustIndicators';

export const Landing = ({
  onNavigateLogin,
  onGetStarted,
  theme,
  onToggleTheme,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } catch {
      // ignore
    }
  }, []);

  // Track global scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  const featureList = [
    {
      icon: Zap,
      title: 'AI Prioritization',
      description: 'Ranks emails by urgency and importance so you never miss what matters.',
      accentColor: 'indigo',
      sectionId: 'features',
    },
    {
      icon: ShieldCheck,
      title: 'Phishing Detection',
      description: 'Identifies suspicious senders, links, and malicious content in real time.',
      accentColor: 'rose',
      sectionId: 'security-section',
    },
    {
      icon: CheckSquare,
      title: 'Action Extraction',
      description: 'Automatically extracts tasks, follow-ups, and important actions from emails.',
      accentColor: 'emerald',
      sectionId: 'pipeline',
    },
    {
      icon: Clock,
      title: 'Deadline Tracking',
      description: 'Detects deadlines and reminds you before you run out of time.',
      accentColor: 'sky',
      sectionId: 'pipeline',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] dark:bg-[#070B14] text-[#0f172a] dark:text-[#f8fafc] font-sans transition-colors duration-300 relative selection:bg-indigo-600 selection:text-white overflow-x-hidden">
      {/* ============================================================ */}
      {/* BACKGROUND: Subtle, Deep Navy/Charcoal & Barely-Visible Grid */}
      {/* ============================================================ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Atmospheric Lighting Nodes */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-indigo-600/[0.04] dark:bg-indigo-600/[0.06] blur-[140px] rounded-full" />
        <div className="absolute top-[45%] right-[-10%] w-[600px] h-[500px] bg-sky-600/[0.02] dark:bg-sky-600/[0.03] blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[500px] bg-indigo-900/[0.03] dark:bg-indigo-900/[0.05] blur-[130px] rounded-full" />

        {/* Barely-Visible Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* HEADER COMPONENT */}
      {/* ============================================================ */}
      <LandingHeader
        isScrolled={isScrolled}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onNavigateLogin={onNavigateLogin}
        onGetStarted={onGetStarted}
        onScrollToSection={scrollToSection}
      />

      {/* ============================================================ */}
      {/* MAIN VIEWPORT CONTENT */}
      {/* ============================================================ */}
      <main className="relative z-10 flex-1">
        {/* 1. HERO SECTION */}
        <Hero
          onNavigateLogin={onNavigateLogin}
          onGetStarted={onGetStarted}
          onOpenDemo={() => setIsDemoModalOpen(true)}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* 2. FOUR FEATURE CARDS SECTION */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-[#0B1020]/40">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                Core Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Intelligent email triage from ingest to execution.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featureList.map((card, idx) => (
                <FeatureCard
                  key={idx}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  accentColor={card.accentColor}
                  onLearnMore={() => scrollToSection(card.sectionId)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 3. SECURITY SHIELD SECTION */}
        <section id="security-section" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/80">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Security Shield Inspection Card */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-rose-600" />
                  <span className="font-bold text-slate-900 dark:text-white">Security Shield Deep Inspection</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold font-mono text-[10px]">
                  THREAT DETECTED (92/100)
                </span>
              </div>

              {/* Sample Email Preview */}
              <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-rose-900 dark:text-rose-200">
                  <span>From: accounts-security@paypal-verify-update.co</span>
                  <span className="text-[10px] font-mono">SPF SoftFail</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  "Your account access will be terminated within 24 hours. Click below to verify credentials."
                </p>
              </div>

              {/* 4 Multi-vector Signals Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">SENDER DOMAIN</span>
                  <div className="font-mono font-bold text-rose-600 dark:text-rose-400">91% • Lookalike Spoof</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">LINK DESTINATION</span>
                  <div className="font-mono font-bold text-rose-600 dark:text-rose-400">94% • Obfuscated IP</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">LANGUAGE COERCION</span>
                  <div className="font-mono font-bold text-amber-600 dark:text-amber-400">87% • False Urgency</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">ML CONFIDENCE</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">96% Certainty</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-[#070B14] text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Automated Action: Deceptive URLs neutralized & quarantined.</span>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>

            {/* Right Column: Narrative */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-xs font-mono font-bold tracking-widest text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Enterprise Phishing Defense
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Not every email is what it seems.
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Detect suspicious emails before they become problems. The Security Shield analyzes sender authentication, URL redirect hops, and social engineering coercion.
              </p>

              <div className="pt-2 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Real-time SPF, DKIM, and DMARC inspection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Direct IP & shortener URL de-cloaking</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>1-click threat quarantine & isolation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS PIPELINE */}
        <section id="pipeline" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-[#0B1020]/40">
          <div className="max-w-5xl mx-auto space-y-12 text-center">
            <div className="space-y-2 max-w-2xl mx-auto">
              <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                Unified Architecture
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                How AI Email Copilot Works
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono font-bold text-xs">
                  01
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Ingest</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  Real-time synchronization across enterprise mail servers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                  02
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Score & Triage</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  FastAPI neural weights evaluate importance & urgency score.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-mono font-bold text-xs">
                  03
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Shield & Defend</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  Multi-vector heuristic and ML classifier blocks deceptive links.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                  04
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Execute</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  Action extraction and tone-calibrated suggested replies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. TRUST & SECURITY SECTION */}
        <TrustIndicators />

        {/* 6. FINAL CTA SECTION */}
        <section className="py-24 sm:py-32 px-4 border-t border-slate-200 dark:border-slate-800/80 text-center bg-slate-100/50 dark:bg-[#0B1020]/40">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-center">
              <Logo size="large" showText={false} />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                Email Productivity • AI Intelligence • Phishing Protection
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Your inbox. <br />
                <span className="text-indigo-600 dark:text-indigo-400">
                  Under control.
                </span>
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Experience the enterprise standard for intelligent email prioritization and phishing defense.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onGetStarted || onNavigateLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer transform active:scale-98"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white dark:bg-[#070B14] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold shadow-sm transition-all cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* MINIMAL FOOTER */}
      {/* ============================================================ */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 dark:border-slate-800/80 py-8 px-4 sm:px-8 text-xs text-slate-400 dark:text-slate-500 font-sans bg-white dark:bg-[#070B14]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="small" showTagline={false} />
            <span className="text-slate-400">• Intelligent Inbox Security</span>
          </div>

          <div className="flex items-center gap-6">
            <span>SOC-2 Type II Certified</span>
            <span>256-bit AES Encryption</span>
            <span>FastAPI ML Powered</span>
          </div>

          <div>
            <span>© 2026 AI Email Copilot. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* INTERACTIVE DEMO PREVIEW MODAL ("Watch Demo") */}
      {/* ============================================================ */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Interactive Product Demo Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Interactive Walkthrough */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>SIMULATED WORKSPACE DEMO</span>
                <span className="text-emerald-500 font-semibold">● LIVE THREAT SHIELD</span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Step 1: Automated Email Ingest & Neural Triage
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[10px]">
                    Priority 96
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  The FastAPI engine analyzes email urgency, extracts action items, and evaluates sender SPF/DKIM authentication headers.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Step 2: Phishing Mitigation & Action Extraction
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-mono text-[10px]">
                    Threat Quarantined
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Deceptive links are disabled, action deadlines are added to your task tracker, and suggested replies are drafted.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDemoModalOpen(false);
                  if (onGetStarted) onGetStarted();
                  else onNavigateLogin();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <span>Launch Full App</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
