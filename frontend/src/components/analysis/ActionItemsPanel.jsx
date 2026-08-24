import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  Plus,
  Calendar,
  CheckCircle2,
  ListTodo,
  Sparkles,
} from 'lucide-react';

export const ActionItemsPanel = ({
  actionItems = [],
  emailId,
  onToggleAction,
}) => {
  const [copiedTask, setCopiedTask] = useState(null);

  const completedCount = actionItems.filter((a) => a.completed).length;
  const totalCount = actionItems.length;

  const handleSimulateCalendar = (item) => {
    setCopiedTask(item.id);
    setTimeout(() => setCopiedTask(null), 2000);
  };

  const getPriorityStyle = (p) => {
    const norm = (p || 'LOW').toUpperCase();
    if (norm === 'CRITICAL') return 'bg-red-500/20 text-red-300 border-red-500/40';
    if (norm === 'HIGH') return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    if (norm === 'MEDIUM') return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-cyber-850/70 glass-panel p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              Action Items & To-Dos
            </h3>
            <p className="text-xs text-slate-400">
              AI Action Engine • Extracted Commitments & Follow-ups
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Progress:</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
              {completedCount}/{totalCount} Completed
            </span>
          </div>
        )}
      </div>

      {/* Items List */}
      {actionItems.length === 0 ? (
        <div className="p-6 rounded-xl bg-cyber-900/40 border border-white/5 text-center text-xs text-slate-400 font-mono">
          <span>No specific follow-up actions detected in this email.</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {actionItems.map((item) => {
            const isCompleted = item.completed;
            const isCopied = copiedTask === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onToggleAction(emailId, item.id)}
                className={`group p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isCompleted
                    ? 'bg-cyber-900/40 border-white/5 opacity-60'
                    : 'bg-cyber-900/80 border-white/10 hover:border-purple-500/40 hover:bg-cyber-850'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleAction(emailId, item.id);
                    }}
                    className="mt-0.5 text-purple-400 hover:text-purple-300 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-medium leading-relaxed font-sans ${
                        isCompleted
                          ? 'line-through text-slate-500'
                          : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {item.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {item.deadline && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-cyber-950 px-2 py-0.5 rounded border border-white/5">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Due: {item.deadline}
                        </span>
                      )}
                      {item.priority && (
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${getPriorityStyle(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulateCalendar(item);
                    }}
                    title="Export to Calendar / Task Manager"
                    className="p-1.5 rounded-lg bg-cyber-950 hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 border border-white/5 text-xs transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
