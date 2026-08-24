import React, { useState } from 'react';
import {
  X,
  Shield,
  Sparkles,
  Play,
  AlertTriangle,
} from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    name: '🚨 CEO Wire Scam',
    subject: 'URGENT: Executive Wire Transfer Authorization for Project Falcon',
    sender: 'tim.cook-apple-corp@secure-verify-update.co',
    reply_to: 'offshore-payouts-883@protonmail.com',
    body: 'Team, I am in an urgent meeting and need $485,000 sent to our settlement escrow immediately: http://194.26.29.112/auth-token before 5 PM.',
    links: 'http://194.26.29.112/auth-token',
  },
  {
    name: '🔑 Credential Harvester',
    subject: 'Action Required: Microsoft 365 Password Expiration in 24 Hours',
    sender: 'no-reply@auth-microsoft365-verify.online',
    reply_to: 'support@cloud-token-sync.pw',
    body: 'Dear User, Your password expires in 24 hours. Keep your password here: https://bit.ly/3xMSFT-SecureAuth-Gate',
    links: 'https://bit.ly/3xMSFT-SecureAuth-Gate',
  },
  {
    name: '✅ Safe Project Update',
    subject: 'Security Sprint Architecture Review Notes & Roadmap',
    sender: 'alex.chen@cyberdefense-corp.com',
    reply_to: 'alex.chen@cyberdefense-corp.com',
    body: 'Hi Team, please review the attached architecture slides for Thursday 2 PM meeting. Let me know if you have questions.',
    links: 'https://cyberdefense-corp.com/internal/wiki',
  },
];

export const ScanCustomEmailModal = ({ isOpen, onClose, onAnalyze }) => {
  const [subject, setSubject] = useState('');
  const [sender, setSender] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [body, setBody] = useState('');
  const [linksText, setLinksText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setSubject(preset.subject);
    setSender(preset.sender);
    setReplyTo(preset.reply_to);
    setBody(preset.body);
    setLinksText(preset.links);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !sender.trim() || !body.trim()) {
      setError('Please fill in Subject, Sender, and Body fields.');
      return;
    }

    const parsedLinks = linksText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('http'));

    setIsSubmitting(true);
    setError('');

    try {
      await onAnalyze({
        subject: subject.trim(),
        sender: sender.trim(),
        reply_to: replyTo.trim() || sender.trim(),
        body: body.trim(),
        links: parsedLinks,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Analysis failed. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-h-[90vh] flex flex-col text-slate-900 dark:text-[#F8FAFC]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#151E2E]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                Scan Custom Email Payload
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                Run live threat classification and action extraction
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1B2638] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block">
              Quick Test Scenarios:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_TEMPLATES.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#151E2E] hover:bg-slate-200 dark:hover:bg-[#1B2638] text-slate-700 dark:text-[#CBD5E1] text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject Field */}
          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-[#CBD5E1]">
              Email Subject *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. URGENT: Verify your account immediately!"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#151E2E] border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 text-xs"
            />
          </div>

          {/* Sender & Reply-To Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-medium text-slate-700 dark:text-[#CBD5E1]">
                Sender Address *
              </label>
              <input
                type="email"
                required
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. security@bank-alert-update.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#151E2E] border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-medium text-slate-700 dark:text-[#CBD5E1]">
                Reply-To Address (Optional)
              </label>
              <input
                type="email"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                placeholder="e.g. hacker883@protonmail.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#151E2E] border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 text-xs"
              />
            </div>
          </div>

          {/* Body Field */}
          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-[#CBD5E1]">
              Email Body Content *
            </label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste email text, phishing attempts, invoice demands, or meeting notes..."
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-[#151E2E] border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 font-sans leading-relaxed resize-none text-xs"
            />
          </div>

          {/* Extracted Links */}
          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-[#CBD5E1] flex items-center justify-between">
              <span>Extracted Hyperlinks (One per line)</span>
              <span className="text-slate-400 dark:text-[#94A3B8] text-[10px]">Optional / Auto-extracted</span>
            </label>
            <textarea
              rows={2}
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              placeholder="http://192.168.1.1/login&#10;https://bit.ly/3xMSFT"
              className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-[#151E2E] border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 font-mono text-[11px] resize-none"
            />
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#151E2E] hover:bg-slate-200 dark:hover:bg-[#1B2638] text-slate-700 dark:text-[#CBD5E1] text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScanCustomEmailModal;
