import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge } from '../components/common/Badge';

export const Security = ({
  emails = [],
  onSelectEmail,
  onQuarantine,
  onMarkSafe,
}) => {
  const threatEmails = emails.filter((e) => e.phishing_analysis?.is_phishing);
  const quarantinedEmails = emails.filter((e) => e.is_quarantined);
  const cleanEmails = emails.filter((e) => !e.phishing_analysis?.is_phishing);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Phishing & Threat Intelligence Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Real-time heuristic & ML threat scoring from the security engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Engine: Online (v1.0.0)
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Flagged Threats"
          value={threatEmails.length}
          subtext="Detected in inbox"
          icon={ShieldAlert}
          color={threatEmails.length > 0 ? 'danger' : 'success'}
        />
        <StatCard
          title="Quarantined"
          value={quarantinedEmails.length}
          subtext="Isolated safely"
          icon={Lock}
          color="warning"
        />
        <StatCard
          title="Clean & Safe"
          value={cleanEmails.length}
          subtext="Passed baseline"
          icon={ShieldCheck}
          color="success"
        />
        <StatCard
          title="Model Confidence"
          value="96.8%"
          subtext="Inference certainty"
          icon={FileSearch}
          color="primary"
        />
      </div>

      {/* Threats Table / Feed */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Active Security Incidents & Threat Messages ({threatEmails.length})
          </h3>
          <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
            Click any row to open full technical diagnostics
          </span>
        </div>

        {threatEmails.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-medium text-slate-700 dark:text-slate-300">All clear! No active threats in mailbox.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {threatEmails.map((email) => {
              const analysis = email.phishing_analysis || {};
              return (
                <div
                  key={email.id}
                  onClick={() => onSelectEmail(email)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-[#151E2E] cursor-pointer transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        {email.sender_name || email.sender}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-[#94A3B8] font-mono">
                        &lt;{email.sender}&gt;
                      </span>
                      <RiskBadge level={analysis.risk_level} score={analysis.risk_score} size="sm" />
                    </div>

                    <p className="text-xs font-medium text-slate-800 dark:text-[#CBD5E1] truncate">
                      {email.subject}
                    </p>

                    <div className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                      Primary flag: {analysis.flagged_reasons?.[0] || 'Phishing pattern'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {email.is_quarantined ? (
                      <button
                        onClick={() => onMarkSafe(email.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#151E2E] text-slate-700 dark:text-[#CBD5E1] border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-200 dark:hover:bg-[#1B2638] transition-colors cursor-pointer"
                      >
                        Release
                      </button>
                    ) : (
                      <button
                        onClick={() => onQuarantine(email.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
                      >
                        Quarantine Threat
                      </button>
                    )}

                    <button
                      onClick={() => onSelectEmail(email)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-[#CBD5E1] text-xs font-medium hover:bg-slate-50 dark:hover:bg-[#1B2638] transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Security;
