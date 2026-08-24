import React from 'react';
import { 
  Sparkles, 
  ListChecks, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight,
  Info,
  RotateCw
} from 'lucide-react';
import { EmailIntelligence } from '../../types/intelligence';

interface EmailIntelligencePanelProps {
  intelligence: EmailIntelligence | null;
  isLoading: boolean;
  errorMessage: string | null;
  isPhishing?: boolean;
  onRetry?: () => void;
}

export const EmailIntelligencePanel: React.FC<EmailIntelligencePanelProps> = ({
  intelligence,
  isLoading,
  errorMessage,
  isPhishing = false,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <Sparkles size={20} color="var(--accent-purple)" className="animate-spin" />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
            Generating AI Email Intelligence...
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton" style={{ width: '90%', height: '18px' }}></div>
          <div className="skeleton" style={{ width: '75%', height: '18px' }}></div>
          <div className="skeleton" style={{ width: '60%', height: '18px' }}></div>
        </div>
      </div>
    );
  }

  if (errorMessage && !intelligence) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '18px 24px',
          marginBottom: '24px',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          background: 'rgba(239, 68, 68, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} color="var(--warning-orange)" />
          <div>
            <strong style={{ color: '#ffffff', fontSize: '0.9rem', display: 'block' }}>
              AI insights temporarily unavailable
            </strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {errorMessage}
            </span>
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCw size={12} />
            <span>Retry AI Analysis</span>
          </button>
        )}
      </div>
    );
  }

  if (!intelligence) {
    return null;
  }

  const { summary, action_items, key_points, risk_explanation, recommended_actions } = intelligence;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* 1. Header with AI Sparkle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.2)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-purple)',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              AI Email Intelligence
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Powered by Gemini & Security ML
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            padding: '4px 10px',
            borderRadius: '999px',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            color: '#d8b4fe',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Synthesized Insights
        </span>
      </div>

      {/* 2. Executive Summary */}
      <div style={{ marginBottom: '22px' }}>
        <h4
          style={{
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Info size={14} color="var(--accent-blue)" />
          <span>Executive Summary</span>
        </h4>
        <p
          style={{
            fontSize: '0.92rem',
            lineHeight: 1.65,
            color: '#f3f4f6',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '14px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {summary}
        </p>
      </div>

      {/* 3. Action Items and Key Points Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '18px',
          marginBottom: '22px',
        }}
      >
        {/* Left Column: Action Items */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <h4
            style={{
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ListChecks size={14} color="var(--accent-purple)" />
            <span>Action Items ({action_items.length})</span>
          </h4>

          {action_items.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No immediate tasks or deadlines detected.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {action_items.map((item, idx) => {
                const isHigh = item.priority === 'high';
                const isMed = item.priority === 'medium';
                const priBg = isHigh
                  ? 'rgba(239, 68, 68, 0.2)'
                  : isMed
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(59, 130, 246, 0.2)';
                const priColor = isHigh
                  ? 'var(--critical-red)'
                  : isMed
                  ? 'var(--caution-yellow)'
                  : 'var(--accent-blue)';
                const priBorder = isHigh
                  ? 'var(--critical-red-border)'
                  : isMed
                  ? 'var(--caution-yellow-border)'
                  : 'rgba(59, 130, 246, 0.3)';

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: priBg,
                        color: priColor,
                        border: `1px solid ${priBorder}`,
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      {item.priority}
                    </span>
                    <span style={{ fontSize: '0.84rem', color: '#e5e7eb', lineHeight: 1.4 }}>
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Key Points */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <h4
            style={{
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle size={14} color="var(--safe-green)" />
            <span>Key Points ({key_points.length})</span>
          </h4>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {key_points.map((pt, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.84rem',
                  color: '#e5e7eb',
                  lineHeight: 1.4,
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--accent-purple)',
                    marginTop: '6px',
                    flexShrink: 0,
                  }}
                />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Risk Explanation Banner */}
      <div
        style={{
          padding: '14px 18px',
          borderRadius: '10px',
          background: isPhishing ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.08)',
          border: `1px solid ${isPhishing ? 'var(--critical-red-border)' : 'var(--safe-green-border)'}`,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        {isPhishing ? (
          <ShieldAlert size={20} color="var(--critical-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
        ) : (
          <CheckCircle size={20} color="var(--safe-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
        )}
        <div>
          <strong
            style={{
              fontSize: '0.85rem',
              color: isPhishing ? 'var(--critical-red)' : 'var(--safe-green)',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            AI Security Explanation:
          </strong>
          <p style={{ fontSize: '0.85rem', color: '#e5e7eb', lineHeight: 1.5, margin: 0 }}>
            {risk_explanation}
          </p>
        </div>
      </div>

      {/* 5. Recommended Actions */}
      {recommended_actions.length > 0 && (
        <div>
          <h4
            style={{
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
              marginBottom: '10px',
            }}
          >
            Recommended Next Steps
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {recommended_actions.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: isPhishing ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${isPhishing ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: isPhishing ? '#fca5a5' : '#f3f4f6',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ArrowRight size={12} color={isPhishing ? 'var(--critical-red)' : 'var(--accent-blue)'} />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
