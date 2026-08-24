import React, { useEffect, useState, useCallback } from 'react';
import { 
  AlertTriangle, 
  RotateCw, 
  ExternalLink, 
  ShieldCheck, 
  UserX, 
  Star,
  Lock,
  Sparkles
} from 'lucide-react';
import { EmailItem } from '../../types/email';
import { PhishingAnalysisResponse } from '../../types/phishing';
import { EmailIntelligence } from '../../types/intelligence';
import { analyzeEmail } from '../../services/phishingService';
import { getEmailIntelligence } from '../../services/geminiService';
import { SecurityShield } from '../security/SecurityShield';
import { ThreatDetailsPanel } from '../security/ThreatDetailsPanel';
import { EmailIntelligencePanel } from './EmailIntelligencePanel';
import { ReplySuggestionsPanel } from './ReplySuggestionsPanel';
import { ReplySuggestions } from '../../types/reply';
import { fetchReplySuggestions } from '../../services/replyService';

interface EmailDetailProps {
  email: EmailItem | null;
  isDemoMode: boolean;
  onUpdateEmailAnalysis: (emailId: string, analysis: PhishingAnalysisResponse) => void;
  onUpdateEmailIntelligence: (emailId: string, intelligence: EmailIntelligence) => void;
  onToggleStar: (id: string) => void;
  onToggleDemoMode: () => void;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  isDemoMode,
  onUpdateEmailAnalysis,
  onUpdateEmailIntelligence,
  onToggleStar,
  onToggleDemoMode,
}) => {
  const [analysis, setAnalysis] = useState<PhishingAnalysisResponse | null>(email?.analysis || null);
  const [intelligence, setIntelligence] = useState<EmailIntelligence | null>(email?.intelligence || null);
  const [replies, setReplies] = useState<ReplySuggestions | null>(null);

  const [isPhishingLoading, setIsPhishingLoading] = useState<boolean>(false);
  const [isIntelligenceLoading, setIsIntelligenceLoading] = useState<boolean>(false);
  const [isReplyLoading, setIsReplyLoading] = useState<boolean>(false);

  const [phishingError, setPhishingError] = useState<string | null>(null);
  const [intelligenceError, setIntelligenceError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Generate AI Reply Suggestions
  const runReplies = useCallback(async (targetEmail: EmailItem, currentAnalysis: PhishingAnalysisResponse | null) => {
    setIsReplyLoading(true);
    setReplyError(null);

    try {
      const result = await fetchReplySuggestions(
        {
          subject: targetEmail.subject,
          sender: targetEmail.sender,
          body: targetEmail.body,
          reply_to: targetEmail.reply_to || '',
          is_phishing: currentAnalysis?.is_phishing,
          risk_score: currentAnalysis?.risk_score,
          risk_level: currentAnalysis?.risk_level,
          links: targetEmail.links || [],
        },
        isDemoMode
      );
      setReplies(result);
    } catch (err: any) {
      setReplyError(err.message || 'Reply suggestions unavailable.');
    } finally {
      setIsReplyLoading(false);
    }
  }, [isDemoMode]);

  // Run Gemini Intelligence once phishing analysis is available
  const runIntelligence = useCallback(async (targetEmail: EmailItem, currentAnalysis: PhishingAnalysisResponse | null) => {
    setIsIntelligenceLoading(true);
    setIntelligenceError(null);

    try {
      const result = await getEmailIntelligence(
        targetEmail.id,
        {
          subject: targetEmail.subject,
          sender: targetEmail.sender,
          body: targetEmail.body,
          reply_to: targetEmail.reply_to || '',
          is_phishing: currentAnalysis?.is_phishing,
          risk_score: currentAnalysis?.risk_score,
          risk_level: currentAnalysis?.risk_level,
          flagged_reasons: currentAnalysis?.flagged_reasons || [],
        },
        isDemoMode
      );

      setIntelligence(result);
      onUpdateEmailIntelligence(targetEmail.id, result);
    } catch (err: any) {
      setIntelligenceError(err.message || 'AI insights temporarily unavailable.');
    } finally {
      setIsIntelligenceLoading(false);
    }
  }, [isDemoMode, onUpdateEmailIntelligence]);


  // Run full email scan: Phishing Detection -> Gemini Intelligence
  const runScan = useCallback(async (targetEmail: EmailItem) => {
    setIsPhishingLoading(true);
    setPhishingError(null);

    let latestAnalysis: PhishingAnalysisResponse | null = targetEmail.analysis || null;

    try {
      if (!latestAnalysis) {
        latestAnalysis = await analyzeEmail(
          {
            subject: targetEmail.subject,
            sender: targetEmail.sender,
            body: targetEmail.body,
            reply_to: targetEmail.reply_to || '',
            links: targetEmail.links || [],
          },
          isDemoMode
        );

        setAnalysis(latestAnalysis);
        onUpdateEmailAnalysis(targetEmail.id, latestAnalysis);
      } else {
        setAnalysis(latestAnalysis);
      }
    } catch (err: any) {
      setPhishingError(err.message || 'Security service unavailable');
    } finally {
      setIsPhishingLoading(false);
    }

    // Now trigger Gemini Intelligence (even if phishing analysis failed, fallback intelligence can run)
    if (!targetEmail.intelligence) {
      await runIntelligence(targetEmail, latestAnalysis);
    } else {
      setIntelligence(targetEmail.intelligence);
    }

    // Trigger AI Reply Suggestions
    await runReplies(targetEmail, latestAnalysis);
  }, [isDemoMode, onUpdateEmailAnalysis, runIntelligence, runReplies]);

  // Synchronize on email selection or demo mode change
  useEffect(() => {
    if (!email) {
      setAnalysis(null);
      setIntelligence(null);
      setReplies(null);
      setPhishingError(null);
      setIntelligenceError(null);
      setReplyError(null);
      return;
    }

    setAnalysis(email.analysis || null);
    setIntelligence(email.intelligence || null);
    setReplies(null);
    setPhishingError(null);
    setIntelligenceError(null);
    setReplyError(null);

    runScan(email);
  }, [email?.id, isDemoMode]);


  if (!email) {
    return (
      <div
        className="glass-panel"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-blue)',
            marginBottom: '18px',
          }}
        >
          <ShieldCheck size={42} />
        </div>
        <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '8px' }}>
          Select an Email to Inspect
        </h3>
        <p style={{ fontSize: '0.875rem', maxWidth: '420px', lineHeight: 1.6 }}>
          The AI Security Engine will automatically extract hyperlinks, sender headers, and content vectors to calculate real-time threat scores and Gemini intelligence.
        </p>
      </div>
    );
  }

  const senderDomain = email.sender.split('@')[1] || email.sender;
  const replyToDomain = email.reply_to ? email.reply_to.split('@')[1] || email.reply_to : '';
  const isSenderMismatch = replyToDomain && senderDomain.toLowerCase() !== replyToDomain.toLowerCase();

  return (
    <div
      className="glass-panel"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 1. Top Action Toolbar */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => onToggleStar(email.id)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: email.isStarred ? '#fbbf24' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <Star size={15} fill={email.isStarred ? '#fbbf24' : 'none'} />
            <span>{email.isStarred ? 'Starred' : 'Star'}</span>
          </button>

          <button
            onClick={() => {
              // Force fresh re-scan
              runScan({ ...email, analysis: undefined, intelligence: undefined });
            }}
            disabled={isPhishingLoading || isIntelligenceLoading}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              background: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <RotateCw size={14} className={isPhishingLoading || isIntelligenceLoading ? 'animate-spin' : ''} />
            <span>{isPhishingLoading ? 'Scanning Security...' : isIntelligenceLoading ? 'Generating AI...' : 'Re-scan Email'}</span>
          </button>
        </div>

        {/* Threat Action Pill */}
        {analysis?.is_phishing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--critical-red)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Lock size={12} /> Auto-Quarantine Active
            </span>
          </div>
        )}
      </div>

      {/* 2. Scrollable Detail Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {/* Phishing Scanning Banner */}
        {isPhishingLoading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: 'var(--accent-blue)',
              marginBottom: '20px',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <Sparkles size={18} className="animate-spin" />
            <span>Analyzing Email Security with Machine Learning & Rule Heuristics...</span>
          </div>
        )}

        {/* Phishing Backend Error Banner */}
        {phishingError && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} color="var(--critical-red)" />
              <div>
                <strong style={{ color: 'var(--critical-red)', display: 'block', fontSize: '0.9rem' }}>
                  Security service unavailable
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{phishingError}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => runScan(email)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                Retry
              </button>
              <button
                onClick={onToggleDemoMode}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  background: 'var(--accent-blue)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                Switch to Demo Mode
              </button>
            </div>
          </div>
        )}

        {/* 1. Security Shield Component */}
        <SecurityShield analysis={analysis} isLoading={isPhishingLoading} />

        {/* 2. Threat Details Panel */}
        <ThreatDetailsPanel analysis={analysis} />

        {/* 3. AI Email Intelligence Panel */}
        <EmailIntelligencePanel
          intelligence={intelligence}
          isLoading={isIntelligenceLoading}
          errorMessage={intelligenceError}
          isPhishing={analysis?.is_phishing}
          onRetry={() => runIntelligence(email, analysis)}
        />

        {/* 4. AI Reply Suggestions Panel */}
        <ReplySuggestionsPanel
          suggestions={replies}
          isLoading={isReplyLoading}
          errorMessage={replyError}
          isPhishing={analysis?.is_phishing}
          riskLevel={analysis?.risk_level}
          onRegenerate={() => runReplies(email, analysis)}
        />

        {/* 5. Email Meta Header */}
        <div
          style={{
            paddingBottom: '20px',
            marginBottom: '20px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', lineHeight: 1.3 }}>
            {email.subject}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Sender Avatar */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: analysis?.is_phishing ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  border: `1px solid ${analysis?.is_phishing ? 'var(--critical-red-border)' : 'rgba(59, 130, 246, 0.3)'}`,
                  color: analysis?.is_phishing ? 'var(--critical-red)' : 'var(--accent-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  fontFamily: 'Outfit',
                }}
              >
                {email.senderName.charAt(0)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{email.senderName}</span>
                  {email.tag && (
                    <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
                      {email.tag}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  From: <span className="mono-font">{email.sender}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {email.timestamp}
            </div>
          </div>

          {/* Reply-To Mismatch Header Banner */}
          {isSenderMismatch && (
            <div
              style={{
                marginTop: '14px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.8rem',
                color: '#fca5a5',
              }}
            >
              <UserX size={16} color="var(--critical-red)" />
              <span>
                <strong>Header Warning:</strong> Responses to this email will be routed to <code className="mono-font">{email.reply_to}</code> instead of the sender address.
              </span>
            </div>
          )}
        </div>

        {/* 5. Email Body Content */}
        <div
          style={{
            fontSize: '0.95rem',
            lineHeight: 1.7,
            color: '#e5e7eb',
            whiteSpace: 'pre-line',
            marginBottom: '30px',
          }}
        >
          {email.body}
        </div>

        {/* 6. Safe Link Inspection Section */}
        {email.links && email.links.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-color)',
              marginBottom: '24px',
            }}
          >
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ExternalLink size={15} />
              <span>Extracted Hyperlinks ({email.links.length})</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {email.links.map((link, idx) => {
                const isIpLink = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(link);
                const isShortener = /bit\.ly|tinyurl\.com|t\.co|goo\.gl/.test(link);
                const isThreat = isIpLink || isShortener;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: isThreat ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isThreat ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`,
                    }}
                  >
                    <span className="mono-font" style={{ fontSize: '0.8rem', color: isThreat ? '#fca5a5' : 'var(--accent-blue)', wordBreak: 'break-all' }}>
                      {link}
                    </span>
                    {isThreat && (
                      <span className="badge badge-critical" style={{ fontSize: '0.65rem', padding: '1px 6px', flexShrink: 0, marginLeft: '8px' }}>
                        {isIpLink ? 'Raw IP Destination' : 'URL Shortener'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
