import React from 'react';

/**
 * Accessible, Gmail-style circular/pill icon button
 */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  badge = null,
  className = '',
  size = 'md',
  variant = 'ghost',
  disabled = false,
  ...props
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm p-1.5',
    md: 'w-9 h-9 text-base p-2',
    lg: 'w-10 h-10 text-lg p-2.5',
  };

  const variantClasses = {
    ghost: active
      ? 'bg-blue-100 text-blue-800 dark:bg-sky-950/60 dark:text-sky-300'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800',
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 shadow-sm',
    outline:
      'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-full h-full stroke-[1.8]" />}
      {badge !== null && badge !== undefined && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-rose-600 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
