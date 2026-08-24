import React from 'react';
import { CheckSquare, Square, Clock } from 'lucide-react';

export const ActionList = ({ actionItems = [], emailId, onToggleAction }) => {
  if (actionItems.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
        No pending action items extracted from this email.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
          Detected Commitments & Action Items ({actionItems.length})
        </h4>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
          {actionItems.filter((a) => a.completed).length} of {actionItems.length} completed
        </span>
      </div>

      <div className="space-y-1.5">
        {actionItems.map((item) => {
          const isCompleted = item.completed;

          return (
            <div
              key={item.id}
              onClick={() => onToggleAction && onToggleAction(emailId, item.id)}
              className={`p-3.5 rounded-lg border transition-colors cursor-pointer flex items-start gap-3 select-none shadow-sm ${
                isCompleted
                  ? 'bg-slate-50 dark:bg-[#151E2E]/40 border-slate-200 dark:border-slate-800 opacity-60'
                  : 'bg-white dark:bg-[#151E2E] border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
              >
                {isCompleted ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <span
                  className={`text-xs font-medium leading-relaxed block ${
                    isCompleted
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-800 dark:text-[#F8FAFC]'
                  }`}
                >
                  {item.title}
                </span>

                {item.deadline && (
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 dark:text-[#94A3B8]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Due {item.deadline}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionList;
