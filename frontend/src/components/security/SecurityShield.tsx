import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon } from 'lucide-react';
import { PhishingAnalysisResponse } from '../../types/phishing';

interface SecurityShieldProps {
  analysis: PhishingAnalysisResponse | null;
  isLoading?: boolean;
}

export const SecurityShield: React.FC<SecurityShieldProps> = ({ analysis, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '14px' }}></div>
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '180px', height: '24px', marginBottom: '8px' }}></div>
            <div className="skeleton" style={{ width: '280px', height: '16px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const { risk_score, risk_level, classification, confidence } = analysis;
  const levelNormalized = (risk_level || 'LOW').toUpperCase();

  // Tier visual mappings based on risk score & level
  let theme = {
    title: 'Verified Safe',
    badgeText: 'Low Risk',
    badgeClass: 'badge-low',
    cardBg: 'var(--safe-green-bg)',
    cardBorder: 'var(--safe-green-border)',
    cardColor: 'var(--safe-green)',
    Icon: ShieldCheck,
    description: 'No malicious indicators or spoofing attempts detected in this email.',
    pulseClass: '',
  };

  if (levelNormalized === 'CRITICAL' || risk_score > 80) {
    theme = {
      title: 'Critical Phishing Alert',
      badgeText: 'Critical Threat',
      badgeClass: 'badge-critical',
      cardBg: 'var(--critical-red-bg)',
      cardBorder: 'var(--critical-red-border)',
      cardColor: 'var(--critical-red)',
      Icon: AlertOctagon,
      description: 'High-severity malicious phishing attempt detected. Do NOT click any links or provide credentials.',
      pulseClass: 'pulse-critical',
    };
  } else if (levelNormalized === 'HIGH' || risk_score > 60) {
    theme = {
      title: 'Suspicious Email Warning',
      badgeText: 'High Risk',
      badgeClass: 'badge-high',
      cardBg: 'var(--warning-orange-bg)',
      cardBorder: 'var(--warning-orange-border)',
      cardColor: 'var(--warning-orange)',
      Icon: ShieldAlert,
      description: 'Multiple suspicious indicators flagged. Proceed with extreme caution.',
      pulseClass: '',
    };
  } else if (levelNormalized === 'MEDIUM' || risk_score > 30) {
    theme = {
      title: 'Use Caution',
      badgeText: 'Medium Risk',
      badgeClass: 'badge-medium',
      cardBg: 'var(--caution-yellow-bg)',
      cardBorder: 'var(--caution-yellow-border)',
      cardColor: 'var(--caution-yellow)',
      Icon: AlertTriangle,
      description: 'Contains unusual patterns or unverified sender details. Verify authenticity.',
      pulseClass: '',
    };
  }

  const { Icon } = theme;

  return (
    <div
      className={`glass-panel ${theme.pulseClass}`}
      style={{
        padding: '20px 24px',
        marginBottom: '20px',
        background: theme.cardBg,
        borderColor: theme.cardBorder,
        borderWidth: '1.5px',
        boxShadow: levelNormalized === 'CRITICAL' ? '0 10px 30px rgba(239, 68, 68, 0.2)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Left: Icon and Shield Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: `1px solid ${theme.cardBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.cardColor,
            }}
          >
            <Icon size={32} strokeWidth={2.2} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>{theme.title}</h3>
              <span className={`badge ${theme.badgeClass}`}>{theme.badgeText}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '520px' }}>
              {theme.description}
            </p>
          </div>
        </div>

        {/* Right: Metrics Pills (Risk Score, Classification, Confidence) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Risk Score Pill */}
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
              minWidth: '95px',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
              Risk Score
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: theme.cardColor, fontFamily: 'Outfit' }}>
              {risk_score}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/100</span>
            </span>
          </div>

          {/* Classification Pill */}
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
              minWidth: '105px',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
              Classification
            </span>
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: classification === 'phishing' ? 'var(--critical-red)' : 'var(--safe-green)',
                textTransform: 'capitalize',
              }}
            >
              {classification}
            </span>
          </div>

          {/* Confidence Pill */}
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
              minWidth: '95px',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
              Confidence
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f3f4f6' }}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
