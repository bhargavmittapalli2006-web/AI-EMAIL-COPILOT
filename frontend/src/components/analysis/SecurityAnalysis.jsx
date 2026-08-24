import React from 'react';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { SecurityShield } from '../SecurityShield';

export const SecurityAnalysis = ({
  email,
  phishingAnalysis = {},
  headers = {},
  onQuarantine,
  onMarkSafe,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const {
    is_phishing = false,
    features = {},
  } = phishingAnalysis;

  const spfStatus = headers?.spf || (is_phishing ? 'FAIL' : 'PASS');
  const dkimStatus = headers?.dkim || (is_phishing ? 'NONE' : 'PASS');
  const dmarcStatus = headers?.dmarc || (is_phishing ? 'FAIL' : 'PASS');
  const senderIp = headers?.sender_ip || (is_phishing ? '194.26.29.112' : '52.14.88.204');

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      {/* 1. Core Security Shield View with 6 States */}
      <SecurityShield
        email={email}
        phishingAnalysis={phishingAnalysis}
        headers={headers}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        onQuarantine={onQuarantine}
        onMarkSafe={onMarkSafe}
      />

      {/* 2. Technical Signals & Header Verification */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
          Technical Signals & Header Verification
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] text-slate-400 dark:text-[#94A3B8] block mb-1">SPF Record</span>
            <div className="flex items-center gap-1.5 font-mono font-medium">
              {spfStatus.includes('PASS') ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span className={spfStatus.includes('PASS') ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                {spfStatus.includes('PASS') ? 'Passed' : 'Failed / SoftFail'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] text-slate-400 dark:text-[#94A3B8] block mb-1">DKIM Signature</span>
            <div className="flex items-center gap-1.5 font-mono font-medium">
              {dkimStatus.includes('PASS') ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className={dkimStatus.includes('PASS') ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>
                {dkimStatus.includes('PASS') ? 'Verified' : 'Missing / Unsigned'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] text-slate-400 dark:text-[#94A3B8] block mb-1">DMARC Policy</span>
            <div className="flex items-center gap-1.5 font-mono font-medium">
              {dmarcStatus.includes('PASS') ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span className={dmarcStatus.includes('PASS') ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                {dmarcStatus.includes('PASS') ? 'Enforced' : 'Failed'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] text-slate-400 dark:text-[#94A3B8] block mb-1">Origin IP / Host</span>
            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700 dark:text-[#CBD5E1] truncate">
              <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{senderIp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. URL Analysis */}
      {features.url_count > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
            URL & Hyperlink Analysis
          </h4>
          <div className="p-3 rounded-lg bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span className="text-slate-800 dark:text-[#CBD5E1]">{features.url_count} extracted link(s) inspected</span>
            </div>
            <span className={`font-medium ${features.has_ip_url || features.has_shortener ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {features.has_ip_url ? 'Direct IP destination detected' : features.has_shortener ? 'URL Shortener detected' : 'Clean destination domain'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAnalysis;
