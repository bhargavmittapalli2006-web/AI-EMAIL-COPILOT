import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, ShieldAlert, Link, UserX, FileText } from 'lucide-react';
import { PhishingAnalysisResponse } from '../../types/phishing';

interface ThreatDetailsPanelProps {
  analysis: PhishingAnalysisResponse | null;
}

export const ThreatDetailsPanel: React.FC<ThreatDetailsPanelProps> = ({ analysis }) => {
  if (!analysis) return null;

  const [isExpanded, setIsExpanded] = useState<boolean>(
    analysis.is_phishing || (analysis.flagged_reasons && analysis.flagged_reasons.length > 0)
  );

  const { flagged_reasons, features } = analysis;
  const { sender_risk = 0, link_risk = 0, content_risk = 0 } = features || {};

  const getRiskColor = (val: number) => {
    if (val >= 0.7) return 'var(--critical-red)';
    if (val >= 0.4) return 'var(--warning-orange)';
    if (val >= 0.2) return 'var(--caution-yellow)';
    return 'var(--safe-green)';
  };

  return (
    <div
      className="glass-panel"
      style={{
        overflow: 'hidden',
        marginBottom: '24px',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Header / Accordion trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          fontWeight: 600,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={20} color="var(--accent-blue)" />
          <span>Security Threat Breakdown & Feature Analysis</span>
          {flagged_reasons.length > 0 && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'rgba(239, 68, 68, 0.2)',
                color: 'var(--critical-red)',
                fontWeight: 700,
              }}
            >
              {flagged_reasons.length} Flags
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.8rem' }}>{isExpanded ? 'Collapse' : 'Expand Details'}</span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
          {/* 1. Feature Risk Breakdown Meters */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              Vector Risk Analysis
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {/* Sender Risk */}
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <UserX size={15} />
                    <span>Sender Risk</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getRiskColor(sender_risk) }}>
                    {Math.round(sender_risk * 100)}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round(sender_risk * 100)}%`,
                      background: getRiskColor(sender_risk),
                      transition: 'width 0.4s ease',
                    }}
                  ></div>
                </div>
              </div>

              {/* Link Risk */}
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Link size={15} />
                    <span>Link & URL Risk</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getRiskColor(link_risk) }}>
                    {Math.round(link_risk * 100)}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round(link_risk * 100)}%`,
                      background: getRiskColor(link_risk),
                      transition: 'width 0.4s ease',
                    }}
                  ></div>
                </div>
              </div>

              {/* Content Risk */}
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <FileText size={15} />
                    <span>Content & Urgency Risk</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getRiskColor(content_risk) }}>
                    {Math.round(content_risk * 100)}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round(content_risk * 100)}%`,
                      background: getRiskColor(content_risk),
                      transition: 'width 0.4s ease',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Flagged Reasons List */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Detected Threat Indicators ({flagged_reasons.length})
            </h4>

            {flagged_reasons.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  background: 'var(--safe-green-bg)',
                  border: '1px solid var(--safe-green-border)',
                  borderRadius: '10px',
                  color: 'var(--safe-green)',
                  fontSize: '0.875rem',
                }}
              >
                <CheckCircle size={18} />
                <span>All security rule checks passed cleanly. No suspicious heuristics triggered.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {flagged_reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '10px',
                    }}
                  >
                    <AlertCircle size={18} color="var(--critical-red)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: '#fca5a5', lineHeight: 1.5 }}>
                      {reason}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
