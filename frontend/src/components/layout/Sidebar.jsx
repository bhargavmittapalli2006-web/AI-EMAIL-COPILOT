import React from 'react';
import {
  Inbox,
  Star,
  Bookmark,
  Send,
  FileText,
  Mail,
  AlertOctagon,
  Trash2,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Flame,
  Plus,
  PenSquare,
  Tag,
  Briefcase,
  DollarSign,
  Bell,
  User,
  CheckCircle2,
} from 'lucide-react';
import { FOLDERS } from '../../data/mockInboxData';

const ICONS_MAP = {
  Inbox,
  Star,
  Bookmark,
  Send,
  FileText,
  Mail,
  AlertOctagon,
  Trash2,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Flame,
  Briefcase,
  DollarSign,
  Bell,
  User,
};

/**
 * Classical Gmail-style Left Sidebar
 */
export function Sidebar({
  activeFolder,
  onSelectFolder,
  isCollapsed = false,
  unreadCount = 4,
  threatCount = 2,
  onCompose,
}) {
  const mailFolders = FOLDERS.filter((f) => f.section === 'mail');
  const securityFolders = FOLDERS.filter((f) => f.section === 'security');
  const labelFolders = FOLDERS.filter((f) => f.section === 'labels');

  const renderFolderItem = (folder) => {
    const IconComponent = ICONS_MAP[folder.icon] || Tag;
    const isActive = activeFolder === folder.id;

    // Dynamic badge overrides
    let badgeVal = folder.badge;
    if (folder.id === 'inbox') badgeVal = unreadCount;
    if (folder.id === 'threats') badgeVal = threatCount;

    return (
      <button
        key={folder.id}
        type="button"
        onClick={() => onSelectFolder(folder.id)}
        title={folder.label}
        className={`w-full flex items-center gap-3.5 px-4 py-2 my-0.5 rounded-r-full text-xs font-medium transition-colors text-left select-none ${
          isActive
            ? 'bg-blue-100/90 text-blue-900 font-bold dark:bg-sky-950/70 dark:text-sky-200'
            : 'text-slate-700 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800/70'
        } ${isCollapsed ? 'justify-center px-0 rounded-full w-10 h-10 mx-auto my-1' : ''}`}
      >
        <IconComponent
          className={`w-4 h-4 shrink-0 stroke-[1.9] ${
            isActive
              ? 'text-blue-700 dark:text-sky-300'
              : folder.color || 'text-slate-500 dark:text-slate-400'
          }`}
        />

        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{folder.label}</span>
            {badgeVal !== undefined && badgeVal !== null && badgeVal > 0 && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  isActive
                    ? 'bg-blue-600 text-white dark:bg-sky-500 dark:text-slate-900'
                    : folder.section === 'security'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {badgeVal}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`h-full flex flex-col justify-between py-3 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 select-none transition-all duration-200 ${
        isCollapsed ? 'w-16 px-1' : 'w-64 pr-2'
      }`}
    >
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Compose Button */}
        <div className={`mb-4 ${isCollapsed ? 'flex justify-center' : 'px-2'}`}>
          <button
            type="button"
            onClick={onCompose}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs shadow-sm hover:shadow hover:bg-slate-50 dark:hover:bg-slate-750 transition-all ${
              isCollapsed ? 'w-11 h-11 p-0 justify-center rounded-full' : 'w-full'
            }`}
          >
            <PenSquare className="w-4 h-4 text-blue-600 dark:text-sky-400 stroke-[2.2]" />
            {!isCollapsed && <span>Compose</span>}
          </button>
        </div>

        {/* Mail Section */}
        <div className="space-y-0.5 mb-5">
          {!isCollapsed && (
            <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Mail
            </div>
          )}
          {mailFolders.map(renderFolderItem)}
        </div>

        {/* Security Section */}
        <div className="space-y-0.5 mb-5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
          {!isCollapsed && (
            <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center justify-between">
              <span>Security Center</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Protection" />
            </div>
          )}
          {securityFolders.map(renderFolderItem)}
        </div>

        {/* Labels Section */}
        <div className="space-y-0.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
          {!isCollapsed && (
            <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Labels
            </div>
          )}
          {labelFolders.map(renderFolderItem)}
        </div>
      </div>

      {/* Footer Storage & Protection Indicator */}
      {!isCollapsed && (
        <div className="p-3 mx-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium mb-1.5">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Inbox Guard Active</span>
            </span>
            <span className="text-[10px] text-slate-400">100%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-full" />
          </div>
          <div className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            Validated Phishing Engine Online
          </div>
        </div>
      )}
    </aside>
  );
}
