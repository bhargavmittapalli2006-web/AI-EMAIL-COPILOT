import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, color = 'default', onClick }) => {
  const colorSchemes = {
    default: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      text: 'text-slate-900 dark:text-slate-100',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    },
    danger: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      text: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    },
    warning: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      text: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
    primary: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      text: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    },
    success: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      text: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.default;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border ${scheme.border} ${scheme.bg} shadow-sm transition-all ${
        onClick ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-lg ${scheme.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className={`text-2xl font-bold tracking-tight ${scheme.text}`}>
          {value}
        </div>
      </div>

      {subtext && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {subtext}
        </p>
      )}
    </div>
  );
};
