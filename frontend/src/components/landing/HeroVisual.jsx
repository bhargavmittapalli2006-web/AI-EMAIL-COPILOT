import React from 'react';
import {
  Mail,
  Zap,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  Lock,
} from 'lucide-react';

export const HeroVisual = ({ prefersReducedMotion = false }) => {
  return (
    <div className="relative w-full max-w-lg mx-auto flex items-center justify-center py-8">
      {/* Subtle Orbital & Connection Circles */}
      <div className="absolute w-72 h-72 rounded-full border border-indigo-500/15 dark:border-indigo-500/20 pointer-events-none" />
      <div className="absolute w-[360px] h-[360px] rounded-full border border-slate-300/40 dark:border-white/10 pointer-events-none hidden sm:block" />
      <div className="absolute w-[440px] h-[440px] rounded-full border border-slate-300/20 dark:border-white/5 pointer-events-none hidden md:block" />

      {/* Central Visual Stack Container */}
      <div className="relative z-10 w-full space-y-3.5">
        {/* Central Envelope & AI Core Hub */}
        <div className="p-4 rounded-2xl bg-white/95 dark:bg-[#0D1220]/95 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between text-xs backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm relative overflow-hidden flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              {/* Subtle AI Spark in corner */}
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-300" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white">AI Autonomous Copilot</span>
                <span className="px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[9px] font-bold">
                  AI
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                Real-Time Prioritization & Threat Defense
              </div>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800/60">
            PROTECTED
          </span>
        </div>

        {/* 4 Connected Information Cards */}
        {/* CARD 1: HIGH PRIORITY */}
        <div className="p-3.5 rounded-xl bg-white/95 dark:bg-[#0D1220]/95 border border-amber-300/70 dark:border-amber-500/30 shadow-sm flex items-center justify-between text-xs transition-transform duration-200 hover:translate-x-1 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="font-semibold text-slate-900 dark:text-white truncate">Meeting with CEO</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Today at 10:00 AM • Urgency 96</div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 whitespace-nowrap">
            HIGH PRIORITY
          </span>
        </div>

        {/* CARD 2: THREAT DETECTED */}
        <div className="p-3.5 rounded-xl bg-white/95 dark:bg-[#0D1220]/95 border border-rose-300/70 dark:border-rose-500/30 shadow-sm flex items-center justify-between text-xs transition-transform duration-200 hover:translate-x-1 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="font-semibold text-slate-900 dark:text-white truncate">Phishing attempt blocked</div>
              <div className="text-[11px] text-rose-600 dark:text-rose-400 font-mono">Risk Score: 92/100 • Quarantined</div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 whitespace-nowrap">
            THREAT DETECTED
          </span>
        </div>

        {/* CARD 3: ACTION REQUIRED */}
        <div className="p-3.5 rounded-xl bg-white/95 dark:bg-[#0D1220]/95 border border-emerald-300/70 dark:border-emerald-500/30 shadow-sm flex items-center justify-between text-xs transition-transform duration-200 hover:translate-x-1 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="font-semibold text-slate-900 dark:text-white truncate">Review proposal</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Due: Tomorrow • Task Created</div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 whitespace-nowrap">
            ACTION REQUIRED
          </span>
        </div>

        {/* CARD 4: AI SUMMARY */}
        <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/60 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <div className="truncate text-[11px]">
            <strong>AI SUMMARY:</strong> "Q2 budget planning and key updates."
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroVisual;
