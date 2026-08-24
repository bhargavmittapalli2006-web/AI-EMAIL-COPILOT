import React, { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Shield, RotateCcw, Check, Server } from 'lucide-react';
import { emailService } from '../services/emailService';

export const Settings = ({
  theme,
  onToggleTheme,
  onResetData,
}) => {
  const [sensitivity, setSensitivity] = useState('standard');
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [apiStatus, setApiStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [useMock, setUseMock] = useState(emailService.isUsingMock());

  const handleTestBackend = async () => {
    setIsTesting(true);
    setApiStatus(null);
    try {
      const status = await emailService.checkBackendHealth();
      setApiStatus(status);
    } catch (e) {
      setApiStatus({ online: false, error: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleMock = (checked) => {
    setUseMock(checked);
    emailService.setUseMock(checked);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-slate-900 dark:text-[#F8FAFC]">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Settings & Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
          Manage application appearance, AI engine parameters, and backend integrations
        </p>
      </div>

      <div className="space-y-4">
        {/* Appearance Section */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">Appearance & Theme</h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium block text-slate-800 dark:text-[#CBD5E1]">Interface Mode</span>
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                Choose between clean light mode and dark theme
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#151E2E] p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => theme !== 'light' && onToggleTheme()}
                className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                Light
              </button>
              <button
                type="button"
                onClick={() => theme !== 'dark' && onToggleTheme()}
                className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-[#F8FAFC] shadow-sm'
                    : 'text-slate-400 dark:text-[#94A3B8] hover:text-slate-100'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* AI Security Sensitivity */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">Security Sensitivity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-medium block text-slate-800 dark:text-[#CBD5E1]">Phishing Risk Threshold</span>
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  Standard triggers warning at score &gt; 50. High sensitivity triggers at score &gt; 35.
                </span>
              </div>
              <select
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value)}
                className="p-1.5 rounded-md bg-slate-50 dark:bg-[#151E2E] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-indigo-500"
              >
                <option value="conservative">Conservative (Score &gt; 70)</option>
                <option value="standard">Standard (Score &gt; 50)</option>
                <option value="strict">Strict / Zero Trust (Score &gt; 35)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Backend API Service Layer Configuration */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">Backend Integration & API Layer</h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium block text-slate-800 dark:text-[#CBD5E1]">Mock Intelligence Engine</span>
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  Use built-in standalone intelligence without needing live backend server
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useMock}
                  onChange={(e) => handleToggleMock(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-[#94A3B8]">
                FastAPI Server Endpoint
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#151E2E] border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleTestBackend}
                  disabled={isTesting}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#1B2638] text-xs font-medium text-slate-700 dark:text-[#CBD5E1] flex items-center gap-1.5 cursor-pointer"
                >
                  <Server className="w-3.5 h-3.5" />
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </button>
              </div>

              {apiStatus && (
                <div className={`p-2.5 rounded-lg text-xs font-mono mt-2 ${
                  apiStatus.online
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                  {apiStatus.online
                    ? `✓ Connected: ${apiStatus.service} is healthy`
                    : `Backend offline or unreachable (${apiStatus.error || 'Connection refused'}). Running on mock intelligence.`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reset Mock Data */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold block text-slate-900 dark:text-[#F8FAFC]">
              Reset Demo Scenario Dataset
            </span>
            <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
              Restores initial mock emails (CEO fraud, credential phishing, project sync)
            </span>
          </div>
          <button
            type="button"
            onClick={onResetData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-[#CBD5E1] text-xs font-medium hover:bg-slate-50 dark:hover:bg-[#1B2638] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
