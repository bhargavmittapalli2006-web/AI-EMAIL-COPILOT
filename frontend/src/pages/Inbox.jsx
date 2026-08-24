import React from 'react';
import { EmailList } from '../components/email/EmailList';
import { EmailDetail } from '../components/email/EmailDetail';

export const Inbox = ({
  emails = [],
  selectedEmail,
  onSelectEmail,
  onToggleStar,
  onQuarantine,
  onMarkSafe,
  onToggleAction,
  onSendReply,
  isLoading,
}) => {
  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-white dark:bg-slate-900">
      {/* Left Email Listing Panel */}
      <div className={`w-full lg:w-96 xl:w-[420px] flex-shrink-0 h-full border-r border-slate-200 dark:border-slate-800 ${
        selectedEmail ? 'hidden lg:flex flex-col' : 'flex flex-col'
      }`}>
        <EmailList
          emails={emails}
          selectedEmail={selectedEmail}
          onSelectEmail={onSelectEmail}
          onToggleStar={onToggleStar}
          isLoading={isLoading}
        />
      </div>

      {/* Right Detail Panel */}
      <div className={`flex-1 h-full overflow-hidden ${
        !selectedEmail ? 'hidden lg:flex flex-col' : 'flex flex-col'
      }`}>
        <EmailDetail
          email={selectedEmail}
          isLoading={isLoading}
          onBack={() => onSelectEmail(null)}
          onToggleStar={onToggleStar}
          onQuarantine={onQuarantine}
          onMarkSafe={onMarkSafe}
          onToggleAction={onToggleAction}
          onSendReply={onSendReply}
        />
      </div>
    </div>
  );
};
