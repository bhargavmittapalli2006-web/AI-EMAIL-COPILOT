import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Briefcase,
  Smile,
  Zap,
  Copy,
  Check,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Lock,
  Send,
  CornerUpLeft,
} from 'lucide-react';
import { Badge } from '../common/Badge';

/**
 * Classical Gmail-style AI Reply Suggestions Panel (ML-12)
 * Renders 3 clean draft suggestions for safe emails or a security block card for threats.
 */
export function ReplySuggestionsPanel({
  replyState = {},
  analysisState = {},
  onRetry,
}) {
  const status = replyState.status || 'idle';
  const data = replyState.data || null;

  // Track copied state for each tone: 'professional' | 'friendly' | 'concise'
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = async (key, text) => {
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // 1. Loading State
  if (status === 'loading') {
    return (
      <div className="p-5 mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300 font-bold">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-sky-400" />
          <span>Generating AI Reply Suggestions...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-pulse">
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (status === 'error') {
    return (
      <div className="p-4 mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 text-xs shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <CornerUpLeft className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                AI Reply Suggestions Temporarily Unavailable
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {replyState.error || 'Failed to retrieve reply suggestions from backend microservice.'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Idle State
  if (status === 'idle' || !data) {
    return null;
  }

  // 4. Security Blocked State (Phishing / Threat / Gated)
  if (!data.reply_allowed) {
    return (
      <div className="p-4 mb-6 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/25 text-xs shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-700 dark:text-rose-300 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-slate-900 dark:text-white">
                Reply Suggestions Blocked for Your Protection
              </span>
              <Badge variant="critical" size="xs">
                Security Gate
              </Badge>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {data.reason ||
                'This message was identified as a security threat. Automated reply generation has been disabled to prevent accidental exposure of sensitive credentials.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 5. Safe State: 3 Contextual Reply Options
  const replyOptions = [
    {
      key: 'professional',
      title: 'Professional',
      icon: Briefcase,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      badgeColor: 'primary',
      text: data.professional_reply,
    },
    {
      key: 'friendly',
      title: 'Friendly',
      icon: Smile,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      badgeColor: 'safe',
      text: data.friendly_reply,
    },
    {
      key: 'concise',
      title: 'Concise',
      icon: Zap,
      iconColor: 'text-sky-600 dark:text-sky-400',
      badgeColor: 'neutral',
      text: data.concise_reply,
    },
  ].filter((opt) => Boolean(opt.text));

  if (replyOptions.length === 0) {
    return null;
  }

  return (
    <div className="p-5 mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs shadow-sm select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 dark:bg-sky-500 flex items-center justify-center text-white shadow-xs">
            <CornerUpLeft className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            AI Reply Suggestions
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-sky-950 text-blue-800 dark:text-sky-300">
            ML-12
          </span>
        </div>

        <span className="text-[11px] text-slate-400">
          Click copy to draft your response
        </span>
      </div>

      {/* Cautionary note if present (e.g. for medium risk) */}
      {data.reason && (
        <div className="flex items-center gap-2 p-2.5 mb-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{data.reason}</span>
        </div>
      )}

      {/* 3 Tone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {replyOptions.map((opt) => {
          const Icon = opt.icon;
          const isCopied = copiedKey === opt.key;

          return (
            <div
              key={opt.key}
              className="flex flex-col justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-blue-300 dark:hover:border-sky-700 transition-all duration-150"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Icon className={`w-3.5 h-3.5 ${opt.iconColor}`} />
                    <span>{opt.title}</span>
                  </div>
                  <Badge variant={opt.badgeColor} size="xs">
                    {opt.title}
                  </Badge>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal select-text mb-3">
                  "{opt.text}"
                </p>
              </div>

              {/* Copy Button */}
              <button
                type="button"
                onClick={() => handleCopy(opt.key, opt.text)}
                className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-medium text-xs shadow-xs transition-colors ${
                  isCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Draft</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
