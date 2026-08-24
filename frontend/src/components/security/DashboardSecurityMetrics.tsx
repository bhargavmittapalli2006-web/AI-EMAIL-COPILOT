import React from 'react';
import { Mail, ShieldCheck, ShieldAlert, AlertOctagon, Activity } from 'lucide-react';
import { SecurityMetricsSummary } from '../../types/phishing';

interface DashboardSecurityMetricsProps {
  metrics: SecurityMetricsSummary;
}

export const DashboardSecurityMetrics: React.FC<DashboardSecurityMetricsProps> = ({ metrics }) => {
  const { emailsScanned, threatsDetected, safeEmails, criticalThreats, averageRiskScore } = metrics;

  const statCards = [
    {
      title: 'Emails Scanned',
      value: emailsScanned,
      Icon: Mail,
      color: 'var(--accent-blue)',
      bg: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.25)',
    },
    {
      title: 'Safe Emails',
      value: safeEmails,
      Icon: ShieldCheck,
      color: 'var(--safe-green)',
      bg: 'var(--safe-green-bg)',
      border: 'var(--safe-green-border)',
    },
    {
      title: 'Threats Detected',
      value: threatsDetected,
      Icon: ShieldAlert,
      color: 'var(--warning-orange)',
      bg: 'var(--warning-orange-bg)',
      border: 'var(--warning-orange-border)',
    },
    {
      title: 'Critical Threats',
      value: criticalThreats,
      Icon: AlertOctagon,
      color: 'var(--critical-red)',
      bg: 'var(--critical-red-bg)',
      border: 'var(--critical-red-border)',
    },
    {
      title: 'Avg. Risk Score',
      value: `${averageRiskScore}/100`,
      Icon: Activity,
      color: averageRiskScore > 50 ? 'var(--critical-red)' : averageRiskScore > 25 ? 'var(--caution-yellow)' : 'var(--safe-green)',
      bg: 'rgba(255, 255, 255, 0.04)',
      border: 'rgba(255, 255, 255, 0.08)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '24px',
      }}
    >
      {statCards.map((card, idx) => {
        const { Icon } = card;
        return (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              border: `1px solid ${card.border}`,
              background: 'rgba(17, 24, 39, 0.7)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                flexShrink: 0,
              }}
            >
              <Icon size={22} />
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {card.title}
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: card.color, fontFamily: 'Outfit' }}>
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
