import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { IconButton } from './IconButton';

/**
 * Accessible Theme Toggle button (Light / Dark)
 */
export function ThemeToggle({ isDark, onToggle }) {
  return (
    <IconButton
      icon={isDark ? Sun : Moon}
      label={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
      onClick={onToggle}
      size="md"
      className="text-slate-600 dark:text-amber-300 hover:text-slate-900 dark:hover:text-amber-200"
    />
  );
}
