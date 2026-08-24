import React from 'react';
import {
  ArrowLeft,
  Archive,
  AlertOctagon,
  Trash2,
  Mail,
  Printer,
  Star,
  CornerUpRight,
  Reply,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame,
  Paperclip,
  Clock,
  Loader2,
  RotateCcw,
  AlertCircle,
  Shield,
  FileSearch,
} from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { getSecurityBadgeMeta } from '../../services/securityMapper';
import { EmailIntelligencePanel } from './EmailIntelligencePanel';
import { ReplySuggestionsPanel } from './ReplySuggestionsPanel';

/**
 * Classical Gmail-style Email Detail View with real ML-10 Security Results, Gemini Intelligence & AI Replies
 */
export function EmailDetail({
  email,
  analysisState = {},
  intelligenceState = {},
  replyState = {},
  onScanNow,
  onRetryIntelligence,
  onRetryReply,
  onBack,
  onDelete,
  onArchive,
  onToggleStar,
  onToggleRead,
  onSpam,
}) {
  if (!email) return null;

  const badgeMeta = getSecurityBadgeMeta(analysisState);
  const status = analysisState.status || 'idle';
  const analysis = analysisState.data || null;

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto">
      {/* Top Action Bar */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <IconButton
            icon={ArrowLeft}
            label="Back to inbox"
            onClick={onBack}
            size="sm"
            className="mr-1"
          />
          <IconButton icon={Archive} label="Archive" onClick={() => onArchive?.(email.id)} size="sm" />
          <IconButton icon={AlertOctagon} label="Report as Spam" onClick={() => onSpam?.(email.id)} size="sm" />
          <IconButton icon={Trash2} label="Delete" onClick={() => onDelete?.(email.id)} size="sm" />
          <span className="h-4 w-px bg-slate-200 dark:bg-slate-750 mx-1" />
          <IconButton icon={Mail} label="Mark as unread" onClick={() => onToggleRead?.(email.id)} size="sm" />
        </div>

        <div className="flex items-center gap-1">
          <IconButton icon={Printer} label="Print email" size="sm" />
          <IconButton
            icon={Star}
            label={email.isStarred ? 'Starred' : 'Not starred'}
            onClick={() => onToggleStar?.(email.id)}
            size="sm"
            className={email.isStarred ? 'text-amber-400' : ''}
          />
        </div>
      </div>

      {/* Main Detail Content */}
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {/* Subject Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            {email.subject}
          </h1>
          {badgeMeta.isScanned ? (
            <Badge variant={badgeMeta.variant} size="sm" dot>
              {badgeMeta.label} ({Math.round(badgeMeta.score)}/100)
            </Badge>
          ) : badgeMeta.isAnalyzing ? (
            <Badge variant="neutral" size="sm">
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
              <span>Scanning ML Model...</span>
            </Badge>
          ) : null}
        </div>

        {/* ========================================================================= */}
        {/* REAL ML-10 SECURITY ASSESSMENT SECTION */}
        {/* ========================================================================= */}
        {status === 'analyzing' && (
          <div className="flex items-center gap-3.5 p-4 mb-6 rounded-xl border border-blue-200 dark:border-sky-900/60 bg-blue-50/60 dark:bg-sky-950/30 text-slate-800 dark:text-slate-200">
            <Loader2 className="w-5 h-5 text-blue-600 dark:text-sky-400 animate-spin shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-slate-900 dark:text-white">
                ML-10 Threat Engine Scanning...
              </span>
              <span className="text-slate-600 dark:text-slate-300">
                Extracting TF-IDF features, inspecting URL destinations, and evaluating sender headers against validated model.
              </span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-start justify-between gap-3.5 p-4 mb-6 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Security Analysis Unavailable</span>
                <span className="text-amber-700 dark:text-amber-300">
                  {analysisState.error || 'Failed to reach ML-10 backend engine. Unknown status != Safe.'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onScanNow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-sm transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Scan</span>
            </button>
          </div>
        )}

        {status === 'idle' && (
          <div className="flex items-center justify-between gap-3.5 p-3.5 mb-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2.5">
              <FileSearch className="w-4 h-4 text-slate-400" />
              <span>This email has not been analyzed yet. Run ML inference to verify security.</span>
            </div>
            <button
              type="button"
              onClick={onScanNow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-medium text-xs shadow-sm transition-colors shrink-0"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Scan Now</span>
            </button>
          </div>
        )}

        {status === 'completed' && analysis && (
          <div
            className={`p-4 mb-6 rounded-xl border text-xs shadow-sm ${
              analysis.is_phishing || analysis.risk_level === 'CRITICAL'
                ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-100'
                : analysis.risk_level === 'HIGH'
                ? 'bg-orange-50/80 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/60 text-orange-950 dark:text-orange-100'
                : analysis.risk_level === 'MEDIUM'
                ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-100'
                : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-100'
            }`}
          >
            {/* Header: Verdict, Score Gauge & Level */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-current/10">
              <div className="flex items-center gap-2.5">
                {analysis.is_phishing || analysis.risk_level === 'CRITICAL' ? (
                  <Flame className="w-5 h-5 text-rose-600 dark:text-rose-400 stroke-[2.2]" />
                ) : analysis.risk_level === 'HIGH' ? (
                  <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400 stroke-[2.2]" />
                ) : analysis.risk_level === 'MEDIUM' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                )}
                <div>
                  <span className="font-bold text-sm block leading-none">
                    {analysis.is_phishing ? 'Phishing Threat Detected' : 'Email Security Verified'}
                  </span>
                  <span className="text-[11px] opacity-80 mt-0.5 block">
                    Classification: {analysis.classification.toUpperCase()} • Confidence: {(analysis.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 block">
                    Threat Risk Score
                  </span>
                  <span className="text-base font-extrabold tracking-tight">
                    {analysis.risk_score.toFixed(1)} / 100
                  </span>
                </div>
                <Badge variant={badgeMeta.variant} size="md">
                  {analysis.risk_level}
                </Badge>
              </div>
            </div>

            {/* Flagged Threat Reasons (if any) */}
            {analysis.flagged_reasons && analysis.flagged_reasons.length > 0 && (
              <div className="pt-3">
                <span className="font-bold block mb-1.5 text-slate-900 dark:text-white">
                  Flagged Threat Indicators:
                </span>
                <ul className="space-y-1.5 pl-1">
                  {analysis.flagged_reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantitative Feature Signals Grid */}
            {analysis.features && (
              <div className="pt-3 mt-3 border-t border-current/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded bg-black/5 dark:bg-white/5">
                  <span className="opacity-70 block text-[10px]">Sender Risk</span>
                  <span className="font-bold text-xs">{analysis.features.sender_risk.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded bg-black/5 dark:bg-white/5">
                  <span className="opacity-70 block text-[10px]">Hyperlink Risk</span>
                  <span className="font-bold text-xs">{analysis.features.link_risk.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded bg-black/5 dark:bg-white/5">
                  <span className="opacity-70 block text-[10px]">Content Urgency</span>
                  <span className="font-bold text-xs">{analysis.features.content_risk.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded bg-black/5 dark:bg-white/5">
                  <span className="opacity-70 block text-[10px]">Header Match</span>
                  <span className="font-bold text-xs">
                    {analysis.features.sender_replyto_mismatch === 1 ? 'Spoofed Mismatch' : 'Verified Match'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* GEMINI EMAIL INTELLIGENCE PANEL (ML-11) */}
        {/* ========================================================================= */}
        <EmailIntelligencePanel
          intelligenceState={intelligenceState}
          analysisState={analysisState}
          onRetry={onRetryIntelligence}
        />

        {/* ========================================================================= */}
        {/* AI REPLY SUGGESTIONS PANEL (ML-12) */}
        {/* ========================================================================= */}
        <ReplySuggestionsPanel
          replyState={replyState}
          analysisState={analysisState}
          onRetry={onRetryReply}
        />

        {/* Sender & Metadata Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800 mb-6">
          <div className="flex items-start gap-3">
            <Avatar name={email.senderName} size="lg" color={email.avatarColor} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {email.senderName}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  &lt;{email.senderEmail}&gt;
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>to </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {email.recipient || 'me'}
                </span>
                {email.replyTo && email.replyTo !== email.senderEmail && (
                  <span className="ml-2 text-rose-600 dark:text-rose-400 font-medium">
                    (Reply-To: {email.replyTo})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{email.date} at {email.timestamp}</span>
          </div>
        </div>

        {/* Message Body */}
        <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line select-text mb-8">
          {email.body}
        </div>

        {/* Attachment Card Placeholder if applicable */}
        {email.hasAttachment && (
          <div className="p-4 mb-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-sky-950 flex items-center justify-center text-blue-600 dark:text-sky-400">
                <Paperclip className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <span className="font-semibold block truncate text-slate-900 dark:text-slate-100">
                  Attached_Document.pdf
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Scanned with ML Engine
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Footer Buttons */}
        <div className="flex items-center gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Reply className="w-4 h-4" />
            <span>Reply</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <CornerUpRight className="w-4 h-4" />
            <span>Forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
