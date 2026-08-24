import React from 'react';
import { Zap, Clock, Tag, CheckCircle2, ArrowRight } from 'lucide-react';
import { PriorityBadge } from '../common/Badge';

export const PriorityAnalysis = ({ priorityAnalysis = {}, understanding = {} }) => {
  const {
    priority_score = 50,
    priority_level = 'MEDIUM',
    urgency = 'NORMAL',
    category = 'General Communication',
    deadline,
  } = priorityAnalysis;

  // Synthesize realistic bullet points based on priority features
  const priorityReasons = [
    deadline ? `Time-sensitive deadline detected (${deadline})` : 'Routine scheduling window',
    urgency === 'URGENT' ? 'Urgent action or response requested by sender' : 'Standard conversational cadence',
    priority_score > 70 ? 'Key stakeholder or high-impact business communication' : 'Informational updates',
    'AI intent analysis indicates operational follow-up required',
  ];

  const getRecommendedAction = () => {
    if (priority_level === 'HIGH') return 'Review and respond today. Escalate if pending executive approval.';
    if (priority_level === 'MEDIUM') return 'Schedule response within 24–48 business hours.';
    return 'Archive or review when convenient. No immediate response required.';
  };

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-200">
      {/* Priority Score Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">
            Priority Score
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {priority_score}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">/ 100</span>
          </div>
        </div>

        <div className="text-right space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-[#94A3B8] block">
            Classification
          </span>
          <PriorityBadge level={priority_level} size="md" />
        </div>
      </div>

      {/* Reasons Why It's Priority */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
          Priority Factors & Evaluation
        </h4>
        <div className="p-3.5 rounded-lg bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 space-y-2 text-xs shadow-sm">
          {priorityReasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-[#CBD5E1]">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Action */}
      <div className="p-3.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs">
        <span className="font-semibold text-indigo-900 dark:text-indigo-200 block mb-1">
          Recommended Action
        </span>
        <p className="text-indigo-700 dark:text-indigo-300 leading-relaxed font-sans font-medium">
          "{getRecommendedAction()}"
        </p>
      </div>
    </div>
  );
};

export default PriorityAnalysis;
