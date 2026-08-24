/**
 * Mock Data Engine for AI Email Copilot
 * Provides realistic security, priority, understanding, and action engine outputs.
 */

export const initialMockEmails = [
  {
    id: 'em-001',
    subject: 'URGENT: Executive Wire Transfer Authorization Required Before 5 PM',
    sender: 'tim.cook-apple-corp@secure-verify-update.co',
    sender_name: 'Tim Cook (Executive Office)',
    recipient: 'finance-ops@company.internal',
    reply_to: 'offshore-payouts-883@protonmail.com',
    timestamp: '10 mins ago',
    date: '2026-08-24T07:50:00Z',
    is_read: false,
    is_starred: true,
    is_quarantined: false,
    body: `Team,\n\nI am currently in an emergency confidential M&A board session and cannot take phone calls.\n\nWe urgently need to execute an initial escrow deposit of $485,000.00 for Project Falcon to secure regulatory acquisition exclusivity before 5:00 PM EST today.\n\nPlease process the invoice via our rapid settlement portal immediately: http://194.26.29.112/settlement/auth-token?id=99281\n\nDo not discuss this with other department heads until the official SEC filing tomorrow morning.\n\nThanks,\nTim Cook\nChief Executive Officer`,
    links: [
      'http://194.26.29.112/settlement/auth-token?id=99281'
    ],
    headers: {
      spf: 'FAIL (domain secure-verify-update.co not authorized)',
      dkim: 'NONE',
      dmarc: 'FAIL',
      sender_ip: '194.26.29.112',
      location: 'Eastern Europe (High Risk ASN)'
    },
    phishing_analysis: {
      is_phishing: true,
      risk_score: 97.4,
      risk_level: 'CRITICAL',
      confidence: 0.99,
      flagged_reasons: [
        'Direct IP Address hyperlink detected instead of a valid registered domain (http://194.26.29.112)',
        'Sender and Reply-To header mismatch (tim.cook-apple... vs offshore-payouts... on ProtonMail)',
        'High-confidence executive impersonation and spear phishing markers detected',
        'Extreme urgency coercion ("URGENT", "immediately", "Before 5 PM")',
        'Suspicious high-value financial transaction demand ($485,000.00)'
      ],
      features: {
        url_count: 1,
        has_ip_url: 1,
        has_shortener: 0,
        suspicious_tld_count: 1,
        urgent_word_count: 5,
        sensitive_word_count: 4,
        uppercase_ratio: 0.18,
        exclamation_mark_count: 2,
        currency_symbol_count: 2,
        sender_replyto_mismatch: 1,
        has_suspicious_sender_tld: 1,
        has_freemail_sender: 1,
        suspicious_brand_impersonation: 1
      }
    },
    priority_analysis: {
      priority_score: 98,
      priority_level: 'HIGH',
      urgency: 'URGENT',
      category: 'Financial Scam / Executive Impersonation',
      deadline: 'Today by 5:00 PM EST (Coercive)'
    },
    understanding: {
      tldr: [
        'Impersonator claiming to be Tim Cook requests an immediate wire transfer of $485,000 for Project Falcon.',
        'Directs recipient to an Eastern European IP portal while prohibiting phone verification.',
        'High risk spear-phishing attack designed to bypass corporate accounting controls.'
      ],
      intent: 'Urgent Wire Transfer Fraud / BEC (Business Email Compromise)',
      key_entities: [
        { label: 'Amount', value: '$485,000.00' },
        { label: 'Alleged Sender', value: 'Tim Cook' },
        { label: 'Target Project', value: 'Project Falcon' },
        { label: 'Threat Vector', value: 'Raw IP Portal link' }
      ],
      sentiment: 'Coercive / High Pressure'
    },
    action_items: [
      { id: 'act-1', title: 'IMMEDIATELY QUARANTINE this email to prevent accidental staff access', completed: false, deadline: 'Immediate', priority: 'CRITICAL' },
      { id: 'act-2', title: 'Block domain "secure-verify-update.co" and IP "194.26.29.112" on perimeter firewall', completed: false, deadline: 'Today', priority: 'HIGH' },
      { id: 'act-3', title: 'Notify SOC / Infosec incident response team of targeted spear phishing attempt', completed: false, deadline: 'Today', priority: 'HIGH' }
    ],
    suggested_replies: [
      {
        id: 'rep-sec',
        tone: 'security_report',
        label: '🛡️ SOC Security Incident Report',
        text: 'Automated Security Alert: This inbound message has been flagged as a Critical BEC/Spear-Phishing attack targeting financial ops. No response has been sent to the attacker. Logs forwarded to SOC.'
      },
      {
        id: 'rep-prof',
        tone: 'professional',
        label: '⚠️ Request In-Person Verification (Defense)',
        text: 'Per corporate security protocol, all wire transfers exceeding $5,000 require in-person or out-of-band video biometric verification. Please initiate this request via our internal ERP portal.'
      }
    ]
  },
  {
    id: 'em-002',
    subject: 'Action Required: Microsoft 365 Password Expiration in 24 Hours',
    sender: 'no-reply@auth-microsoft365-verify.online',
    sender_name: 'Microsoft 365 Cloud Security',
    recipient: 'employee@company.internal',
    reply_to: 'support@cloud-token-sync.pw',
    timestamp: '42 mins ago',
    date: '2026-08-24T07:18:00Z',
    is_read: false,
    is_starred: false,
    is_quarantined: false,
    body: `Dear User,\n\nYour Microsoft 365 organization password is scheduled to expire in 24 hours. To retain your current password and avoid disruption to Outlook, Teams, and OneDrive services, please verify your credentials below:\n\n👉 Keep Existing Password: https://bit.ly/3xMSFT-SecureAuth-Gate\n\nIf no action is taken, your account will be suspended per company IT retention policies.\n\nGlobal IT Helpdesk\nMicrosoft 365 Security Operations`,
    links: [
      'https://bit.ly/3xMSFT-SecureAuth-Gate'
    ],
    headers: {
      spf: 'FAIL (SPF SoftFail auth-microsoft365-verify.online)',
      dkim: 'FAIL',
      dmarc: 'FAIL',
      sender_ip: '185.220.101.5',
      location: 'Tor Exit Node / Anonymized Proxy'
    },
    phishing_analysis: {
      is_phishing: true,
      risk_score: 86.8,
      risk_level: 'HIGH',
      confidence: 0.94,
      flagged_reasons: [
        'Known credential harvesting template mimicking Microsoft 365 Authentication portal',
        'Shortened URL service (bit.ly) used to obscure malicious landing page destination',
        'Suspicious Top-Level Domain (.online / .pw) commonly used in credential phishing campaigns',
        'Urgency triggers asserting account suspension within 24 hours'
      ],
      features: {
        url_count: 1,
        has_ip_url: 0,
        has_shortener: 1,
        suspicious_tld_count: 2,
        urgent_word_count: 3,
        sensitive_word_count: 4,
        uppercase_ratio: 0.08,
        exclamation_mark_count: 0,
        currency_symbol_count: 0,
        sender_replyto_mismatch: 1,
        has_suspicious_sender_tld: 1,
        has_freemail_sender: 0,
        suspicious_brand_impersonation: 1
      }
    },
    priority_analysis: {
      priority_score: 75,
      priority_level: 'HIGH',
      urgency: 'URGENT',
      category: 'Credential Phishing / Account Takeover',
      deadline: '24 Hours'
    },
    understanding: {
      tldr: [
        'Spoofed Microsoft 365 alert threatening account suspension if credentials are not entered within 24h.',
        'Uses Bitly shortener to camouflage a credential harvesting credential phishing site.',
        'Originating from an anonymized proxy IP.'
      ],
      intent: 'Employee Credential Harvesting / Office 365 Account Hijacking',
      key_entities: [
        { label: 'Target Platform', value: 'Microsoft 365 / Entra ID' },
        { label: 'Threat Vector', value: 'Bit.ly shortened link' },
        { label: 'Lookalike Domain', value: 'auth-microsoft365-verify.online' }
      ],
      sentiment: 'Deceptive Warning'
    },
    action_items: [
      { id: 'act-m1', title: 'Mark sender domain as malicious and block on email gateway', completed: false, deadline: 'Today', priority: 'HIGH' },
      { id: 'act-m2', title: 'Submit bit.ly destination link to Microsoft Defender & VirusTotal', completed: false, deadline: 'Today', priority: 'MEDIUM' }
    ],
    suggested_replies: [
      {
        id: 'rep-m-sec',
        tone: 'security_report',
        label: '🛡️ Report Credential Harvester',
        text: 'Report to IT Security: Credential harvesting attempt detected mimicking Microsoft 365. Message quarantined.'
      }
    ]
  },
  {
    id: 'em-003',
    subject: 'Q3 Security Architecture Review & SOC Automation Roadmap',
    sender: 'elena.rostova@cyberdefense-corp.com',
    sender_name: 'Elena Rostova (Lead Security Architect)',
    recipient: 'security-leads@company.internal',
    reply_to: 'elena.rostova@cyberdefense-corp.com',
    timestamp: '2 hours ago',
    date: '2026-08-24T05:40:00Z',
    is_read: true,
    is_starred: true,
    is_quarantined: false,
    body: `Hi Team,\n\nFollowing our sprint sync yesterday, I have finalized the draft for the Q3 Security Architecture Review and our AI-driven SOC triage automation proposal.\n\nKey discussion items for our meeting on Thursday at 2:00 PM EST:\n1. Phishing Engine Phase 1 rollout and ML model inference latency benchmarks.\n2. Automated sandboxing for unknown attachments.\n3. SOC team dashboard training sessions scheduled for next Tuesday.\n\nPlease review the attached architecture slides before Wednesday EOD so we can address any open questions.\n\nBest regards,\nElena Rostova\nPrincipal Security Architect | CyberDefense Corp`,
    links: [
      'https://cyberdefense-corp.com/internal/wiki/q3-roadmap'
    ],
    headers: {
      spf: 'PASS (cyberdefense-corp.com valid SPF record)',
      dkim: 'PASS (sig verified: rsa-sha256)',
      dmarc: 'PASS',
      sender_ip: '52.14.88.204',
      location: 'United States (AWS Corporate Hub)'
    },
    phishing_analysis: {
      is_phishing: false,
      risk_score: 4.2,
      risk_level: 'LOW',
      confidence: 0.98,
      flagged_reasons: [],
      features: {
        url_count: 1,
        has_ip_url: 0,
        has_shortener: 0,
        suspicious_tld_count: 0,
        urgent_word_count: 0,
        sensitive_word_count: 0,
        uppercase_ratio: 0.02,
        exclamation_mark_count: 0,
        currency_symbol_count: 0,
        sender_replyto_mismatch: 0,
        has_suspicious_sender_tld: 0,
        has_freemail_sender: 0,
        suspicious_brand_impersonation: 0
      }
    },
    priority_analysis: {
      priority_score: 92,
      priority_level: 'HIGH',
      urgency: 'NORMAL',
      category: 'Internal Architecture / Strategy',
      deadline: 'Wednesday EOD (Review slides) & Thursday 2:00 PM EST (Meeting)'
    },
    understanding: {
      tldr: [
        'Elena shared the finalized Q3 Security Architecture Review & SOC automation proposal.',
        'Team review of architecture slides requested before Wednesday EOD.',
        'Meeting scheduled for Thursday at 2:00 PM EST to discuss model latency & sandboxing.'
      ],
      intent: 'Project Review & Team Collaboration',
      key_entities: [
        { label: 'Event', value: 'Q3 Security Architecture Review Meeting' },
        { label: 'Meeting Date', value: 'Thursday, 2:00 PM EST' },
        { label: 'Review Deadline', value: 'Wednesday EOD' },
        { label: 'Key Topics', value: 'Phishing Engine ML Latency & Sandboxing' }
      ],
      sentiment: 'Constructive / Collaborative'
    },
    action_items: [
      { id: 'act-e1', title: 'Review Q3 Security Architecture proposal document', completed: true, deadline: 'Wed 5:00 PM', priority: 'HIGH' },
      { id: 'act-e2', title: 'Attend Security Architecture Review Meeting', completed: false, deadline: 'Thu 2:00 PM EST', priority: 'HIGH' },
      { id: 'act-e3', title: 'Send feedback on SOC triage dashboard mockup', completed: false, deadline: 'Fri 12:00 PM', priority: 'MEDIUM' }
    ],
    suggested_replies: [
      {
        id: 'rep-e-prof',
        tone: 'professional',
        label: '✅ Confirm Review & Attendance',
        text: 'Hi Elena, Thanks for sharing the roadmap. I will review the architecture slides by Wednesday EOD and look forward to the sync on Thursday at 2:00 PM EST.'
      },
      {
        id: 'rep-e-clar',
        tone: 'clarify',
        label: '❓ Inquire about Latency Benchmarks',
        text: 'Hi Elena, Quick question before Thursday: are the ML model inference latency benchmarks calculated on batch requests or single-stream inbound webhook feeds?'
      }
    ]
  },
  {
    id: 'em-004',
    subject: 'Overdue Freelance Development Invoice #INV-2026-881',
    sender: 'billing@freelance-dev-cloud99.xyz',
    sender_name: 'David Miller (Contract Developer)',
    recipient: 'accounts-payable@company.internal',
    reply_to: 'dmiller.payments981@gmail.com',
    timestamp: '5 hours ago',
    date: '2026-08-24T02:15:00Z',
    is_read: true,
    is_starred: false,
    is_quarantined: false,
    body: `Hello Accounts,\n\nAttached please find our updated remittance invoice #INV-2026-881 for $6,450.00 for last month's fullstack engineering contract work.\n\nNote that our bank routing details changed yesterday. Please click here to verify the updated bank transfer instructions: http://tinyurl.com/remit-pay-invoice-881\n\nKindly confirm payment execution date.\n\nRegards,\nDavid Miller`,
    links: [
      'http://tinyurl.com/remit-pay-invoice-881'
    ],
    headers: {
      spf: 'NEUTRAL (freelance-dev-cloud99.xyz has no SPF)',
      dkim: 'NONE',
      dmarc: 'NONE',
      sender_ip: '45.138.172.9',
      location: 'Netherlands (Anonymous VPS)'
    },
    phishing_analysis: {
      is_phishing: true,
      risk_score: 64.5,
      risk_level: 'MEDIUM',
      confidence: 0.88,
      flagged_reasons: [
        'Suspicious request to update bank routing instructions via an unverified link',
        'Shortened URL (tinyurl.com) hides payment destination endpoint',
        'Uncommon top-level domain (.xyz) combined with mismatched free Gmail reply-to address',
        'Missing SPF/DKIM verification records'
      ],
      features: {
        url_count: 1,
        has_ip_url: 0,
        has_shortener: 1,
        suspicious_tld_count: 1,
        urgent_word_count: 1,
        sensitive_word_count: 3,
        uppercase_ratio: 0.05,
        exclamation_mark_count: 0,
        currency_symbol_count: 1,
        sender_replyto_mismatch: 1,
        has_suspicious_sender_tld: 1,
        has_freemail_sender: 1,
        suspicious_brand_impersonation: 0
      }
    },
    priority_analysis: {
      priority_score: 60,
      priority_level: 'MEDIUM',
      urgency: 'NORMAL',
      category: 'Vendor Invoice Fraud Check',
      deadline: 'Pending Verification'
    },
    understanding: {
      tldr: [
        'Sender claims to be a contractor submitting an invoice for $6,450.00.',
        'Requests routing updates to new bank coordinates via a TinyURL link.',
        'Classic invoice modification diversion risk detected.'
      ],
      intent: 'Invoice Payment Diversion Scheme',
      key_entities: [
        { label: 'Amount Claimed', value: '$6,450.00' },
        { label: 'Invoice Number', value: 'INV-2026-881' },
        { label: 'Risk Factor', value: 'Unverified bank details update via URL' }
      ],
      sentiment: 'Transaction Request'
    },
    action_items: [
      { id: 'act-inv1', title: 'Hold payment until contractor is verified via phone registry', completed: false, deadline: 'Before Payment', priority: 'HIGH' },
      { id: 'act-inv2', title: 'Cross-reference contractor vendor records in procurement database', completed: false, deadline: 'Today', priority: 'MEDIUM' }
    ],
    suggested_replies: [
      {
        id: 'rep-inv-clar',
        tone: 'clarify',
        label: '📞 Request Vendor Phone Verification',
        text: 'Hello David, In compliance with our anti-fraud policy, all banking detail alterations must be verified via our existing voice callback protocol on your registered phone number. We will contact you shortly.'
      },
      {
        id: 'rep-inv-dec',
        tone: 'decline',
        label: '⛔ Reject Unverified Payment Link',
        text: 'We cannot process payment updates via third-party link shorteners. Please resubmit your invoice through the official vendor portal.'
      }
    ]
  },
  {
    id: 'em-005',
    subject: 'Monthly AWS Cost Optimization Report & Savings Recommendations',
    sender: 'no-reply-reports@amazon-aws.com',
    sender_name: 'AWS CloudWatch Billing Reports',
    recipient: 'devops-lead@company.internal',
    reply_to: 'no-reply-reports@amazon-aws.com',
    timestamp: '1 day ago',
    date: '2026-08-23T11:00:00Z',
    is_read: true,
    is_starred: false,
    is_quarantined: false,
    body: `Hello DevOps Team,\n\nYour monthly AWS CloudWatch cost report is now available. Your current estimated spend for August 2026 is $1,240.50 (9% below monthly forecast).\n\nKey optimization opportunities identified:\n- 2 idle RDS test instances can be stopped during off-hours ($140/mo potential savings).\n- Upgrade 4 EC2 instances to Graviton3 architecture ($85/mo potential savings).\n\nView details in AWS Console: https://aws.amazon.com/console/billing\n\nThank you,\nAmazon Web Services`,
    links: [
      'https://aws.amazon.com/console/billing'
    ],
    headers: {
      spf: 'PASS (amazon-aws.com valid SPF record)',
      dkim: 'PASS (sig verified: rsa-sha256)',
      dmarc: 'PASS',
      sender_ip: '54.240.12.19',
      location: 'United States (Amazon Data Services)'
    },
    phishing_analysis: {
      is_phishing: false,
      risk_score: 1.8,
      risk_level: 'LOW',
      confidence: 0.99,
      flagged_reasons: [],
      features: {
        url_count: 1,
        has_ip_url: 0,
        has_shortener: 0,
        suspicious_tld_count: 0,
        urgent_word_count: 0,
        sensitive_word_count: 0,
        uppercase_ratio: 0.03,
        exclamation_mark_count: 0,
        currency_symbol_count: 3,
        sender_replyto_mismatch: 0,
        has_suspicious_sender_tld: 0,
        has_freemail_sender: 0,
        suspicious_brand_impersonation: 0
      }
    },
    priority_analysis: {
      priority_score: 45,
      priority_level: 'LOW',
      urgency: 'LOW',
      category: 'Cloud Infrastructure Report',
      deadline: 'Informational (Monthly)'
    },
    understanding: {
      tldr: [
        'Monthly AWS billing report shows current spend at $1,240.50 (9% under forecast).',
        'Identifies potential $225/mo savings via idle RDS shutdown and Graviton3 upgrades.'
      ],
      intent: 'Informational Infrastructure Report',
      key_entities: [
        { label: 'Current Spend', value: '$1,240.50' },
        { label: 'Potential Savings', value: '$225.00/mo' },
        { label: 'Service Provider', value: 'Amazon Web Services' }
      ],
      sentiment: 'Positive / Informative'
    },
    action_items: [
      { id: 'act-aws1', title: 'Schedule cron job to stop idle staging RDS databases on weekends', completed: false, deadline: 'Next Week', priority: 'LOW' }
    ],
    suggested_replies: [
      {
        id: 'rep-aws-none',
        tone: 'professional',
        label: '📋 Acknowledge & Archive',
        text: 'Automated notification acknowledged and logged into infrastructure cost tracker.'
      }
    ]
  }
];
