import React, { useState } from 'react';
import {
  RotateCcw,
  Archive,
  AlertOctagon,
  Trash2,
  MailOpen,
  Mail,
  Tag,
  FolderInput,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  Square,
  MinusSquare,
  ShieldCheck,
} from 'lucide-react';
import { IconButton } from '../common/IconButton';

/**
 * Classical Gmail-style Email Action Toolbar
 */
export function Toolbar({
  totalEmails = 0,
  selectedCount = 0,
  onSelectAll,
  onDeselectAll,
  onSelectRead,
  onSelectUnread,
  onSelectStarred,
  onRefresh,
  onMarkRead,
  onMarkUnread,
  onDeleteSelected,
  onSpamSelected,
  onArchiveSelected,
  onRestoreSelected,
  activeFolder = 'inbox',
  folderTitle = 'Inbox',
}) {

  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false);

  const isAllSelected = selectedCount > 0 && selectedCount === totalEmails;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalEmails;

  const handleCheckboxToggle = () => {
    if (selectedCount > 0) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <div className="h-12 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 select-none text-xs">
      {/* Left: Selection Controls & Batch Action Icons */}
      <div className="flex items-center gap-1">
        {/* Select All Checkbox with Dropdown */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={handleCheckboxToggle}
            aria-label={isAllSelected ? 'Deselect all' : 'Select all'}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            ) : isPartiallySelected ? (
              <MinusSquare className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsSelectMenuOpen(!isSelectMenuOpen)}
            aria-label="Selection options"
            className="p-1 -ml-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Selection Dropdown Menu */}
          {isSelectMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30">
              <button
                type="button"
                onClick={() => {
                  onSelectAll();
                  setIsSelectMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeselectAll();
                  setIsSelectMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                None
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectRead?.();
                  setIsSelectMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                Read
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectUnread?.();
                  setIsSelectMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                Unread
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectStarred?.();
                  setIsSelectMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                Starred
              </button>
            </div>
          )}
        </div>

        {/* Action icons when items are selected */}
        {selectedCount > 0 ? (
          <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
            {(activeFolder === 'trash' || activeFolder === 'spam') && (
              <IconButton
                icon={RotateCcw}
                label={activeFolder === 'spam' ? 'Not Spam / Restore to Inbox' : 'Restore to Inbox'}
                onClick={onRestoreSelected}
                size="sm"
              />
            )}
            <IconButton icon={Archive} label="Archive" onClick={onArchiveSelected} size="sm" />
            {activeFolder !== 'spam' && (
              <IconButton icon={AlertOctagon} label="Report Spam" onClick={onSpamSelected} size="sm" />
            )}
            <IconButton icon={Trash2} label="Delete" onClick={onDeleteSelected} size="sm" />
            <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
            <IconButton icon={MailOpen} label="Mark as read" onClick={onMarkRead} size="sm" />
            <IconButton icon={Mail} label="Mark as unread" onClick={onMarkUnread} size="sm" />
            <IconButton icon={FolderInput} label="Move to" size="sm" />
            <IconButton icon={Tag} label="Apply label" size="sm" />
          </div>
        ) : (

          <div className="flex items-center gap-1 pl-1">
            <IconButton icon={RotateCcw} label="Refresh mailbox" onClick={onRefresh} size="sm" />
            <IconButton icon={MoreVertical} label="More options" size="sm" />
          </div>
        )}
      </div>

      {/* Right: Folder Name & Pagination Controls */}
      <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {selectedCount > 0 ? `${selectedCount} selected` : folderTitle}
        </span>

        <div className="flex items-center gap-2">
          <span>
            {totalEmails > 0 ? `1–${totalEmails} of ${totalEmails}` : '0 of 0'}
          </span>
          <div className="flex items-center">
            <IconButton icon={ChevronLeft} label="Previous page" disabled size="sm" />
            <IconButton icon={ChevronRight} label="Next page" disabled size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
