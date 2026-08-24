import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RotateCcw,
  MessageSquare,
  ShieldAlert,
  HelpCircle,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';

export const SuggestedReplyPanel = ({
  suggestedReplies = [],
  senderName,
  onSendReply,
}) => {
  const [selectedTone, setSelectedTone] = useState(
    suggestedReplies[0]?.tone || 'professional'
  );
  const [replyText, setReplyText] = useState(
    suggestedReplies[0]?.text || ''
  );
  const [copied, setCopied] = useState(false);
  const [sentStatus, setSentStatus] = useState(false);

  // Update text when selected email or replies change
  useEffect(() => {
    if (suggestedReplies.length > 0) {
      const match = suggestedReplies.find((r) => r.tone === selectedTone) || suggestedReplies[0];
      setSelectedTone(match.tone);
      setReplyText(match.text);
    } else {
      setReplyText('');
    }
    setSentStatus(false);
  }, [suggestedReplies]);

  const handleToneChange = (tone) => {
    setSelectedTone(tone);
    const match = suggestedReplies.find((r) => r.tone === tone);
    if (match) {
      setReplyText(match.text);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(replyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!replyText.trim()) return;
    setSentStatus(true);
    if (onSendReply) onSendReply(replyText);
    setTimeout(() => setSentStatus(false), 3500);
  };

  const toneTabs = [
    { id: 'professional', label: 'Professional', icon: ThumbsUp },
    { id: 'clarify', label: 'Clarify / Ask', icon: HelpCircle },
    { id: 'decline', label: 'Decline / Reject', icon: ThumbsDown },
    { id: 'security_report', label: 'Security Advisory', icon: ShieldAlert },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-cyber-850/70 glass-panel p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              AI Suggested Reply Engine
            </h3>
            <p className="text-xs text-slate-400">
              Action Engine • Context-Aware Intelligent Draft Generation
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
          Ready to Dispatch
        </span>
      </div>

      {/* Tone Selectors */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
          Response Tone & Intent
        </label>
        <div className="flex flex-wrap gap-1.5">
          {suggestedReplies.map((r) => {
            const isSelected = selectedTone === r.tone;
            return (
              <button
                key={r.id}
                onClick={() => handleToneChange(r.tone)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                    : 'bg-cyber-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <span>{r.label || r.tone}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editable Reply Composer */}
      <div className="space-y-2">
        <div className="relative">
          <textarea
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type or customize your AI generated response..."
            className="w-full p-3.5 rounded-xl bg-cyber-900/90 border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500 text-xs text-slate-100 placeholder-slate-500 font-sans leading-relaxed focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Character & word count */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>{replyText.split(/\s+/).filter(Boolean).length} words • {replyText.length} characters</span>
          <span>Target recipient: {senderName || 'Sender'}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-900 hover:bg-cyber-800 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-mono">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Text</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          {sentStatus ? (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold font-mono animate-bounce">
              <Check className="w-4 h-4" />
              <span>Reply Dispatched!</span>
            </div>
          ) : (
            <button
              onClick={handleSend}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-cyan transition-all cursor-pointer transform active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Reply</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
