import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorBanner = ({ message, onRetry }) => {
  return (
    <div className="p-4 m-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center justify-between gap-4 text-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
        <span className="font-medium truncate">{message || 'An error occurred during communication.'}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors cursor-pointer shadow-sm flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
