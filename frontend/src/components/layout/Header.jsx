import React from 'react';
import {
  Menu,
  Search,
  SlidersHorizontal,
  X,
  ShieldCheck,
  Bell,
  HelpCircle,
  Settings,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { ThemeToggle } from '../common/ThemeToggle';
import { Avatar } from '../common/Avatar';

/**
 * Classical Gmail-style Header with live ML Backend Health Indicator
 */
export function Header({
  isSidebarCollapsed,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onClearSearch,
  isDark,
  onToggleTheme,
  isSecurityPanelOpen,
  onToggleSecurityPanel,
  backendHealth = {},
}) {
  const isBackendReady = backendHealth.isOnline && backendHealth.modelLoaded;

  return (
    <header className="h-16 px-4 flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 select-none z-20">
      {/* Left: Brand Identity & Menu Button */}
      <div className="flex items-center gap-3 min-w-[240px]">
        <IconButton
          icon={Menu}
          label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggleSidebar}
          size="md"
        />

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 dark:bg-sky-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                AI Email Copilot
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-sky-950 dark:text-sky-300 dark:border dark:border-sky-800">
                v1.0
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Enterprise Phishing Defense
            </span>
          </div>
        </div>
      </div>

      {/* Center: Classical Gmail Search Bar */}
      <div className="flex-1 max-w-2xl px-2">
        <div className="relative flex items-center w-full rounded-full bg-slate-100 dark:bg-slate-800/90 border border-transparent focus-within:border-slate-300 dark:focus-within:border-slate-700 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:shadow-md transition-all duration-150">
          <div className="pl-4 pr-2 text-slate-400 dark:text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search mail, senders, or threat subjects..."
            className="w-full py-2.5 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              aria-label="Clear search"
              className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <SlidersHorizontal className="w-4 h-4" title="Advanced search filters" />
          </div>
        </div>
      </div>

      {/* Right: Security Status Pill & User Controls */}
      <div className="flex items-center gap-2.5">
        {/* Backend & Model Readiness Status Pill */}
        <div
          className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
            isBackendReady
              ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              : 'border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span>{isBackendReady ? 'ML Engine: Ready' : 'ML Engine: Connecting'}</span>
        </div>

        {/* Security Context Toggle */}
        <button
          type="button"
          onClick={onToggleSecurityPanel}
          title={isSecurityPanelOpen ? 'Hide Security Sidebar' : 'Show Security Sidebar'}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            isSecurityPanelOpen
              ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800'
              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
          <span>Security Context</span>
        </button>

        {/* Theme Switcher */}
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

        {/* Notifications */}
        <IconButton icon={Bell} label="Notifications" size="md" />

        {/* Help & Settings */}
        <IconButton icon={HelpCircle} label="Help & Documentation" size="md" className="hidden sm:inline-flex" />
        <IconButton icon={Settings} label="Settings" size="md" className="hidden sm:inline-flex" />

        {/* User Profile Avatar */}
        <div className="pl-1 border-l border-slate-200 dark:border-slate-800">
          <Avatar name="Bhargav Mittapalli" size="md" />
        </div>
      </div>
    </header>
  );
}
