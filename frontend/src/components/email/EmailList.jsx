import React from 'react';
import {
  Inbox,
  Tag,
  Users,
  Bell,
  MailCheck,
} from 'lucide-react';
import { EmailRow } from './EmailRow';

/**
 * Main Email List container mapping real ML-10 analysis states
 */
export function EmailList({
  emails = [],
  analysisMap = {},
  selectedEmailIds = [],
  activeEmailId = null,
  onSelectEmail,
  onToggleCheckbox,
  onToggleStar,
  onToggleImportant,
  onDeleteEmail,
  onArchiveEmail,
  onToggleRead,
  activeCategory = 'primary',
  onSelectCategory,
  folderTitle = 'Inbox',
}) {
  const categories = [
    { id: 'primary', label: 'Primary', icon: Inbox, count: emails.length },
    { id: 'work', label: 'Work', icon: Tag, count: emails.filter((e) => e.category === 'work').length },
    { id: 'finance', label: 'Finance & Accounts', icon: Bell, count: emails.filter((e) => e.category === 'finance').length },
    { id: 'updates', label: 'Updates', icon: Users, count: emails.filter((e) => e.category === 'updates').length },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Category Tabs (Gmail Style) */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-2 shrink-0 select-none overflow-x-auto">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory?.(cat.id)}
              className={`flex items-center gap-2.5 px-6 py-3 border-b-2 text-xs font-semibold tracking-tight transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:border-sky-400 dark:text-sky-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2]" />
              <span>{cat.label}</span>
              {cat.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-blue-100 text-blue-800 dark:bg-sky-950 dark:text-sky-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Email List Rows Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
        {emails.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-6 text-center select-none">
            <MailCheck className="w-12 h-12 stroke-[1.3] mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Your {folderTitle} is clean!
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              No emails found in this view. All incoming messages are guarded by AI Email Copilot.
            </p>
          </div>
        ) : (
          emails.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              analysisState={analysisMap[email.id] || { status: 'idle' }}
              isSelected={selectedEmailIds.includes(email.id)}
              isActive={activeEmailId === email.id}
              onSelectRow={onSelectEmail}
              onToggleCheckbox={onToggleCheckbox}
              onToggleStar={onToggleStar}
              onToggleImportant={onToggleImportant}
              onDelete={onDeleteEmail}
              onArchive={onArchiveEmail}
              onToggleRead={onToggleRead}
            />
          ))
        )}
      </div>
    </div>
  );
}
