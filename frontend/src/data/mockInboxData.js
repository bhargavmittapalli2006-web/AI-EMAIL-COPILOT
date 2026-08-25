/**
 * SAMPLE EMAIL CONTENT (PRESENTATION DATA)
 * ----------------------------------------------------
 * Pure email content fixtures (subject, sender, body, timestamp, recipient).
 * 
 * IMPORTANT:
 * - Mock security verdicts (is_phishing, risk_score, risk_level) have been REMOVED.
 * - All security analysis is dynamically performed by the ML-10 engine (/api/v1/analyze).
 */

export const MOCK_EMAILS = [
  {
    id: 'msg-101',
    senderName: 'Bank Security Department',
    senderEmail: 'security-alert@bank-verification-secure.com',
    recipient: 'user@enterprise.com',
    replyTo: 'hacker88@gmail.com',
    subject: 'URGENT: Your Bank Account Has Been Suspended!',
    preview: 'Dear customer, your bank account has been suspended due to suspicious activity. Click here immediately to verify...',
    body: `Dear Valued Customer,

Your bank account has been temporarily SUSPENDED due to multiple unauthorized login attempts detected from an unrecognized IP location.

Immediate action is REQUIRED to restore your online access and protect your funds. Failure to re-verify your identity within 24 hours will result in permanent account closure and legal review.

Please click the secure link below to verify your identity, SSN, and debit card PIN immediately:
http://192.168.1.1/login.php

Thank you for your prompt cooperation,
Online Fraud Prevention Division`,
    links: ['http://192.168.1.1/login.php'],
    timestamp: '10:42 AM',
    date: 'Aug 24, 2026',
    isUnread: true,
    isStarred: true,
    isImportant: true,
    folder: 'inbox',
    category: 'finance',
    hasAttachment: false,
    avatarColor: 'bg-rose-600',
  },
  {
    id: 'msg-102',
    senderName: 'PayPal Account Team',
    senderEmail: 'service-update@paypal-account-notice.xyz',
    recipient: 'user@enterprise.com',
    replyTo: 'collector-inbox@yahoo.com',
    subject: 'Action Required: PayPal Security Verification Notice',
    preview: 'We noticed unusual billing activity on your PayPal account. Re-enter your billing credentials to unlock...',
    body: `Hello Customer,

We detected an unusual charge of $849.00 USD on your PayPal balance. If you did not authorize this payment, please review and dispute the transaction immediately.

Visit our secure verification center to confirm your account ownership:
http://tinyurl.com/paypal-dispute-id982

If you do not dispute within 12 hours, the funds will be permanently transferred.

Sincerely,
PayPal Security & Account Review`,
    links: ['http://tinyurl.com/paypal-dispute-id982'],
    timestamp: '09:15 AM',
    date: 'Aug 24, 2026',
    isUnread: true,
    isStarred: false,
    isImportant: true,
    folder: 'inbox',
    category: 'finance',
    hasAttachment: true,
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'msg-103',
    senderName: 'Sarah Jenkins',
    senderEmail: 'sarah.jenkins@company.com',
    recipient: 'engineering-team@company.com',
    replyTo: 'sarah.jenkins@company.com',
    subject: 'Sprint Planning Meeting Agenda & Q3 Milestones',
    preview: 'Hi team, please find attached the agenda for our Q3 planning meeting tomorrow at 10 AM. Review the Jira board before the session...',
    body: `Hi Engineering Team,

Please find attached the agenda for our Q3 planning session tomorrow, Tuesday at 10:00 AM PST.

Key Agenda Topics:
1. Review Sprint 14 velocity and retrospective outcomes.
2. Discuss core deliverables for the new email copilot security dashboard.
3. Review team capacity and assign milestone leads.

Please take 10 minutes before the meeting to review your assigned tickets on the Jira board:
https://company.atlassian.net/jira/software-projects/ENG/boards/12

Best regards,
Sarah Jenkins
Lead Technical Product Manager`,
    links: ['https://company.atlassian.net/jira/software-projects/ENG/boards/12'],
    timestamp: '08:30 AM',
    date: 'Aug 24, 2026',
    isUnread: false,
    isStarred: true,
    isImportant: false,
    folder: 'inbox',
    category: 'work',
    hasAttachment: true,
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'msg-104',
    senderName: 'Executive Team',
    senderEmail: 'all-hands@company.com',
    recipient: 'all-company@company.com',
    replyTo: 'internal-comms@company.com',
    subject: 'Quarterly All-Hands Slides, Recording & Key Takeaways',
    preview: 'Thank you all for joining our Q2 All-Hands session. The full video recording and presentation deck are now available on the portal...',
    body: `Team,

Thank you all for joining our Q2 All-Hands session earlier this afternoon.

For those who were unable to attend live or wish to review the strategic goals discussed, the full video recording and presentation deck are now available on the internal portal:
https://internal.company.com/allhands/q2-2026

Key Highlights:
- Revenue growth reached 124% YoY.
- Security and compliance automation is now deployed across 98% of infrastructure.
- Welcoming 15 new engineers across our platform teams.

Thank you for your hard work,
The Executive Leadership Team`,
    links: ['https://internal.company.com/allhands/q2-2026'],
    timestamp: 'Yesterday',
    date: 'Aug 23, 2026',
    isUnread: false,
    isStarred: false,
    isImportant: false,
    folder: 'inbox',
    category: 'updates',
    hasAttachment: false,
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'msg-105',
    senderName: 'GitHub Security Alert',
    senderEmail: 'notifications@github.com',
    recipient: 'user@enterprise.com',
    replyTo: 'noreply@github.com',
    subject: '[Security Advisory] 1 Dependabot alert detected in repository',
    preview: 'Dependabot has identified a medium-severity vulnerability in your package dependencies. Review the pull request...',
    body: `Hello @bhargavmittapalli2006,

A new security advisory affects a package in your repository dependencies:

- Advisory ID: GHSA-7958-3921-2281
- Package: vite (devDependency)
- Severity: Moderate
- Recommendation: Update package to version 6.1.0 or higher.

You can view the automated pull request generated by Dependabot here:
https://github.com/bhargavmittapalli2006-web/AI-EMAIL-COPILOT/pull/4

Regards,
GitHub Security Advisory Team`,
    links: ['https://github.com/bhargavmittapalli2006-web/AI-EMAIL-COPILOT/pull/4'],
    timestamp: 'Aug 22',
    date: 'Aug 22, 2026',
    isUnread: true,
    isStarred: false,
    isImportant: true,
    folder: 'inbox',
    category: 'updates',
    hasAttachment: false,
    avatarColor: 'bg-slate-700',
  },
  {
    id: 'msg-106',
    senderName: 'David Zhang',
    senderEmail: 'david.zhang@company.com',
    recipient: 'user@enterprise.com',
    replyTo: 'david.zhang@company.com',
    subject: 'Architecture Review Notes: Phishing Defense & ML Pipeline',
    preview: 'Hey! I reviewed the PR for the model pipeline inference wrapper. The design looks very clean and decoupled...',
    body: `Hey Bhargav,

I took a detailed look at the architecture for the phishing engine and feature engineering pipeline.

The separation between the deterministic URL/Sender heuristics and the Scikit-learn TF-IDF model is really well thought out. It provides solid explainability while keeping inference latency sub-50ms.

Let's sync for 15 minutes tomorrow afternoon to finalize the API schema for the Gemini intelligence endpoint.

Cheers,
David`,
    links: [],
    timestamp: 'Aug 21',
    date: 'Aug 21, 2026',
    isUnread: false,
    isStarred: true,
    isImportant: true,
    folder: 'inbox',
    category: 'work',
    hasAttachment: false,
    avatarColor: 'bg-cyan-600',
  },
  {
    id: 'msg-107',
    senderName: 'IT Operations',
    senderEmail: 'it-support@company.com',
    recipient: 'user@enterprise.com',
    replyTo: 'it-support@company.com',
    subject: 'Scheduled Maintenance: Identity Provider & SSO Sync this Weekend',
    preview: 'Please note that the corporate Okta SSO service will undergo scheduled maintenance on Saturday between 02:00 UTC and 04:00 UTC...',
    body: `All Employees,

Please be aware of an upcoming maintenance window for our corporate Okta Identity Provider:

- Maintenance Window: Saturday, Aug 29, 02:00 – 04:00 UTC (10:00 PM – Midnight EDT)
- Impact: Users may experience brief authentication prompts when reconnecting to internal SaaS tools during the window.
- Action Required: No action required. Active sessions will remain cached.

Please contact the IT Helpdesk at #it-helpdesk on Slack if you experience unexpected disruption.

Best,
Enterprise IT Infrastructure Operations`,
    links: [],
    timestamp: 'Aug 20',
    date: 'Aug 20, 2026',
    isUnread: false,
    isStarred: false,
    isImportant: false,
    folder: 'inbox',
    category: 'updates',
    hasAttachment: false,
    avatarColor: 'bg-teal-600',
  },
  {
    id: 'msg-108',
    senderName: 'Amazon Web Services',
    senderEmail: 'no-reply-aws@amazon-payment-validation.site',
    recipient: 'user@enterprise.com',
    replyTo: 'refund-desk99@gmail.com',
    subject: 'Urgent Alert: Outstanding Invoice & Immediate Service Termination',
    preview: 'Your AWS billing invoice is overdue by $2,490.00. Click here to confirm your credit card and avoid account closure...',
    body: `Attention AWS Cloud Administrator,

Your cloud hosting account has a critical past-due balance of $2,490.00 USD. Your production EC2 clusters and S3 buckets are scheduled for immediate decommission within 6 hours.

To avoid data loss, update your billing card now:
http://bit.ly/aws-cloud-emergency-billing

Amazon Web Services Financial Services Team`,
    links: ['http://bit.ly/aws-cloud-emergency-billing'],
    timestamp: 'Aug 19',
    date: 'Aug 19, 2026',
    isUnread: false,
    isStarred: false,
    isImportant: true,
    folder: 'spam',
    category: 'finance',
    hasAttachment: false,
    avatarColor: 'bg-rose-700',
  }
];

