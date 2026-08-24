import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Star,
  Clock,
  User,
  Mail,
  AlertTriangle,
  FileText,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Layers,
  Globe,
  CornerDownRight,
  Highlighter,
} from 'lucide-react';
import { RiskBadge, PriorityBadge, StatusPill } from '../common/Badge';
import { PhishingPanel } from '../analysis/PhishingPanel';
import { PrioritySummaryPanel } from '../analysis/PrioritySummaryPanel';
import { ActionItemsPanel } from '../analysis/ActionItemsPanel';
import { SuggestedReplyPanel } from '../analysis/SuggestedReplyPanel';
import { EmailViewerSkeleton } from '../common/LoadingSkeleton';

export const EmailViewer = ({
  email,
  isLoading,
  onToggleStar,
  onQuarantine,
  onMarkSafe,
  onToggleAction,
  onSendReply,
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, threat, understanding, actions, reply, raw
  const [highlightThreats, setHighlightThreats] = useState(true);

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto bg-cyber-900/40">
        <EmailViewerSkeleton />
      </main>
    );
  }

  if (!email) {
    return null;
  }

  const isPhishing = email.phishing_analysis?.is_phishing;
  const riskLevel = email.phishing_analysis?.risk_level || 'LOW';
  const riskScore = email.phishing_analysis?.risk_score;
  const isQuarantined = email.is_quarantined;

  const hasSenderMismatch =
    email.reply_to &&
    email.reply_to.trim() !== '' &&
    email.reply_to !== email.sender;

  // Format highlighted email body
  const renderHighlightedBody = () => {
    if (!highlightThreats) {
      return (
        <div className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
          {email.body}
        </div>
      );
    }

    // Split text and highlight URLs and keywords
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const parts = email.body.split(urlRegex);

    return (
      <div className="whitespace-pre-wrap text-sm text-slate-200 font-sans leading-relaxed space-y-2">
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            const isIp = /\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(part);
            const isShort = /bit\.ly|tinyurl/i.test(part);
            return (
              <span
                key={i}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs border mx-1 font-semibold ${
                  isIp || isShort
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}
              >
                <ExternalLink className="w-3 h-3" />
                {part}
                {isIp && <span className="text-[10px] text-red-400 font-bold">[IP URL RISK]</span>}
                {isShort && <span className="text-[10px] text-amber-400 font-bold">[SHORTENER]</span>}
              </span>
            );
          }
          return part;
        })}
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'All-In-One Intelligence', icon: Layers },
    { id: 'threat', label: 'Security & Phishing', icon: ShieldAlert, alert: isPhishing },
    { id: 'understanding', label: 'Summary & Priority', icon: Sparkles },
    { id: 'actions', label: `Actions (${email.action_items?.length || 0})`, icon: Clock },
    { id: 'reply', label: 'Smart Reply', icon: Mail },
  ];

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto bg-cyber-900/40">
      {/* Quarantined Warning Banner */}
      {isQuarantined && (
        <div className="p-3 bg-red-500/20 border-b border-red-500/40 text-red-300 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold">
            <Lock className="w-4 h-4 text-red-400 animate-pulse" />
            <span>EMAIL ISOLATED IN SECURITY QUARANTINE • External links and automated scripts disabled</span>
          </div>
          <button
            onClick={() => onMarkSafe(email.id)}
            className="px-3 py-1 rounded bg-red-500/30 hover:bg-red-500/40 text-white text-xs font-mono font-bold border border-red-500/50 cursor-pointer"
          >
            Release & Mark Safe
          </button>
        </div>
      )}

      {/* Header Container */}
      <div className="p-5 sm:p-6 border-b border-white/10 bg-cyber-850/50 backdrop-blur-md space-y-4">
        {/* Top actions & badges */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <RiskBadge level={riskLevel} score={riskScore} size="md" />
              <PriorityBadge
                level={email.priority_analysis?.priority_level}
                score={email.priority_analysis?.priority_score}
                size="md"
              />
              {email.priority_analysis?.urgency === 'URGENT' && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                  URGENT ACTION
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {email.subject}
            </h2>
          </div>

          {/* Action Button Bar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggleStar(email.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                email.is_starred
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-cyber-800 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title="Star Email"
            >
              <Star className={`w-4 h-4 ${email.is_starred ? 'fill-amber-400' : ''}`} />
            </button>

            {isPhishing && !isQuarantined && (
              <button
                onClick={() => onQuarantine(email.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold shadow-glow-red transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Quarantine Threat</span>
              </button>
            )}

            {!isPhishing && (
              <button
                onClick={() => onMarkSafe(email.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-glow-emerald transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Safe</span>
              </button>
            )}
          </div>
        </div>

        {/* Sender and Email Meta Information */}
        <div className="p-3.5 rounded-xl bg-cyber-900/80 border border-white/5 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            {/* Sender */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-cyber-800 border border-white/10 flex items-center justify-center font-bold text-cyan-400 font-mono">
                {(email.sender_name || email.sender || 'U').charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100 truncate">
                    {email.sender_name || email.sender}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px] truncate">
                    &lt;{email.sender}&gt;
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  To: <span className="text-slate-300">{email.recipient}</span>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5 flex-shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{email.timestamp}</span>
              <span className="text-slate-600">({email.date ? new Date(email.date).toLocaleDateString() : 'Today'})</span>
            </div>
          </div>

          {/* Sender Mismatch Alert */}
          {hasSenderMismatch && (
            <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>
                <strong>Reply-To Mismatch Detected:</strong> Responses will route to{' '}
                <span className="underline font-bold">{email.reply_to}</span> (Spoofing Indicator).
              </span>
            </div>
          )}

          {/* Authentication Security Badges */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] font-mono">
            <span className="text-slate-400">Auth Signals:</span>
            <StatusPill
              status={`SPF: ${email.headers?.spf || 'PASS'}`}
              type={email.headers?.spf?.includes('FAIL') ? 'danger' : 'success'}
            />
            <StatusPill
              status={`DKIM: ${email.headers?.dkim || 'PASS'}`}
              type={email.headers?.dkim?.includes('FAIL') || email.headers?.dkim === 'NONE' ? 'danger' : 'success'}
            />
            <StatusPill
              status={`DMARC: ${email.headers?.dmarc || 'PASS'}`}
              type={email.headers?.dmarc?.includes('FAIL') || email.headers?.dmarc === 'NONE' ? 'danger' : 'success'}
            />
            {email.headers?.sender_ip && (
              <span className="inline-flex items-center gap-1 text-slate-400 bg-cyber-950 px-2 py-0.5 rounded border border-white/5">
                <Globe className="w-3 h-3 text-cyan-400" />
                IP: {email.headers.sender_ip} ({email.headers?.location || 'Origin'})
              </span>
            )}
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                    : 'bg-cyber-850/60 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.alert && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Body Content */}
      <div className="p-5 sm:p-6 space-y-6 max-w-7xl">
        {/* Email Body Card */}
        <div className="rounded-2xl border border-white/10 bg-cyber-850/60 glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                Email Body Content
              </h3>
            </div>

            <button
              onClick={() => setHighlightThreats(!highlightThreats)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                highlightThreats
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-cyber-900 text-slate-400 border-white/5 hover:text-slate-200'
              }`}
            >
              <Highlighter className="w-3 h-3" />
              <span>{highlightThreats ? 'Security Signals: ON' : 'Security Signals: OFF'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-cyber-900/80 border border-white/5">
            {renderHighlightedBody()}
          </div>
        </div>

        {/* Tab View: Overview (All panels displayed logically) */}
        {(activeTab === 'overview' || activeTab === 'threat') && (
          <PhishingPanel phishingAnalysis={email.phishing_analysis} />
        )}

        {(activeTab === 'overview' || activeTab === 'understanding') && (
          <PrioritySummaryPanel
            priorityAnalysis={email.priority_analysis}
            understanding={email.understanding}
          />
        )}

        {(activeTab === 'overview' || activeTab === 'actions') && (
          <ActionItemsPanel
            actionItems={email.action_items || []}
            emailId={email.id}
            onToggleAction={onToggleAction}
          />
        )}

        {(activeTab === 'overview' || activeTab === 'reply') && (
          <SuggestedReplyPanel
            suggestedReplies={email.suggested_replies || []}
            senderName={email.sender_name || email.sender}
            onSendReply={onSendReply}
          />
        )}
      </div>
    </main>
  );
};
