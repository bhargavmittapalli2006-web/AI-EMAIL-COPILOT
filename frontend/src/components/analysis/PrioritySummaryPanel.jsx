import React from 'react';
import {
  Zap,
  BrainCircuit,
  Clock,
  Tag,
  Sparkles,
  CheckCircle,
  FileText,
  Briefcase,
  Smile,
} from 'lucide-react';
import { PriorityBadge } from '../common/Badge';

export const PrioritySummaryPanel = ({
  priorityAnalysis = {},
  understanding = {},
}) => {
  const {
    priority_score = 50,
    priority_level = 'MEDIUM',
    urgency = 'NORMAL',
    category = 'General Communication',
    deadline,
  } = priorityAnalysis;

  const {
    tldr = [],
    intent = 'General Inquiry',
    key_entities = [],
    sentiment = 'Neutral',
  } = understanding;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Priority Engine Card */}
      <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-cyber-850/70 glass-panel p-5 space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                  Priority Engine
                </h3>
                <p className="text-xs text-slate-400">Urgency & Triage Index</p>
              </div>
            </div>
            <PriorityBadge level={priority_level} size="md" />
          </div>

          <div className="my-4 flex items-center justify-between p-3.5 rounded-xl bg-cyber-900/80 border border-white/5">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
                Priority Score
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-mono font-extrabold text-indigo-400">
                  {priority_score}
                </span>
                <span className="text-xs text-slate-500 font-mono">/100</span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                Urgency Level
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                  urgency === 'URGENT'
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                }`}
              >
                {urgency}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-cyber-900/50 border border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                Category
              </span>
              <span className="font-semibold text-slate-200 truncate max-w-[180px]">
                {category}
              </span>
            </div>

            {deadline && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-cyber-900/50 border border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Detected Deadline
                </span>
                <span className="font-semibold text-amber-300 truncate max-w-[180px]">
                  {deadline}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Calculated via NLP urgency, relationship & deadline extraction</span>
        </div>
      </div>

      {/* Understanding Engine Summary Card */}
      <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-cyber-850/70 glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                Email Understanding & Summary
              </h3>
              <p className="text-xs text-slate-400">
                AI Extracted Highlights & Intent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-cyber-900 border border-white/5 text-slate-300">
            <Smile className="w-3.5 h-3.5 text-cyan-400" />
            <span>{sentiment}</span>
          </div>
        </div>

        {/* Intent Badge */}
        <div className="p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center gap-2 text-xs">
          <span className="font-mono text-slate-400 uppercase text-[10px]">Detected Intent:</span>
          <span className="font-semibold text-cyan-300 font-sans">{intent}</span>
        </div>

        {/* TL;DR Bullet points */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Executive Summary (TL;DR)
          </h4>
          <div className="space-y-1.5">
            {tldr.map((point, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-cyber-900/60 border border-white/5 flex items-start gap-2.5 text-xs text-slate-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed font-sans">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Entities */}
        {key_entities.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
              Extracted Entities & Metadata
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {key_entities.map((ent, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-cyber-900 border border-white/10 text-xs flex items-center gap-1.5 font-mono"
                >
                  <span className="text-slate-400 text-[10px]">{ent.label}:</span>
                  <span className="font-semibold text-indigo-300">{ent.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
