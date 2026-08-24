import React from 'react';

/**
 * Classical circular avatar with fallback initials
 */
export function Avatar({
  name = 'User',
  src = null,
  size = 'md',
  color = null,
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm font-semibold',
    xl: 'w-12 h-12 text-base font-bold',
  };

  // Generate deterministic color from name if not provided
  const colors = [
    'bg-blue-600 dark:bg-blue-700',
    'bg-indigo-600 dark:bg-indigo-700',
    'bg-emerald-600 dark:bg-emerald-700',
    'bg-purple-600 dark:bg-purple-700',
    'bg-amber-600 dark:bg-amber-700',
    'bg-rose-600 dark:bg-rose-700',
    'bg-teal-600 dark:bg-teal-700',
    'bg-cyan-600 dark:bg-cyan-700',
  ];

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getColorIndex = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % colors.length;
  };

  const bgClass = color || colors[getColorIndex(name)];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover border border-slate-200 dark:border-slate-700 ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-white font-medium select-none shadow-sm ${sizeClasses[size]} ${bgClass} ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
