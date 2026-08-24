import React from 'react';
import { ShieldCheck, ShieldAlert, Zap, Activity, CheckSquare } from 'lucide-react';

export const MetricsBar = ({ emails = [] }) => {
  const totalCount = emails.length;
  const threatCount = emails.filter((e) => e.phishing_analysis?.is_phishing).length;
  const highPriorityCount = emails.filter(
    (e) => e.priority_analysis?.priority_level === 'HIGH'
  ).length;

  const quarantinedCount = emails.filter((e) => e.is_quarantined).length;

  const avgRiskScore = totalCount > 0
    ? (emails.reduce((acc, curr) => acc + (curr.phishing_analysis?.risk_score || 0), 0) / totalCount).toFixed(1)
    : '0.0';

  const totalActions = emails.reduce(
    (acc, curr) => acc + (curr.action_items?.length || 0),
    0
  );
  const completedActions = emails.reduce(
    (acc, curr) => acc + (curr.action_items?.filter((a) => a.completed).length || 0),
    0
  );

  const metrics = [
    {
      label: 'Emails Analyzed',
      value: totalCount,
      subtext: 'Across all mailboxes',
      icon: Activity,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20',
      bg: 'bg-cyan-500/5',
    },
    {
      label: 'Threats Intercepted',
      value: threatCount,
      subtext: `${quarantinedCount} quarantined`,
      icon: ShieldAlert,
      color: 'text-red-400',
      border: 'border-red-500/20',
      bg: 'bg-red-500/5',
    },
    {
      label: 'High Priority Items',
      value: highPriorityCount,
      subtext: 'Requires triage',
      icon: Zap,
      color: 'text-indigo-400',
      border: 'border-indigo-500/20',
      bg: 'bg-indigo-500/5',
    },
    {
      label: 'Avg Phishing Risk',
      value: `${avgRiskScore}/100`,
      subtext: Number(avgRiskScore) > 40 ? 'Elevated threat posture' : 'Nominal posture',
      icon: ShieldCheck,
      color: Number(avgRiskScore) > 40 ? 'text-amber-400' : 'text-emerald-400',
      border: Number(avgRiskScore) > 40 ? 'border-amber-500/20' : 'border-emerald-500/20',
      bg: Number(avgRiskScore) > 40 ? 'bg-amber-500/5' : 'bg-emerald-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border ${m.border} ${m.bg} glass-panel-subtle flex items-center justify-between transition-all hover:border-opacity-50`}
          >
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                {m.label}
              </p>
              <h3 className={`text-xl sm:text-2xl font-mono font-bold mt-0.5 tracking-tight ${m.color}`}>
                {m.value}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{m.subtext}</p>
            </div>
            <div className={`p-2.5 rounded-xl bg-cyber-850 border border-white/5 ${m.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
