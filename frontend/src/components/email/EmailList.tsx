import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, Star, AlertOctagon, Mail } from 'lucide-react';
import { EmailItem } from '../../types/email';

interface EmailListProps {
  emails: EmailItem[];
  selectedEmailId: string | null;
  onSelectEmail: (email: EmailItem) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  onToggleStar,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'threats' | 'safe' | 'starred'>('all');

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'threats') return email.analysis?.is_phishing;
    if (activeTab === 'safe') return email.analysis && !email.analysis.is_phishing;
    if (activeTab === 'starred') return email.isStarred;
    return true;
  });

  const getRiskBadge = (email: EmailItem) => {
    if (!email.analysis) return null;
    const { risk_score, risk_level } = email.analysis;
    const level = (risk_level || 'LOW').toUpperCase();

    if (level === 'CRITICAL' || risk_score > 80) {
      return (
        <span className="badge badge-critical" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
          <AlertOctagon size={12} /> Phish {risk_score}
        </span>
      );
    }
    if (level === 'HIGH' || risk_score > 60) {
      return (
        <span className="badge badge-high" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
          <ShieldAlert size={12} /> Threat {risk_score}
        </span>
      );
    }
    if (level === 'MEDIUM' || risk_score > 30) {
      return (
        <span className="badge badge-medium" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
          Caution {risk_score}
        </span>
      );
    }
    return (
      <span className="badge badge-low" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
        <ShieldCheck size={12} /> Safe
      </span>
    );
  };

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Search Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search email body, sender, or threats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              width: '100%',
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto' }}>
          {(
            [
              { id: 'all', label: 'All Emails', count: emails.length },
              { id: 'threats', label: 'Threats Flagged', count: emails.filter((e) => e.analysis?.is_phishing).length },
              { id: 'safe', label: 'Verified Safe', count: emails.filter((e) => e.analysis && !e.analysis.is_phishing).length },
              { id: 'starred', label: 'Starred', count: emails.filter((e) => e.isStarred).length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  fontSize: '0.7rem',
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Email Item List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {filteredEmails.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Mail size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem' }}>No emails match your filter criteria.</p>
          </div>
        ) : (
          filteredEmails.map((email) => {
            const isSelected = email.id === selectedEmailId;
            return (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  marginBottom: '6px',
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-glow)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--bg-card-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <button
                      onClick={(e) => onToggleStar(email.id, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: email.isStarred ? '#fbbf24' : 'var(--text-muted)',
                        padding: '2px',
                        display: 'flex',
                      }}
                    >
                      <Star size={16} fill={email.isStarred ? '#fbbf24' : 'none'} />
                    </button>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: email.isRead ? 500 : 700,
                        color: email.isRead ? 'var(--text-secondary)' : '#ffffff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {email.senderName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {getRiskBadge(email)}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{email.timestamp}</span>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {email.subject}
                </div>

                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.4,
                  }}
                >
                  {email.preview}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
