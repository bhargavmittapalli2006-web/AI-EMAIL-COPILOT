import React, { useState } from 'react';
import {
  MessageSquare,
  Copy,
  Check,
  RotateCw,
  ShieldAlert,
  Sparkles,
  Briefcase,
  Smile,
  Zap,
  Info
} from 'lucide-react';
import { ReplySuggestions } from '../../types/reply';

interface ReplySuggestionsPanelProps {
  suggestions: ReplySuggestions | null;
  isLoading: boolean;
  errorMessage: string | null;
  isPhishing?: boolean;
  riskLevel?: string;
  onRegenerate?: () => void;
}

export const ReplySuggestionsPanel: React.FC<ReplySuggestionsPanelProps> = ({
  suggestions,
  isLoading,
  errorMessage,
  isPhishing = false,
  riskLevel,
  onRegenerate,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string | null, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isBlocked = isPhishing || riskLevel === 'HIGH' || riskLevel === 'CRITICAL' || (suggestions && !suggestions.reply_allowed);

  // 1. Loading State
  if (isLoading) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <Sparkles size={20} color="var(--accent-blue)" className="animate-spin" />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
            Generating AI Reply Suggestions...
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton" style={{ width: '100%', height: '54px', borderRadius: '8px' }}></div>
          <div className="skeleton" style={{ width: '100%', height: '54px', borderRadius: '8px' }}></div>
          <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '8px' }}></div>
        </div>
      </div>
    );
  }

  // 2. Blocked UI State (Phishing / High / Critical Threat)
  if (isBlocked) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          marginBottom: '24px',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={22} color="var(--danger-red)" />
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fca5a5', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Reply Generation Disabled</span>
              <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>Security Block</span>
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#e5e7eb', lineHeight: 1.6, margin: 0 }}>
              AI Email Copilot has blocked reply generation because this email may be malicious or contains high-severity threat indicators. Interacting with suspicious senders or confirming receipt can compromise your security.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Error State
  if (errorMessage && !suggestions) {
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
        }}
      >
        <span style={{ color: '#fca5a5', fontSize: '0.9rem' }}>
          {errorMessage}
        </span>
        {onRegenerate && (
          <button className="btn btn-secondary" onClick={onRegenerate} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            <RotateCw size={14} style={{ marginRight: '6px' }} />
            Retry
          </button>
        )}
      </div>
    );
  }

  // 4. Empty State
  if (!suggestions || !suggestions.reply_allowed) {
    return null;
  }

  const replyCards = [
    {
      key: 'professional',
      title: 'Professional',
      icon: <Briefcase size={16} color="var(--accent-blue)" />,
      badgeColor: 'rgba(59, 130, 246, 0.15)',
      badgeBorder: 'rgba(59, 130, 246, 0.3)',
      text: suggestions.professional_reply,
    },
    {
      key: 'friendly',
      title: 'Friendly',
      icon: <Smile size={16} color="var(--accent-emerald)" />,
      badgeColor: 'rgba(16, 185, 129, 0.15)',
      badgeBorder: 'rgba(16, 185, 129, 0.3)',
      text: suggestions.friendly_reply,
    },
    {
      key: 'concise',
      title: 'Concise',
      icon: <Zap size={16} color="var(--accent-purple)" />,
      badgeColor: 'rgba(168, 85, 247, 0.15)',
      badgeBorder: 'rgba(168, 85, 247, 0.3)',
      text: suggestions.concise_reply,
    },
  ];

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={18} color="var(--accent-blue)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>AI Reply Suggestions</span>
              {suggestions.source === 'fallback' ? (
                <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>Offline Fallback</span>
              ) : (
                <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '0.65rem' }}>
                  Gemini-Powered
                </span>
              )}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Human in the loop: Review, select, and copy a draft. No emails are sent automatically.
            </span>
          </div>
        </div>

        {onRegenerate && (
          <button
            className="btn btn-secondary"
            onClick={onRegenerate}
            disabled={isLoading}
            style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Regenerate</span>
          </button>
        )}
      </div>

      {/* Cautionary Note for Medium Risk */}
      {suggestions.reason && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: '#fde68a',
            fontSize: '0.82rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Info size={16} style={{ flexShrink: 0 }} />
          <span>{suggestions.reason}</span>

        </div>
      )}

      {/* Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {replyCards.map((card) => {
          if (!card.text) return null;
          const isCopied = copiedKey === card.key;

          return (
            <div
              key={card.key}
              style={{
                padding: '16px 18px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: card.badgeColor,
                      border: `1px solid ${card.badgeBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    {card.icon}
                    {card.title}
                  </span>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => handleCopy(card.text, card.key)}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isCopied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isCopied ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)',
                    color: isCopied ? '#6ee7b7' : '#e5e7eb',
                  }}
                  title="Copy to clipboard"
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '0.9rem', color: '#e5e7eb', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {card.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
