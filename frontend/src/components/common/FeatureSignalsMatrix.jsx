import React from 'react';
import {
  Link2,
  Globe,
  AlertTriangle,
  Flame,
  KeyRound,
  DollarSign,
  UserX,
  MailCheck,
  Building,
  Hash,
} from 'lucide-react';

export const FeatureSignalsMatrix = ({ features = {} }) => {
  const signalConfigs = [
    {
      key: 'has_ip_url',
      label: 'IP-based URL',
      val: features.has_ip_url ? 'DETECTED' : 'CLEAN',
      flagged: Boolean(features.has_ip_url),
      icon: Globe,
      severity: 'CRITICAL',
    },
    {
      key: 'sender_replyto_mismatch',
      label: 'Sender/Reply Mismatch',
      val: features.sender_replyto_mismatch ? 'MISMATCH' : 'MATCHED',
      flagged: Boolean(features.sender_replyto_mismatch),
      icon: UserX,
      severity: 'HIGH',
    },
    {
      key: 'suspicious_brand_impersonation',
      label: 'Brand Impersonation',
      val: features.suspicious_brand_impersonation ? 'SUSPICIOUS' : 'NONE',
      flagged: Boolean(features.suspicious_brand_impersonation),
      icon: Building,
      severity: 'HIGH',
    },
    {
      key: 'has_shortener',
      label: 'URL Shortener',
      val: features.has_shortener ? 'SHORTENER' : 'DIRECT',
      flagged: Boolean(features.has_shortener),
      icon: Link2,
      severity: 'MEDIUM',
    },
    {
      key: 'urgent_word_count',
      label: 'Urgent Triggers',
      val: `${features.urgent_word_count || 0} words`,
      flagged: (features.urgent_word_count || 0) > 1,
      icon: Flame,
      severity: 'MEDIUM',
    },
    {
      key: 'sensitive_word_count',
      label: 'Sensitive Terms',
      val: `${features.sensitive_word_count || 0} terms`,
      flagged: (features.sensitive_word_count || 0) > 1,
      icon: KeyRound,
      severity: 'MEDIUM',
    },
    {
      key: 'suspicious_tld_count',
      label: 'Suspicious TLDs',
      val: `${features.suspicious_tld_count || 0} TLDs`,
      flagged: (features.suspicious_tld_count || 0) > 0,
      icon: AlertTriangle,
      severity: 'MEDIUM',
    },
    {
      key: 'has_freemail_sender',
      label: 'Free Email Domain',
      val: features.has_freemail_sender ? 'FREE DOMAIN' : 'CORP/CUSTOM',
      flagged: Boolean(features.has_freemail_sender),
      icon: MailCheck,
      severity: 'LOW',
    },
    {
      key: 'url_count',
      label: 'Extracted Links',
      val: `${features.url_count || 0} links`,
      flagged: false,
      icon: Hash,
      severity: 'INFO',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {signalConfigs.map((sig) => {
        const Icon = sig.icon;
        const isFlagged = sig.flagged;

        return (
          <div
            key={sig.key}
            className={`p-2.5 rounded-lg border text-xs transition-all ${
              isFlagged
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-cyber-900/60 border-white/5 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Icon
                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                    isFlagged ? 'text-red-400 animate-pulse' : 'text-slate-500'
                  }`}
                />
                <span className="truncate text-[11px] font-medium text-slate-300">
                  {sig.label}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span
                className={`text-[10px] font-semibold uppercase ${
                  isFlagged ? 'text-red-400' : 'text-slate-400'
                }`}
              >
                {sig.val}
              </span>
              {isFlagged && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-red-500/20 text-red-300">
                  {sig.severity}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