export const FOLDERS = [
  { id: 'inbox', label: 'Inbox', icon: 'Inbox', section: 'mail' },
  { id: 'starred', label: 'Starred', icon: 'Star', section: 'mail' },
  { id: 'important', label: 'Important', icon: 'Bookmark', section: 'mail' },
  { id: 'sent', label: 'Sent', icon: 'Send', section: 'mail' },
  { id: 'drafts', label: 'Drafts', icon: 'FileText', section: 'mail' },
  { id: 'all', label: 'All Mail', icon: 'Mail', section: 'mail' },
  { id: 'spam', label: 'Spam', icon: 'AlertOctagon', section: 'mail' },
  { id: 'trash', label: 'Trash', icon: 'Trash2', section: 'mail' },


  { id: 'security-overview', label: 'Security Overview', icon: 'Shield', section: 'security' },
  { id: 'threats', label: 'Threats Detected', icon: 'ShieldAlert', section: 'security' },
  { id: 'high-risk', label: 'High Risk', icon: 'AlertTriangle', section: 'security' },
  { id: 'critical', label: 'Critical', icon: 'Flame', section: 'security' },

  { id: 'work', label: 'Work', icon: 'Briefcase', section: 'labels', color: 'text-indigo-500 dark:text-indigo-400' },
  { id: 'finance', label: 'Finance', icon: 'DollarSign', section: 'labels', color: 'text-emerald-500 dark:text-emerald-400' },
  { id: 'updates', label: 'Updates', icon: 'Bell', section: 'labels', color: 'text-sky-500 dark:text-sky-400' },
  { id: 'personal', label: 'Personal', icon: 'User', section: 'labels', color: 'text-purple-500 dark:text-purple-400' },
];
