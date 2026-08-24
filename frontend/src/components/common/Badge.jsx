import React from 'react';

/**
 * Clean, restrained semantic pill badge for email client status & risk levels
 */
export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  dot = false,
}) {
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 font-medium',
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  const variantClasses = {
    neutral:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    primary:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
    safe:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
    caution:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    high:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60',
    critical:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
  };

  const dotClasses = {
    neutral: 'bg-slate-400 dark:bg-slate-500',
    primary: 'bg-blue-500 dark:bg-sky-400',
    safe: 'bg-emerald-500 dark:bg-emerald-400',
    caution: 'bg-amber-500 dark:bg-amber-400',
    high: 'bg-orange-500 dark:bg-orange-400',
    critical: 'bg-rose-500 dark:bg-rose-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-solid tracking-tight transition-colors ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.neutral} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant] || dotClasses.neutral}`}
        />
      )}
      {children}
    </span>
  );
}
