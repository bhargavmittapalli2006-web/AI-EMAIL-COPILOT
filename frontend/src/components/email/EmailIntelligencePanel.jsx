import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Loader2,
  ListTodo,
  FileText,
  Lightbulb,
  Shield,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Badge } from '../common/Badge';

/**
 * Classical Gemini Email Intelligence Panel (ML-11)
 * Restrained, high-contrast, Gmail-inspired AI insights view
 */
export function EmailIntelligencePanel({
  intelligenceState = {},
  analysisState = {},
  onRetry,
}) {
  const status = intelligenceState.status || 'idle';
  const data = intelligenceState.data || null;
  const isThreat =
    analysisState?.data?.is_phishing ||
    analysisState?.data?.risk_level === 'CRITICAL' ||
    analysisState?.data?.risk_level === 'HIGH';

  const [completedActions, setCompletedActions] = React.useState({});

  const toggleActionItem = (idx) => {
    setCompletedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // 1. Loading State
  if (status === 'loading') {
    return (
      <div className="p-5 mb-6 rounded-2xl border border-blue-200/80 dark:border-sky-900/60 bg-blue-50/40 dark:bg-slate-850 text-xs shadow-sm">
        <div className="flex items-center gap-2.5 mb-3 text-blue-700 dark:text-sky-400 font-bold">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating AI Email Intelligence...</span>
        </div>
        <div className="space-y-2.5 animate-pulse">
          <div className="h-3.5 bg-blue-200/60 dark:bg-slate-750 rounded-md w-3/4" />
          <div className="h-3.5 bg-blue-200/40 dark:bg-slate-750 rounded-md w-full" />
          <div className="h-3.5 bg-blue-200/40 dark:bg-slate-750 rounded-md w-5/6" />
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
            <Sparkles className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                AI Email Intelligence Temporarily Unavailable
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {intelligenceState.error || 'Could not retrieve Gemini intelligence from backend microservice.'}
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

  // 4. Completed Intelligence View
  return (
    <div
      className={`p-5 mb-6 rounded-2xl border text-xs shadow-sm transition-colors ${
        isThreat
          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40'
          : 'bg-gradient-to-b from-blue-50/40 to-slate-50/30 dark:from-slate-850 dark:to-slate-900 border-blue-200/70 dark:border-slate-750'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 dark:bg-sky-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            Gemini Email Intelligence
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-sky-950 text-blue-800 dark:text-sky-300">
            ML-11
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isThreat ? (
            <Badge variant="critical" size="xs">
              Threat Gated
            </Badge>
          ) : (
            <Badge variant="primary" size="xs">
              Verified Analysis
            </Badge>
          )}
        </div>
      </div>

      {/* 1. Executive Summary */}
      {data.summary && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold mb-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>Executive Summary</span>
          </div>
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            {data.summary}
          </p>
        </div>
      )}

      {/* 2. Key Points / Highlights */}
      {data.key_points && data.key_points.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold mb-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Key Takeaways</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.key_points.map((point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-sky-400 mt-1.5 shrink-0" />
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Prioritized Action Items */}
      {data.action_items && data.action_items.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
              <ListTodo className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Prioritized Action Items</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {data.action_items.length} tasks detected
            </span>
          </div>

          <div className="space-y-1.5">
            {data.action_items.map((item, idx) => {
              const isDone = completedActions[idx] || false;
              const priority = item.priority || 'medium';

              return (
                <div
                  key={idx}
                  onClick={() => toggleActionItem(idx)}
                  className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-colors ${
                    isDone
                      ? 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 line-through'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200/70 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-300 dark:hover:border-sky-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      aria-label="Toggle task"
                      className="text-slate-400 hover:text-blue-600 dark:hover:text-sky-400"
                    >
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <span className="truncate leading-snug">{item.text}</span>
                  </div>

                  <Badge
                    variant={
                      priority === 'high'
                        ? 'critical'
                        : priority === 'medium'
                        ? 'caution'
                        : 'neutral'
                    }
                    size="xs"
                    className="shrink-0 uppercase tracking-wider text-[9px]"
                  >
                    {priority}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Risk Explanation & Protective Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {data.risk_explanation && (
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
              <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              <span>Security Assessment Explanation</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {data.risk_explanation}
            </p>
          </div>
        )}

        {data.recommended_actions && data.recommended_actions.length > 0 && (
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Recommended Actions</span>
            </div>
            <ul className="space-y-1">
              {data.recommended_actions.map((act, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span className="leading-snug">{act}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
