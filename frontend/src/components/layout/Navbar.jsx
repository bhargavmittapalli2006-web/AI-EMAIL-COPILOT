import React from 'react';
import {
  Shield,
  Zap,
  BrainCircuit,
  Bot,
  PlusCircle,
  RotateCcw,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

export const Navbar = ({
  onOpenScanModal,
  onResetData,
  isMockMode,
  onToggleMockMode,
  totalEmails = 0,
  threatCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-cyber-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-glow-cyan flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  AI Email Copilot
                </h1>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  CYBER DEFENSE v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Multi-Engine Threat Intelligence & Inbox Automation
              </p>
            </div>
          </div>

          {/* AI Engine Real-time Status Chips */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyber-850 border border-emerald-500/30 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <Shield className="w-3.5 h-3.5" />
              <span>Phishing Engine</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyber-850 border border-indigo-500/30 text-indigo-300">
              <Zap className="w-3.5 h-3.5" />
              <span>Priority</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyber-850 border border-cyan-500/30 text-cyan-300">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Understanding</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyber-850 border border-purple-500/30 text-purple-300">
              <Bot className="w-3.5 h-3.5" />
              <span>Action</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {/* Scan Custom Email Modal Trigger */}
            <button
              onClick={onOpenScanModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-cyan transition-all cursor-pointer transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Scan Custom Email</span>
              <span className="sm:hidden">Scan</span>
            </button>

            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              title="Reset inbox to default mock scenarios"
              className="p-2 rounded-lg bg-cyber-800/80 hover:bg-cyber-700 text-slate-300 hover:text-white border border-white/10 text-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
