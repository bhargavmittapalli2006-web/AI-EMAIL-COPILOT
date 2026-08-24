import { EmailItem } from '../types/email';

export const DEMO_EMAILS: EmailItem[] = [
  {
    id: 'email-1',
    subject: 'URGENT: Your Bank Account Has Been Suspended!',
    sender: 'security-alert@bank-verification-secure.com',
    senderName: 'Bank Security Department',
    reply_to: 'hacker88@gmail.com',
    timestamp: '10:42 AM',
    preview: 'Dear customer, your bank account has been suspended due to suspicious activity. Click here immediately to verify...',
    body: `Dear Valued Customer,

Your bank account has been temporarily SUSPENDED due to multiple unauthorized login attempts detected from an unrecognized IP location.

Immediate action is REQUIRED to restore your online access and protect your funds. Failure to re-verify your identity within 24 hours will result in permanent account closure and legal review.

Please click the secure link below to verify your identity, SSN, and debit card PIN immediately:
http://192.168.1.1/login.php

Thank you for your prompt cooperation,
Online Fraud Prevention Division`,
    links: ['http://192.168.1.1/login.php', 'http://bit.ly/3xY9z0a'],
    isRead: false,
    isStarred: false,
    tag: 'Urgent',
    analysis: {
      is_phishing: true,
      classification: 'phishing',
      risk_score: 94,
      risk_level: 'CRITICAL',
      confidence: 0.97,
      flagged_reasons: [
        'Email contains links pointing directly to raw IP addresses instead of trusted domain names.',
        'Email contains URL shorteners (bit.ly) used to conceal true destinations.',
        'Sender domain does not match Reply-To address domain, indicating severe header spoofing.',
        'Email utilizes high-urgency panic language threatening immediate account termination.',
        'Email solicits sensitive credentials (SSN, banking PIN, passwords).'
      ],
      features: {
        sender_risk: 0.94,
        link_risk: 0.98,
        content_risk: 0.91
      }
    },
    intelligence: {
      summary: 'This message is a critical credential-harvesting phishing attack impersonating a bank fraud prevention department. The attacker threatens permanent account closure within 24 hours to coerce the victim into submitting debit card PINs and Social Security Numbers via an unverified raw IP address.',
      action_items: [
        { text: 'Do NOT click the raw IP link or shortened URL', priority: 'high' },
        { text: 'Do NOT provide banking credentials, SSN, or PINs', priority: 'high' },
        { text: 'Quarantine the email and report to IT Security Operations', priority: 'high' }
      ],
      key_points: [
        'Sender claims account suspension due to unauthorized logins',
        'Coercive 24-hour deadline intended to induce psychological panic',
        'Hyperlink points directly to unencrypted raw IP address (192.168.1.1)',
        'Solicits high-risk credentials including SSN and debit card PIN'
      ],
      risk_explanation: 'The phishing engine flagged this message as CRITICAL risk (Score 94/100) due to raw IP hyperlinking, URL shorteners, severe sender header spoofing, urgency coercion, and banking credential harvesting.',
      recommended_actions: [
        'Block sender and quarantine message immediately',
        'Do not interact with any links or attachments',
        'Report incident to enterprise security operations'
      ]
    }
  },
  {
    id: 'email-2',
    subject: 'Action Required: PayPal Security Verification Notice',
    sender: 'service-update@paypal-account-notice.xyz',
    senderName: 'PayPal Account Team',
    reply_to: 'collector-inbox@yahoo.com',
    timestamp: '09:15 AM',
    preview: 'We noticed unusual billing activity on your PayPal account. Re-enter your billing credentials to unlock...',
    body: `Hello Customer,

We detected an unusual charge of $849.00 USD on your PayPal balance. If you did not authorize this payment, please review and dispute the transaction immediately.

Visit our secure verification center to confirm your account ownership:
http://tinyurl.com/paypal-dispute-id982

Note: Do not ignore this notice or your account will remain restricted.

Best regards,
PayPal Security & Resolution Team`,
    links: ['http://tinyurl.com/paypal-dispute-id982'],
    isRead: false,
    isStarred: true,
    tag: 'Financial',
    analysis: {
      is_phishing: true,
      classification: 'phishing',
      risk_score: 78,
      risk_level: 'HIGH',
      confidence: 0.89,
      flagged_reasons: [
        'Email uses URL shortener (tinyurl.com) to mask the destination page.',
        'Sender domain (.xyz) is a high-risk TLD commonly linked to brand impersonation.',
        'Sender domain does not match Reply-To domain (yahoo.com).',
        'Email creates false urgency regarding unauthorized financial charges.'
      ],
      features: {
        sender_risk: 0.82,
        link_risk: 0.88,
        content_risk: 0.65
      }
    },
    intelligence: {
      summary: 'This email is a fraudulent billing dispute scam impersonating PayPal security. The sender attempts to lure the recipient into clicking an obfuscated tinyurl link under the false pretext of resolving an unauthorized $849.00 USD transaction charge.',
      action_items: [
        { text: 'Avoid clicking the shortened tinyurl dispute link', priority: 'high' },
        { text: 'Verify account transaction balance directly on official paypal.com site', priority: 'high' },
        { text: 'Mark sender domain (.xyz) as unauthorized spoofing', priority: 'medium' }
      ],
      key_points: [
        'Claims an unauthorized $849.00 USD transaction was charged',
        'Utilizes tinyurl.com obfuscation to conceal the destination server',
        'Sender domain (.xyz) mismatches reply-to inbox (yahoo.com)',
        'Threatens continuous account restriction if ignored'
      ],
      risk_explanation: 'The email was flagged as HIGH risk (Score 78/100) due to brand impersonation, high-risk top-level domain (.xyz), header domain mismatch, and obfuscated link shorteners.',
      recommended_actions: [
        'Do not click the verification or dispute links',
        'Check recent transactions exclusively on paypal.com or mobile app',
        'Forward email to spoof@paypal.com and delete'
      ]
    }
  },
  {
    id: 'email-3',
    subject: 'Sprint Planning Meeting Agenda & Q3 Milestones',
    sender: 'sarah.jenkins@company.com',
    senderName: 'Sarah Jenkins (Engineering Lead)',
    reply_to: 'sarah.jenkins@company.com',
    timestamp: 'Yesterday',
    preview: 'Hi Team, please find attached the agenda for our upcoming Q3 sprint planning meeting scheduled for tomorrow...',
    body: `Hi Team,

Please find attached the agenda for our upcoming Q3 sprint planning meeting scheduled for tomorrow at 10:00 AM PST.

Key Agenda Items:
1. Review Phase 1 Phishing Engine milestones and model integration.
2. Architecture breakdown for Email Copilot frontend experience.
3. Resource allocation & timeline review.

Please check the Jira project board beforehand to update your assigned tickets:
https://company.atlassian.net/jira/software-projects/ENG/boards/12

See you all tomorrow!

Best,
Sarah Jenkins
Lead Software Architect`,
    links: ['https://company.atlassian.net/jira/software-projects/ENG/boards/12'],
    isRead: true,
    isStarred: true,
    tag: 'Internal',
    analysis: {
      is_phishing: false,
      classification: 'legitimate',
      risk_score: 6,
      risk_level: 'LOW',
      confidence: 0.98,
      flagged_reasons: [],
      features: {
        sender_risk: 0.04,
        link_risk: 0.05,
        content_risk: 0.08
      }
    },
    intelligence: {
      summary: 'Sarah Jenkins shared the agenda and schedule for tomorrow\'s Q3 sprint planning meeting at 10:00 AM PST. The engineering team is requested to review phishing engine milestones and update their assigned tickets on Jira before the session.',
      action_items: [
        { text: 'Update assigned sprint tickets on Jira before 10:00 AM PST', priority: 'high' },
        { text: 'Review Phase 1 Phishing Engine milestones and frontend architecture', priority: 'medium' },
        { text: 'Attend Q3 sprint planning meeting tomorrow at 10:00 AM PST', priority: 'medium' }
      ],
      key_points: [
        'Sprint planning meeting scheduled for tomorrow at 10:00 AM PST',
        'Key focus: Phishing engine milestones, frontend architecture, and timelines',
        'Team members must update Jira board prior to meeting',
        'Meeting agenda provided by Lead Software Architect'
      ],
      risk_explanation: 'This email appears low risk (Score 6/100). The message is legitimate internal communication originating from an authentic corporate domain (@company.com) with official Jira links and no detected security threats.',
      recommended_actions: [
        'Review the attached sprint planning agenda',
        'Update assigned Jira tickets',
        'Confirm calendar invite'
      ]
    }
  },
  {
    id: 'email-4',
    subject: 'Quarterly All-Hands Slides, Recording & Key Takeaways',
    sender: 'internal-communications@company.com',
    senderName: 'Internal Communications',
    reply_to: 'internal-communications@company.com',
    timestamp: 'Aug 22',
    preview: 'Thank you everyone for attending today’s company-wide all-hands meeting. The recording and slide deck are now available...',
    body: `Hi Everyone,

Thank you for joining our company-wide Q3 All-Hands meeting today! It was wonderful celebrating the team's achievements and looking ahead to our upcoming product launches.

The recording, presentation slide deck, and Q&A summary document are now available on Google Drive:
https://drive.google.com/file/d/1a2b3c4d5e/view

If you have any follow-up questions for leadership, feel free to submit them through the internal feedback portal.

Warm regards,
The Internal Communications Team`,
    links: ['https://drive.google.com/file/d/1a2b3c4d5e/view'],
    isRead: true,
    isStarred: false,
    tag: 'Company',
    analysis: {
      is_phishing: false,
      classification: 'legitimate',
      risk_score: 8,
      risk_level: 'LOW',
      confidence: 0.96,
      flagged_reasons: [],
      features: {
        sender_risk: 0.05,
        link_risk: 0.06,
        content_risk: 0.12
      }
    },
    intelligence: {
      summary: 'The Internal Communications team provided the presentation slide deck, meeting recording, and executive Q&A document from today\'s Q3 All-Hands meeting. Employees can access the materials on Google Drive and submit follow-up leadership questions via the internal portal.',
      action_items: [
        { text: 'Access meeting recording and presentation slides on Google Drive if needed', priority: 'low' },
        { text: 'Submit any leadership follow-up questions through internal portal', priority: 'low' }
      ],
      key_points: [
        'Q3 All-Hands meeting successfully concluded',
        'Recording and slide deck published to official Google Drive repository',
        'Leadership Q&A summary available for reference',
        'Feedback portal open for employee questions'
      ],
      risk_explanation: 'This email appears low risk (Score 8/100). The message is routine corporate broadcast from a verified internal address with trusted Google Drive attachments.',
      recommended_actions: [
        'Review presentation slides and recording',
        'Archive message for reference'
      ]
    }
  }
];
