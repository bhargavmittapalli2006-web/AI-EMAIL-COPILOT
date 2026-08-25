import React, { useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Shield,
  Bell,
  User,
  Sliders,
  Check,
  Server,
  LogOut,
} from 'lucide-react';

/**
 * Classical Enterprise Settings & Configuration Modal
 */
export function SettingsModal({
  isOpen,
  onClose,
  isDark,
  onToggleTheme,
  backendHealth = {},
  userSession = {},
  onSignOut,
}) {
  const [activeTab, setActiveTab] = useState('general');
  const [sensitivity, setSensitivity] = useState('standard');
  const [notifyThreats, setNotifyThreats] = useState(true);
  const [notifyDailyReport, setNotifyDailyReport] = useState(false);
  const [density, setDensity] = useState('comfortable');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-xs text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-sky-950 text-blue-600 dark:text-sky-400">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Application Settings
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Manage appearance, security engine thresholds, and session parameters
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Tabs Sidebar + Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Navigation Tabs */}
          <div className="w-48 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-2 space-y-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                activeTab === 'general'
                  ? 'bg-blue-100/90 text-blue-900 dark:bg-sky-950 dark:text-sky-200 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span>General</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-blue-100/90 text-blue-900 dark:bg-sky-950 dark:text-sky-200 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Notifications</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-blue-100/90 text-blue-900 dark:bg-sky-950 dark:text-sky-200 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Security Engine</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                activeTab === 'account'
                  ? 'bg-blue-100/90 text-blue-900 dark:bg-sky-950 dark:text-sky-200 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4 text-purple-500" />
              <span>Account & Session</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">
                    Appearance & Theme
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400">
                    Customize workspace visual mode and element density
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">
                      Color Mode
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Toggle between Light mode and High-Contrast Dark mode
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold shadow-xs hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                  >
                    {isDark ? <Moon className="w-3.5 h-3.5 text-sky-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">
                      Interface Density
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Adjust spacing density for email rows
                    </span>
                  </div>
                  <select
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">
                    Alert & Notification Preferences
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400">
                    Configure real-time threat alerts and email summary digest notifications
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold block text-slate-800 dark:text-slate-200">
                        Critical Threat Banner Alerts
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Notify immediately when an incoming email scores &gt; 80/100 risk
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyThreats}
                      onChange={(e) => setNotifyThreats(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>

                  <div className="h-px bg-slate-200 dark:bg-slate-800" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold block text-slate-800 dark:text-slate-200">
                        Daily Security Intelligence Summary
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Receive a daily overview of clean vs flagged inbox messages
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyDailyReport}
                      onChange={(e) => setNotifyDailyReport(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">
                    ML Security Engine Configuration
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400">
                    Inspect ML-10 threat classification pipeline & Gemini backend status
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Model Artifact:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">phishing_email_pipeline.pkl (703,623 bytes)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Engine Endpoint:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">http://127.0.0.1:8000/api/v1/analyze</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Backend Health:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {backendHealth.isOnline ? 'Online (Ready)' : 'Connecting...'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">
                      Phishing Sensitivity Threshold
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Authoritative risk scoring is enforced server-side
                    </span>
                  </div>
                  <select
                    value={sensitivity}
                    onChange={(e) => setSensitivity(e.target.value)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                  >
                    <option value="standard">Standard (Score &gt; 50)</option>
                    <option value="strict">Strict / Zero Trust (Score &gt; 35)</option>
                  </select>
                </div>
              </div>
            )}

            {/* ACCOUNT TAB */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">
                    Account & Session Management
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400">
                    Active session state and user identity parameters
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">User:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{userSession.name || 'Bhargav Mittapalli'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Work Email:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{userSession.email || 'bhargav.mittapalli@company.com'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Session Role:</span>
                    <span className="font-semibold text-blue-600 dark:text-sky-400">{userSession.role || 'SecOps Analyst'}</span>
                  </div>

                </div>

                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Session</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
