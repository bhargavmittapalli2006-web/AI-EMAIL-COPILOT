import React from 'react';
import { MailQuestion, SearchX, Inbox, ShieldAlert, Sparkles } from 'lucide-react';

export const EmptyState = ({
  type = 'no-selection',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const configs = {
    'no-selection': {
      icon: Inbox,
      defaultTitle: 'Select an Email to Inspect',
      defaultDesc: 'Choose any email from the inbox list to view comprehensive AI threat diagnostics, priority scores, and suggested action items.',
    },
    'no-results': {
      icon: SearchX,
      defaultTitle: 'No Matching Emails Found',
      defaultDesc: 'Try adjusting your search keywords or switching filters (Risk Level, Priority, etc.).',
    },
    'no-threats': {
      icon: ShieldAlert,
      defaultTitle: 'No Threat Alerts in View',
      defaultDesc: 'All analyzed messages meet safe security thresholds or no emails match the current threat filter.',
    },
  };

  const config = configs[type] || configs['no-selection'];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[350px]">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
          <Icon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-[#F8FAFC] mb-1">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-slate-500 dark:text-[#94A3B8] max-w-sm mb-6 leading-relaxed">
        {description || config.defaultDesc}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
