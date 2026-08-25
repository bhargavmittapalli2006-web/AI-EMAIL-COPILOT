import React, { useState, useMemo } from 'react';
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
  Calendar,
  Bell,
  Check,
} from 'lucide-react';
import { Badge } from '../common/Badge';

/**
 * Parses authentic temporal references and explicit deadlines from email intelligence text.
 * Never fabricates or hallucinates dates. Returns empty list for vague expressions (e.g. "soon").
 */
export function extractTimelineEvents(intelligence, emailBody = '') {
  if (!intelligence) return [];

  const candidateTexts = [
    ...(intelligence.action_items || []).map((a) => (typeof a === 'string' ? a : a.text)),
    ...(intelligence.key_points || []),
    ...(intelligence.recommended_actions || []),
  ];

  // Specific, explicit date & time patterns only
  const explicitPatterns = [
    // Month + Day + optional Time (e.g., "August 28 at 10 AM", "Aug 24, 2026", "Sept 15 at 3:00 PM PST")
    {
      regex: /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?(?:\s+(?:at|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?(?:\s+[A-Z]{3,4})?)?\b/i,
      formatter: (m) => m[0].trim(),
    },
    // Explicit Weekday + optional Time (e.g., "Tuesday at 10:00 AM PST", "by Friday at 5 PM")
    {
      regex: /\b(?:by|on|this|next)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+(?:at|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?(?:\s+[A-Z]{3,4})?)?\b/i,
      formatter: (m) => m[0].trim().toUpperCase(),
    },
    // Explicit Relative Day with Time (e.g., "tomorrow at 10:00 AM", "today by 5:00 PM")
    {
      regex: /\b(tomorrow|today|tonight)(?:\s+(?:at|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?(?:\s+[A-Z]{3,4})?)?\b/i,
      formatter: (m) => m[0].trim().toUpperCase(),
    },
    // Explicit Hour/Day interval deadline (e.g., "within 24 hours", "within 2 days", "within 48 hours")
    {
      regex: /\bwithin\s+\d+\s+(?:hours|days|business\s+days)\b/i,
      formatter: (m) => m[0].trim().toUpperCase(),
    },
    // Exact Clock Time with optional Timezone (e.g., "10:00 AM PST", "5:30 PM EST")
    {
      regex: /\b\d{1,2}:\d{2}\s*(?:am|pm)(?:\s+[a-z]{3,4})?\b/i,
      formatter: (m) => m[0].trim().toUpperCase(),
    },
  ];

  const events = [];
  const seenTexts = new Set();

  for (const text of candidateTexts) {
    if (!text || seenTexts.has(text)) continue;

    for (const pattern of explicitPatterns) {
      const match = text.match(pattern.regex);
      if (match) {
        seenTexts.add(text);
        const timeLabel = pattern.formatter(match);

        // Determine priority from text or matched action item
        let priority = 'medium';
        if (/\b(urgent|immediate|critical|required|suspension|within\s+(?:24|12|48)\s+hours)\b/i.test(text)) {
          priority = 'high';
        } else if (/\b(optional|when possible|routine|fyi|discussion)\b/i.test(text)) {
          priority = 'low';
        }

        // Clean action text without repeating the extracted time phrase if prefixed
        const cleanText = text
          .replace(pattern.regex, '')
          .trim()
          .replace(/^[\s:\-\u2022]+/, '') || text;

        events.push({
          timeLabel,
          text: cleanText,
          fullText: text,
          priority,
        });
        break;
      }
    }
  }

  return events;
}

/**
 * Classical Gemini Email Intelligence Panel (ML-11)
 * Enhanced with Timeline & Deadlines, Action Items, and Database Reminder Synchronization.
 */
export function EmailIntelligencePanel({
  intelligenceState = {},
  analysisState = {},
  email = {},
  persistedReminders = [],
  onRetry,
  onSetReminder,
}) {
  const status = intelligenceState.status || 'idle';
  const data = intelligenceState.data || null;
  const isThreat =
    analysisState?.data?.is_phishing ||
    analysisState?.data?.risk_level === 'CRITICAL' ||
    analysisState?.data?.risk_level === 'HIGH';

  const [completedActions, setCompletedActions] = useState({});

  const toggleActionItem = (idx) => {
    setCompletedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Derive authentic timeline events
  const timelineEvents = useMemo(() => {
    return extractTimelineEvents(data, email?.body || '');
  }, [data, email?.body]);

  // Helper to check if a task or timeline item already has a persisted reminder
  const isReminderSet = (title, timeLabel) => {
    if (!Array.isArray(persistedReminders)) return false;
    return persistedReminders.some(
      (r) =>
        r.email_id === email.id &&
        (r.title === title || (timeLabel && r.due_at === timeLabel))
    );
  };

  const handleReminderClick = (title, timeLabel, priority = 'medium') => {
    if (onSetReminder) {
      onSetReminder({
        email_id: email.id,
        title: title || email.subject || 'Follow-up Task',
        description: `Action item from email "${email.subject || 'Message'}"`,
        due_at: timeLabel || 'Scheduled',
        priority: priority,
      });
    }
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition-colors shrink-0 cursor-pointer"
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
              const priority = (typeof item === 'object' ? item.priority : 'medium') || 'medium';
              const text = typeof item === 'object' ? item.text : item;
              const hasReminder = isReminderSet(text);

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-colors select-none ${
                    isDone
                      ? 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 line-through'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200/70 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-300 dark:hover:border-sky-800'
                  }`}
                >
                  <div
                    onClick={() => toggleActionItem(idx)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  >
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
                    <span className="truncate leading-snug">{text}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReminderClick(text, 'Upcoming', priority);
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                        hasReminder
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-sky-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400'
                      }`}
                    >
                      {hasReminder ? <Check className="w-3 h-3 text-emerald-500" /> : <Bell className="w-3 h-3" />}
                      <span>{hasReminder ? 'Reminder set' : 'Remind me'}</span>
                    </button>

                    <Badge
                      variant={
                        priority === 'high'
                          ? 'critical'
                          : priority === 'medium'
                          ? 'caution'
                          : 'neutral'
                      }
                      size="xs"
                      className="uppercase tracking-wider text-[9px]"
                    >
                      {priority}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Timeline & Deadlines Section (Phase 20 Safe Extraction) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Timeline &amp; Deadlines</span>
          </div>
        </div>

        {timelineEvents.length === 0 ? (
          <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] italic">
            No specific deadline detected.
          </div>
        ) : (
          <div className="space-y-2 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            {timelineEvents.map((evt, idx) => {
              const hasReminder = isReminderSet(evt.text, evt.timeLabel);

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-50/80 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-750"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold text-[10px] uppercase tracking-wider shrink-0">
                      {evt.timeLabel}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 leading-snug truncate">
                      {evt.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        evt.priority === 'high'
                          ? 'critical'
                          : evt.priority === 'medium'
                          ? 'caution'
                          : 'neutral'
                      }
                      size="xs"
                      className="uppercase tracking-wider text-[9px]"
                    >
                      {evt.priority}
                    </Badge>

                    <button
                      type="button"
                      onClick={() => handleReminderClick(evt.text, evt.timeLabel, evt.priority)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                        hasReminder
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-sky-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {hasReminder ? <Check className="w-3 h-3 text-emerald-500" /> : <Clock className="w-3 h-3" />}
                      <span>{hasReminder ? 'Reminder set' : 'Set reminder'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Risk Explanation & Protective Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
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
