import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
  X,
  Loader2,
  ScanLine,
  FilePlus,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { getSecurityBadgeMeta } from '../../services/securityMapper';

/**
 * Compact Security Context Side Panel with Real ML-10 Metrics
 */
export function SecurityContextSidePanel({
  isOpen = true,
  onClose,
  backendHealth = {},
  totalEmails = 0,
  scannedCount = 0,
  cleanCount = 0,
  threatCount = 0,
  selectedEmail = null,
  selectedEmailAnalysis = {},
  onScanAll,
  isScanningAll = false,
  onOpenCustomScan,
}) {
  if (!isOpen) return null;

  const selectedBadgeMeta = getSecurityBadgeMeta(selectedEmailAnalysis);
  const analysis = selectedEmailAnalysis.data || null;

  return (
    <aside className="w-72 h-full flex flex-col border-l border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 select-none overflow-y-auto p-4 shrink-0 transition-all text-xs">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-sky-400 stroke-[2.2]" />
          <span className="font-bold text-slate-900 dark:text-white">Security Context</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Backend Engine Status Card */}
      <div className="p-3 mb-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-slate-800 dark:text-slate-200">ML Phishing Engine</span>
          <Badge variant={backendHealth.isOnline ? 'safe' : 'critical'} size="xs" dot>
            {backendHealth.isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
          <div>Model: <span className="font-medium text-slate-700 dark:text-slate-200">{backendHealth.modelLoaded ? 'TF-IDF + Logistic Reg' : 'Not Loaded'}</span></div>
          <div>Version: <span className="font-medium text-slate-700 dark:text-slate-200">{backendHealth.version || '1.0.0'}</span></div>
        </div>
      </div>

      {/* Real-time Inbox Health Metrics Card */}
      <div className="p-3.5 mb-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Inbox Health</span>
          <span className="text-[10px] text-slate-500 font-medium">
            {scannedCount} of {totalEmails} scanned
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2 text-center">
          <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 block">
              {cleanCount}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Clean Verified</span>
          </div>
          <div className="p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40">
            <span className="text-lg font-bold text-rose-700 dark:text-rose-400 block">
              {threatCount}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Threats Flagged</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 space-y-2">
          <button
            type="button"
            disabled={isScanningAll}
            onClick={onScanAll}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-colors disabled:opacity-60"
          >
            {isScanningAll ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning All Mails...</span>
              </>
            ) : (
              <>
                <ScanLine className="w-3.5 h-3.5" />
                <span>Scan Entire Inbox</span>
              </>
            )}
          </button>

          {onOpenCustomScan && (
            <button
              type="button"
              onClick={onOpenCustomScan}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs border border-slate-200 dark:border-slate-650 transition-colors"
            >
              <FilePlus className="w-3.5 h-3.5 text-indigo-500" />
              <span>Scan Custom Payload</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Email ML Breakdown Card */}
      {selectedEmail && analysis && (
        <div className="p-3.5 mb-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Active Threat Signals</span>
            <Badge variant={selectedBadgeMeta.variant} size="xs">
              {analysis.risk_level}
            </Badge>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Risk Score:</span>
              <span className="font-bold text-slate-900 dark:text-white">{analysis.risk_score.toFixed(1)}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Model Confidence:</span>
              <span className="font-bold text-slate-900 dark:text-white">{(analysis.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>IP Destination:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{analysis.features.has_ip_url ? 'Yes (Threat)' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>URL Shortener:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{analysis.features.has_shortener ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Header Spoofing:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{analysis.features.sender_replyto_mismatch ? 'Mismatch' : 'Matching'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Defense Architecture */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
        <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
          Active Defense Engine
        </span>
        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Real-time TF-IDF Vectorization</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Logistic Regression Classifier</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Heuristic Spoofing Detector</span>
        </div>
      </div>
    </aside>
  );
}
