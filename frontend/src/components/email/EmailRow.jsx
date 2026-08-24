import React, { useState } from 'react';
import {
  Star,
  Bookmark,
  Paperclip,
  Trash2,
  Archive,
  MailOpen,
  Mail,
  Loader2,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { getSecurityBadgeMeta } from '../../services/securityMapper';

/**
 * Classical Gmail-style Email Row with real ML-10 analysis integration
 */
export function EmailRow({
  email,
  analysisState = {},
  isSelected = false,
  isActive = false,
  onSelectRow,
  onToggleCheckbox,
  onToggleStar,
  onToggleImportant,
  onDelete,
  onArchive,
  onToggleRead,
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Derive security metadata from real ML analysis state
  const badgeMeta = getSecurityBadgeMeta(analysisState);
  const BadgeIcon = badgeMeta.icon;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelectRow(email.id)}
      className={`group relative flex items-center gap-3 px-4 py-2.5 border-b border-slate-200/80 dark:border-slate-800/80 cursor-pointer select-none transition-colors duration-100 text-xs ${
        isActive
          ? 'bg-blue-50/80 dark:bg-sky-950/40 border-l-4 border-l-blue-600 dark:border-l-sky-400'
          : isSelected
          ? 'bg-blue-50/50 dark:bg-slate-800/80'
          : email.isUnread
          ? 'bg-white dark:bg-slate-900/90 font-semibold'
          : 'bg-slate-50/40 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300'
      } hover:bg-slate-100/90 dark:hover:bg-slate-800/80`}
    >
      {/* Checkbox */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onToggleCheckbox(email.id);
        }}
        className="flex items-center justify-center p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      {/* Star Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar(email.id);
        }}
        title={email.isStarred ? 'Starred' : 'Not starred'}
        className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
      >
        <Star
          className={`w-4 h-4 ${
            email.isStarred
              ? 'fill-amber-400 text-amber-400'
              : 'stroke-[1.7] text-slate-400 dark:text-slate-500'
          }`}
        />
      </button>

      {/* Importance Bookmark Marker */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleImportant?.(email.id);
        }}
        title={email.isImportant ? 'Important' : 'Not important'}
        className="p-1 text-slate-400 hover:text-amber-500 transition-colors hidden sm:block"
      >
        <Bookmark
          className={`w-3.5 h-3.5 ${
            email.isImportant
              ? 'fill-amber-500 text-amber-500'
              : 'stroke-[1.5] text-slate-300 dark:text-slate-600'
          }`}
        />
      </button>

      {/* Sender Name */}
      <div className="w-44 shrink-0 truncate">
        <span
          className={`truncate ${
            email.isUnread
              ? 'text-slate-900 dark:text-white font-bold'
              : 'text-slate-700 dark:text-slate-300 font-normal'
          }`}
        >
          {email.senderName}
        </span>
      </div>

      {/* Subject + Snippet Preview */}
      <div className="flex-1 flex items-center gap-2 min-w-0 pr-2">
        <span
          className={`truncate ${
            email.isUnread
              ? 'text-slate-900 dark:text-slate-100 font-semibold'
              : 'text-slate-800 dark:text-slate-200'
          }`}
        >
          {email.subject}
        </span>
        <span className="text-slate-400 dark:text-slate-400 shrink-0 font-normal">-</span>
        <span className="truncate text-slate-500 dark:text-slate-400 font-normal">
          {email.preview}
        </span>
      </div>

      {/* Real Backend Security Badge */}
      <div className="shrink-0 hidden md:flex items-center">
        {badgeMeta.isAnalyzing ? (
          <Badge variant="neutral" size="xs">
            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            <span>Scanning...</span>
          </Badge>
        ) : badgeMeta.isScanned ? (
          <Badge variant={badgeMeta.variant} size="xs">
            <BadgeIcon className="w-3 h-3 stroke-[2]" />
            <span>
              {badgeMeta.label}
              {badgeMeta.score !== undefined ? ` (${Math.round(badgeMeta.score)})` : ''}
            </span>
          </Badge>
        ) : badgeMeta.isError ? (
          <Badge variant="neutral" size="xs">
            <BadgeIcon className="w-3 h-3 text-amber-500 stroke-[2]" />
            <span>Scan Error</span>
          </Badge>
        ) : (
          <Badge variant="neutral" size="xs">
            <BadgeIcon className="w-3 h-3 text-slate-400" />
            <span>Unscanned</span>
          </Badge>
        )}
      </div>

      {/* Attachment Icon */}
      {email.hasAttachment && (
        <div className="shrink-0 text-slate-400 dark:text-slate-400 hidden sm:block">
          <Paperclip className="w-3.5 h-3.5" title="Has attachment" />
        </div>
      )}

      {/* Timestamp / Hover Quick Actions */}
      <div className="w-28 shrink-0 flex items-center justify-end text-right">
        {isHovered ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 rounded-lg p-0.5 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <button
              type="button"
              onClick={() => onArchive?.(email.id)}
              title="Archive"
              className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(email.id)}
              title="Delete"
              className="p-1 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onToggleRead?.(email.id)}
              title={email.isUnread ? 'Mark as read' : 'Mark as unread'}
              className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {email.isUnread ? <MailOpen className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <span
            className={`text-[11px] ${
              email.isUnread
                ? 'text-slate-900 dark:text-slate-100 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {email.timestamp}
          </span>
        )}
      </div>
    </div>
  );
}
