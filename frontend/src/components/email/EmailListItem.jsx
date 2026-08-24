import React from 'react';
import { Star, ShieldAlert, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import { RiskBadge, PriorityBadge } from '../common/Badge';

export const EmailListItem = ({
  email,
  isSelected,
  onSelect,
  onToggleStar,
}) => {
  const isPhishing = email.phishing_analysis?.is_phishing;
  const riskLevel = email.phishing_analysis?.risk_level || 'LOW';
  const riskScore = email.phishing_analysis?.risk_score;
  const priorityLevel = email.priority_analysis?.priority_level || 'LOW';

  // Sender initial
  const initial = (email.sender_name || email.sender || 'U')
    .replace(/[^a-zA-Z0-9]/g, '')
    .charAt(0)
    .toUpperCase();

  return (
    <div
      onClick={() => onSelect(email)}
      className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
        isSelected
          ? 'bg-cyber-800/90 border-cyan-500/60 shadow-glow-cyan'
          : 'bg-cyber-850/60 hover:bg-cyber-800/60 border-white/5 hover:border-white/15'
      } ${!email.is_read ? 'border-l-4 border-l-cyan-400' : ''}`}
    >
      {/* Top row: Sender info & Badges */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar */}
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
              isPhishing
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            {initial}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-semibold truncate ${
                  !email.is_read ? 'text-white' : 'text-slate-300'
                }`}
              >
                {email.sender_name || email.sender}
              </span>
              {!email.is_read && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">
              {email.sender}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[10px] text-slate-400 font-mono">
            {email.timestamp}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(email.id);
            }}
            className={`p-1 rounded hover:bg-white/5 transition-colors cursor-pointer ${
              email.is_starred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${email.is_starred ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Subject Line */}
      <h4
        className={`text-xs font-medium mb-1 line-clamp-1 ${
          !email.is_read ? 'text-slate-100 font-semibold' : 'text-slate-300'
        }`}
      >
        {email.subject}
      </h4>

      {/* Preview snippet */}
      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2.5 font-sans">
        {email.body.replace(/\n+/g, ' ')}
      </p>

      {/* Security & Priority Tags footer */}
      <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <RiskBadge level={riskLevel} score={riskScore} size="sm" />
          <PriorityBadge level={priorityLevel} size="sm" />
        </div>

        {email.is_quarantined && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
            <Lock className="w-2.5 h-2.5" />
            QUARANTINED
          </span>
        )}
      </div>
    </div>
  );
};
