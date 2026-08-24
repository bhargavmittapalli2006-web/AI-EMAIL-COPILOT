import React from 'react';

export const EmailListSkeleton = () => {
  return (
    <div className="space-y-3 p-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#151E2E]/60 space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1">
                <div className="w-28 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-20 h-2.5 bg-slate-100 dark:bg-slate-700 rounded" />
              </div>
            </div>
            <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
          <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded" />
          <div className="flex items-center gap-2 pt-1">
            <div className="w-14 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-14 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const EmailViewerSkeleton = () => {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="w-3/4 h-7 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5">
              <div className="w-40 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-60 h-3 bg-slate-100 dark:bg-slate-700 rounded" />
            </div>
          </div>
          <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="space-y-3">
        <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="w-11/12 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="w-4/5 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="w-2/3 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      {/* AI Panels skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="h-44 bg-slate-100 dark:bg-[#151E2E] rounded-xl border border-slate-200 dark:border-slate-800" />
        <div className="h-44 bg-slate-100 dark:bg-[#151E2E] rounded-xl border border-slate-200 dark:border-slate-800" />
      </div>
    </div>
  );
};

export default { EmailListSkeleton, EmailViewerSkeleton };
