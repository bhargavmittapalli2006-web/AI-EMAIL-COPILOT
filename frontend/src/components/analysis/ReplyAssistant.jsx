import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Send, RotateCcw, Edit3 } from 'lucide-react';

export const ReplyAssistant = ({ suggestedReplies = [], senderName, onSendReply }) => {
  const [selectedTone, setSelectedTone] = useState(suggestedReplies[0]?.tone || 'professional');
  const [replyText, setReplyText] = useState(suggestedReplies[0]?.text || '');
  const [copied, setCopied] = useState(false);
  const [sentStatus, setSentStatus] = useState(false);

  useEffect(() => {
    if (suggestedReplies.length > 0) {
      const match = suggestedReplies.find((r) => r.tone === selectedTone) || suggestedReplies[0];
      setSelectedTone(match.tone);
      setReplyText(match.text);
    }
  }, [suggestedReplies, selectedTone]);

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
    setTimeout(() => setSentStatus(false), 3000);
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-200">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          AI Suggested Reply
        </h4>

        {/* Tone Switcher Tabs */}
        <div className="flex items-center gap-1 text-xs">
          {suggestedReplies.map((r) => {
            const isSelected = selectedTone === r.tone;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleToneChange(r.tone)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-[#151E2E] text-slate-600 dark:text-[#CBD5E1] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#1B2638]'
                }`}
              >
                {r.label || r.tone}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reply Textarea */}
      <div className="relative">
        <textarea
          rows={5}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="AI suggested response will appear here..."
          className="w-full p-3.5 rounded-lg bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none text-xs text-slate-800 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 font-sans leading-relaxed resize-none shadow-sm"
        />
      </div>

      {/* Action Buttons: Copy, Edit, Send */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#151E2E] hover:bg-slate-50 dark:hover:bg-[#1B2638] text-slate-700 dark:text-[#CBD5E1] border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              const current = suggestedReplies.find((r) => r.tone === selectedTone);
              if (current) setReplyText(current.text);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#151E2E] hover:bg-slate-50 dark:hover:bg-[#1B2638] text-slate-600 dark:text-[#CBD5E1] border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-sm"
            title="Reset to generated draft"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
            <span>Reset</span>
          </button>
        </div>

        <div>
          {sentStatus ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
              <Check className="w-4 h-4" />
              <span>Reply Sent</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
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

export default ReplyAssistant;
