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
  Sparkles,
  Lock,
  Eye,
  ShieldAlert,
  Calendar,
  ListTodo,
} from 'lucide-react';
import { Badge } from '../common/Badge';

/**
 * Classical Enterprise Settings & Configuration Modal
 * Upgraded with AI Privacy & Consent Controls and Granular Notification Settings.
 */
export function SettingsModal({
  isOpen,
  onClose,
  isDark,
  onToggleTheme,
  backendHealth = {},
  userSession = {},
  aiSettings = {
    aiIntelligenceEnabled: true,
    aiRepliesEnabled: true,
    aiTriggerMode: 'auto', // 'auto' | 'on_open' | 'manual'
    notifyThreats: true,
    notifyCritical: true,
    notifyHigh: true,
    notifyDeadlines: true,
    notifyActionItems: true,
    notifyDailyReport: false,
  },
  onUpdateAiSettings,
  onSignOut,
}) {
  const [activeTab, setActiveTab] = useState('general');
  const [density, setDensity] = useState('comfortable');

  const updateSetting = (key, value) => {
    if (onUpdateAiSettings) {
      onUpdateAiSettings({
        ...aiSettings,
        [key]: value,
      });
    }
  };

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
                Manage appearance, AI privacy controls, notification preferences, and security parameters
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
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
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-colors cursor-pointer ${
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
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-colors cursor-pointer ${
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
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-blue-100/90 text-blue-900 dark:bg-sky-950 dark:text-sky-200 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>AI &amp; Privacy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-colors cursor-pointer ${
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
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-colors cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-blue-100/90 text-blue-900 dark:bg-sky-950 dark:text-sky-200 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4 text-purple-500" />
              <span>Account &amp; Session</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">
                    Appearance &amp; Theme
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
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold shadow-xs hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
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

            {/* NOTIFICATIONS TAB (Part 11) */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">
                    Alert &amp; Notification Preferences
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400">
                    Configure real-time security alerts and productivity task reminders
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3.5">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold block text-slate-800 dark:text-slate-200">
                        Threat Alerts
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Master notification toggle for all detected security risks
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSettings.notifyThreats ?? true}
                      onChange={(e) => updateSetting('notifyThreats', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>

                  <div className="h-px bg-slate-200 dark:bg-slate-800" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold block text-slate-800 dark:text-slate-200">
                        Critical Threat Notifications
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Notify immediately when an incoming email scores &gt; 80/100 risk
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSettings.notifyCritical ?? true}
                      onChange={(e) => updateSetting('notifyCritical', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>

                  <div className="h-px bg-slate-200 dark:bg-slate-800" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold block text-slate-800 dark:text-slate-200">
                        High-Risk Threat Alerts
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Notify on emails flagged with suspicious links or spoofed headers
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSettings.notifyHigh ?? true}
                      onChange={(e) => updateSetting('notifyHigh', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>

                  <div className="h-px bg-slate-200 dark:bg-slate-800" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold block text-slate-800 dark:text-slate-200">
                        Deadline Reminders
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Notify when timeline deadlines extracted by Gemini approach
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSettings.notifyDeadlines ?? true}
                      onChange={(e) => updateSetting('notifyDeadlines', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>

                  <div className="h-px bg-slate-200 dark:bg-slate-800" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold block text-slate-800 dark:text-slate-200">
                        AI Action-Item Reminders
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Alert for pending high-priority action items
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSettings.notifyActionItems ?? true}
                      onChange={(e) => updateSetting('notifyActionItems', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>

                  <div className="h-px bg-slate-200 dark:bg-slate-800" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold block text-slate-800 dark:text-slate-200">
                        Daily Security Summary
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Receive a daily overview of clean vs flagged inbox messages
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSettings.notifyDailyReport ?? false}
                      onChange={(e) => updateSetting('notifyDailyReport', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* AI & PRIVACY TAB (Part 12 & 13) */}
            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">
                    AI Privacy &amp; Consent Controls
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400">
                    Configure optional AI intelligence features while preserving core security gates
                  </p>
                </div>

                {/* Mandatory Core Security Banner */}
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>ML-10 Security Analysis</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Always active &bull; Required for zero-trust phishing and malware defense
                    </p>
                  </div>
                  <Badge variant="primary" size="xs">
                    Protected
                  </Badge>
                </div>

                {/* Optional AI Features */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3.5">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold block text-slate-800 dark:text-slate-200">
                        AI Email Intelligence (ML-11)
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Generate executive summaries, key takeaways, and action items via Gemini
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSettings.aiIntelligenceEnabled ?? true}
                      onChange={(e) => updateSetting('aiIntelligenceEnabled', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>

                  <div className="h-px bg-slate-200 dark:bg-slate-800" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-semibold block text-slate-800 dark:text-slate-200">
                        AI Reply Suggestions (ML-12)
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Generate contextual reply drafts for safe emails with security gate protection
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSettings.aiRepliesEnabled ?? true}
                      onChange={(e) => updateSetting('aiRepliesEnabled', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>
                </div>

                {/* AI Analysis Trigger Behavior Policy */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3">
                  <span className="font-bold block text-slate-800 dark:text-slate-200">
                    AI Analysis Trigger Behavior
                  </span>

                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      <input
                        type="radio"
                        name="aiTriggerMode"
                        value="auto"
                        checked={(aiSettings.aiTriggerMode || 'auto') === 'auto'}
                        onChange={(e) => updateSetting('aiTriggerMode', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="font-semibold block text-slate-800 dark:text-slate-200">
                          Analyze automatically
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Scans and generates intelligence for incoming emails automatically
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      <input
                        type="radio"
                        name="aiTriggerMode"
                        value="on_open"
                        checked={aiSettings.aiTriggerMode === 'on_open'}
                        onChange={(e) => updateSetting('aiTriggerMode', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="font-semibold block text-slate-800 dark:text-slate-200">
                          Analyze when I open an email
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Triggers AI intelligence only when an email is explicitly opened
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      <input
                        type="radio"
                        name="aiTriggerMode"
                        value="manual"
                        checked={aiSettings.aiTriggerMode === 'manual'}
                        onChange={(e) => updateSetting('aiTriggerMode', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="font-semibold block text-slate-800 dark:text-slate-200">
                          Ask before AI analysis
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Displays a consent confirmation banner before sending content to AI
                        </span>
                      </div>
                    </label>
                  </div>
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
                    Inspect ML-10 threat classification pipeline &amp; Gemini backend status
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Model Artifact:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">phishing_email_pipeline.pkl (703,623 bytes)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Engine Endpoint:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">/api/v1/analyze</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Backend Health:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {backendHealth.isOnline ? 'Active & Healthy' : 'Offline / Degraded'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Gemini Intelligence:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {backendHealth.geminiAvailable ? 'Connected' : 'Intelligent Fallback'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ACCOUNT TAB */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">
                    SecOps Account Session
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400">
                    Active user identity and PBKDF2 authenticated session
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {(userSession.name || 'BM')[0]}
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">
                        {userSession.name || 'Bhargav Mittapalli'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {userSession.email || 'bhargav.mittapalli@company.com'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Session Role:</span>
                    <Badge variant="primary" size="xs">
                      {userSession.role || 'SecOps Analyst'}
                    </Badge>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignOut?.();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold transition-colors cursor-pointer border border-rose-200 dark:border-rose-800"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Copilot</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
