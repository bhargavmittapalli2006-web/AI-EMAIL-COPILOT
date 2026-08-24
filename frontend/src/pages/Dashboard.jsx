import React from 'react';
import {
  Inbox,
  Star,
  ShieldAlert,
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge, PriorityBadge } from '../components/common/Badge';

export const Dashboard = ({
  emails = [],
  onSelectEmail,
  onNavigateView,
  onToggleAction,
}) => {
  const totalEmails = emails.length;
  const importantEmails = emails.filter(
    (e) => e.priority_analysis?.priority_level === 'HIGH'
  );
  const threatEmails = emails.filter((e) => e.phishing_analysis?.is_phishing);
  const safeCount = emails.filter((e) => !e.phishing_analysis?.is_phishing).length;
  const suspiciousCount = emails.filter(
    (e) => e.phishing_analysis?.risk_level === 'MEDIUM'
  ).length;
  const criticalCount = emails.filter(
    (e) => e.phishing_analysis?.risk_level === 'CRITICAL' || e.phishing_analysis?.risk_level === 'HIGH'
  ).length;

  const allActions = emails.flatMap((e) =>
    (e.action_items || []).map((act) => ({ ...act, emailId: e.id, emailSubject: e.subject }))
  );
  const pendingActions = allActions.filter((a) => !a.completed);

  // Group deadlines
  const todayDeadlines = allActions.filter((a) =>
    a.deadline?.toLowerCase().includes('today') || a.deadline?.toLowerCase().includes('immediate')
  );
  const upcomingDeadlines = allActions.filter(
    (a) =>
      !a.deadline?.toLowerCase().includes('today') &&
      !a.deadline?.toLowerCase().includes('immediate') &&
      a.deadline
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
          Good morning, Alex
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#94A3B8]">
          Your inbox is under control. All incoming messages analyzed across 4 AI engines.
        </p>
      </div>

      {/* 4 Compact Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Emails Analyzed"
          value={totalEmails}
          subtext="Active in mailbox"
          icon={Inbox}
          color="default"
          onClick={() => onNavigateView('inbox')}
        />
        <StatCard
          title="Important"
          value={importantEmails.length}
          subtext="Requires triage"
          icon={Star}
          color="primary"
          onClick={() => onNavigateView('important')}
        />
        <StatCard
          title="Threats Detected"
          value={threatEmails.length}
          subtext={`${emails.filter((e) => e.is_quarantined).length} quarantined`}
          icon={ShieldAlert}
          color={threatEmails.length > 0 ? 'danger' : 'success'}
          onClick={() => onNavigateView('security')}
        />
        <StatCard
          title="Pending Actions"
          value={pendingActions.length}
          subtext="Extracted to-dos"
          icon={CheckSquare}
          color="warning"
          onClick={() => onNavigateView('actions')}
        />
      </div>

      {/* Main 2-Column Overview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Priority Overview & Security Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Priority Overview */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  Priority Overview
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  High impact emails requiring your attention
                </p>
              </div>
              <button
                onClick={() => onNavigateView('important')}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {importantEmails.slice(0, 3).map((email) => (
                <div
                  key={email.id}
                  onClick={() => onSelectEmail(email)}
                  className="py-3 flex items-center justify-between gap-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-[#151E2E] rounded-lg px-2 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                        {email.sender_name || email.sender}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-[#94A3B8] font-mono">
                        {email.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-[#CBD5E1] truncate font-medium">
                      {email.subject}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge
                      level={email.priority_analysis?.priority_level}
                      score={email.priority_analysis?.priority_score}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Overview */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  Security Overview
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  Threat distribution across incoming messages
                </p>
              </div>
              <button
                onClick={() => onNavigateView('security')}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Security Center
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clean 3-Tier Security Bar (Safe / Suspicious / Phishing) */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 block">Safe</span>
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">{safeCount}</span>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                  <span className="text-xs font-medium text-amber-800 dark:text-amber-300 block">Suspicious</span>
                  <span className="text-xl font-bold text-amber-700 dark:text-amber-400 font-mono">{suspiciousCount}</span>
                </div>
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                  <span className="text-xs font-medium text-rose-800 dark:text-rose-300 block">Phishing</span>
                  <span className="text-xl font-bold text-rose-700 dark:text-rose-400 font-mono">{criticalCount}</span>
                </div>
              </div>

              {/* Progress Bar Visual */}
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${totalEmails ? (safeCount / totalEmails) * 100 : 100}%` }}
                  className="bg-emerald-500"
                />
                <div
                  style={{ width: `${totalEmails ? (suspiciousCount / totalEmails) * 100 : 0}%` }}
                  className="bg-amber-500"
                />
                <div
                  style={{ width: `${totalEmails ? (criticalCount / totalEmails) * 100 : 0}%` }}
                  className="bg-rose-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Actions & Upcoming Deadlines */}
        <div className="lg:col-span-5 space-y-6">
          {/* Today's Actions */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  Today's Actions
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  {pendingActions.length} task(s) remaining
                </p>
              </div>
              <button
                onClick={() => onNavigateView('actions')}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                All tasks
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {allActions.slice(0, 4).map((action) => (
                <div
                  key={action.id}
                  onClick={() => onToggleAction && onToggleAction(action.emailId, action.id)}
                  className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex items-start gap-2.5 ${
                    action.completed
                      ? 'bg-slate-50 dark:bg-[#151E2E]/40 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-slate-50 dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {action.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-xs leading-tight block ${
                        action.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-[#F8FAFC] font-medium'
                      }`}
                    >
                      {action.title}
                    </span>
                    {action.deadline && (
                      <span className="text-[10px] text-slate-400 dark:text-[#94A3B8] mt-0.5 block font-mono">
                        Due: {action.deadline}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  Upcoming Deadlines
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  Calendar milestones detected from threads
                </p>
              </div>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2 text-xs">
              {todayDeadlines.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-300 mb-1">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    <span>Today & Immediate</span>
                  </div>
                  <div className="space-y-1 text-slate-700 dark:text-[#CBD5E1]">
                    {todayDeadlines.slice(0, 2).map((d) => (
                      <div key={d.id} className="truncate">• {d.title}</div>
                    ))}
                  </div>
                </div>
              )}

              {upcomingDeadlines.slice(0, 2).map((d) => (
                <div
                  key={d.id}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <span className="text-slate-800 dark:text-[#F8FAFC] font-medium truncate max-w-[220px]">
                    {d.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-mono flex-shrink-0">
                    {d.deadline}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
