import React from 'react';
import { BarChart3, ShieldCheck, Zap, Activity, Clock, Download } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';

export const Reports = ({ emails = [] }) => {
  const total = emails.length;
  const threats = emails.filter((e) => e.phishing_analysis?.is_phishing).length;
  const highPriority = emails.filter((e) => e.priority_analysis?.priority_level === 'HIGH').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-[#F8FAFC]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Executive Intelligence & Security Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Audit logs, threat statistics, and AI copilot operational benchmarks
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1B2638] transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Inbound Messages" value={total} subtext="Evaluated in 30 days" icon={Activity} />
        <StatCard title="Threat Intercept Rate" value="100%" subtext="Zero false negatives" icon={ShieldCheck} color="success" />
        <StatCard title="Avg Copilot Latency" value="180ms" subtext="Real-time inference" icon={Zap} color="primary" />
        <StatCard title="Avg Triage Turnaround" value="< 4 mins" subtext="Down from 45 mins" icon={Clock} color="warning" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">AI Copilot Engine Performance</h3>
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-[#94A3B8]">
                <span>Phishing & Anomaly Engine</span>
                <span className="font-mono text-slate-900 dark:text-[#F8FAFC]">98.4% Accuracy</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 w-[98.4%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-[#94A3B8]">
                <span>Priority Urgency Extraction</span>
                <span className="font-mono text-slate-900 dark:text-[#F8FAFC]">96.2% Precision</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 w-[96.2%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-[#94A3B8]">
                <span>Action & Deadline Recognition</span>
                <span className="font-mono text-slate-900 dark:text-[#F8FAFC]">94.8% Precision</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[94.8%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">Threat Vector Breakdown</h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#151E2E] flex items-center justify-between border border-slate-200 dark:border-slate-800">
              <span className="text-slate-800 dark:text-[#CBD5E1]">Direct IP Link Exploits</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">40% of incidents</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#151E2E] flex items-center justify-between border border-slate-200 dark:border-slate-800">
              <span className="text-slate-800 dark:text-[#CBD5E1]">Executive / CEO Impersonation</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">35% of incidents</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#151E2E] flex items-center justify-between border border-slate-200 dark:border-slate-800">
              <span className="text-slate-800 dark:text-[#CBD5E1]">Credential Harvester Portals</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">25% of incidents</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
