import React, { useState } from 'react';
import { CheckSquare, Square, Clock, Calendar, ArrowRight, CheckCircle2, Plus } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';

export const Actions = ({
  emails = [],
  onSelectEmail,
  onToggleAction,
}) => {
  const [filter, setFilter] = useState('all'); // all, today, upcoming, completed

  const allActions = emails.flatMap((e) =>
    (e.action_items || []).map((act) => ({
      ...act,
      emailId: e.id,
      emailSubject: e.subject,
      emailSender: e.sender_name || e.sender,
      rawEmail: e,
    }))
  );

  const pending = allActions.filter((a) => !a.completed);
  const completed = allActions.filter((a) => a.completed);

  const filtered = allActions.filter((a) => {
    if (filter === 'completed') return a.completed;
    if (filter === 'today') {
      return !a.completed && (a.deadline?.toLowerCase().includes('today') || a.deadline?.toLowerCase().includes('immediate'));
    }
    if (filter === 'upcoming') {
      return !a.completed && !a.deadline?.toLowerCase().includes('today') && !a.deadline?.toLowerCase().includes('immediate');
    }
    return !a.completed;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Extracted Actions & Deadlines Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Automated task and commitment extraction from your inbox threads
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#151E2E] p-1 rounded-lg text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-[#1B2638] text-slate-900 dark:text-[#F8FAFC] shadow-sm'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            Pending ({pending.length})
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              filter === 'today'
                ? 'bg-white dark:bg-[#1B2638] text-slate-900 dark:text-[#F8FAFC] shadow-sm'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            Due Today
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              filter === 'upcoming'
                ? 'bg-white dark:bg-[#1B2638] text-slate-900 dark:text-[#F8FAFC] shadow-sm'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-white dark:bg-[#1B2638] text-slate-900 dark:text-[#F8FAFC] shadow-sm'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            Completed ({completed.length})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="font-medium text-slate-700 dark:text-slate-300">No tasks in this view.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                item.completed ? 'bg-slate-50/50 dark:bg-[#151E2E]/30' : 'hover:bg-slate-50 dark:hover:bg-[#151E2E]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onToggleAction(item.emailId, item.id)}
                  className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0 cursor-pointer"
                >
                  {item.completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                <div className="min-w-0 space-y-1">
                  <span
                    className={`text-sm font-medium leading-snug block ${
                      item.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-[#F8FAFC]'
                    }`}
                  >
                    {item.title}
                  </span>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#94A3B8]">
                    <span className="truncate">From: <strong className="font-normal text-slate-700 dark:text-[#CBD5E1]">{item.emailSubject}</strong></span>
                    {item.deadline && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        {item.deadline}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectEmail(item.rawEmail)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 flex-shrink-0 cursor-pointer"
              >
                View Email
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Actions;
