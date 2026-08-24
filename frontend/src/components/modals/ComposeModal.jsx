import React, { useState } from 'react';
import { X, Send, FileText, Paperclip, Minimize2, Maximize2 } from 'lucide-react';

/**
 * Classical Gmail-style Compose Email Modal
 */
export function ComposeModal({ isOpen, onClose, onSend, onSaveDraft }) {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipient.trim() || !subject.trim() || !body.trim()) return;

    onSend?.({
      recipient: recipient.trim(),
      subject: subject.trim(),
      body: body.trim(),
    });

    // Reset and close
    setRecipient('');
    setSubject('');
    setBody('');
    onClose();
  };

  const handleSaveDraft = () => {
    if (!subject.trim() && !body.trim()) {
      onClose();
      return;
    }

    onSaveDraft?.({
      recipient: recipient.trim(),
      subject: subject.trim() || '(No Subject)',
      body: body.trim(),
    });

    setRecipient('');
    setSubject('');
    setBody('');
    onClose();
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-8 z-50 w-72 bg-slate-900 text-white rounded-t-xl shadow-2xl border border-slate-700 flex items-center justify-between p-3 select-none text-xs font-semibold">
        <span className="truncate">New Message: {subject || '(No subject)'}</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            aria-label="Maximize"
            className="p-1 hover:bg-slate-800 rounded"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 hover:bg-slate-800 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-8 z-50 w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100">
        <span>New Message</span>
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            aria-label="Minimize"
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        {/* Recipient */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <span className="text-slate-400 font-semibold w-12">To</span>
          <input
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipients"
            required
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Subject */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <span className="text-slate-400 font-semibold w-12">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line"
            required
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Body Textarea */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message..."
          rows={10}
          required
          className="flex-1 p-4 bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-normal leading-relaxed"
        />

        {/* Action Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Discard draft"
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-750"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
