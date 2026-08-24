import React from 'react';
import {
  X,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  CornerUpLeft,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

/**
 * Help & Documentation Modal explaining ML-10, ML-11 & ML-12 AI Email Copilot modules
 */
export function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-xs text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-sky-950 text-blue-600 dark:text-sky-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Help & Security Architecture Guide
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Understanding ML-10 Scanner, Gemini Intelligence & Security Gate Rules
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close help"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guide Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* ML-10 Section */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>ML-10 Phishing Threat Engine</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Every incoming email is evaluated by the authoritative TF-IDF + Logistic Regression model. It scores email body text, inspects raw IP URLs, shorteners, and checks for sender-to-reply-to header spoofing to calculate a risk score from 0 (Safe) to 100 (Severe Threat).
            </p>
          </div>

          {/* ML-11 Section */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span>ML-11 Gemini Email Intelligence</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Generates executive summaries, prioritized action items, and key takeaways for legitimate messages. For threat emails, the engine restricts live LLM behavior and presents protective quarantine guidance.
            </p>
          </div>

          {/* ML-12 Section */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <CornerUpLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>ML-12 AI Reply Suggestions & Security Gate</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Generates 3 contextual response options (Professional, Friendly, Concise) for safe emails. High-risk and phishing messages trigger the server-side Security Gate, which strictly blocks automated reply generation to prevent credential leakage.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
