/**
 * Clean API Service Layer for AI Email Copilot
 * Seamlessly interfaces with Mock Data Engine and FastAPI Backend
 */

import { apiClient } from './apiClient';
import { initialMockEmails } from './mockData';

const STORAGE_KEY = 'ai_email_copilot_emails_v1';
const USE_MOCK_ENV = import.meta.env.VITE_USE_MOCK !== 'false';

// Helper to initialize local storage cache
function getStoredEmails() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to read from localStorage', e);
  }
  return [...initialMockEmails];
}

function saveStoredEmails(emails) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

class EmailService {
  constructor() {
    this.emails = getStoredEmails();
    this.useMock = USE_MOCK_ENV;
  }

  setUseMock(value) {
    this.useMock = Boolean(value);
  }

  isUsingMock() {
    return this.useMock;
  }

  resetToDefaultMockData() {
    this.emails = [...initialMockEmails];
    saveStoredEmails(this.emails);
    return [...this.emails];
  }

  /**
   * Health check to detect if FastAPI backend is alive
   */
  async checkBackendHealth() {
    try {
      const data = await apiClient.get('/health');
      return { online: true, service: data.service || 'phishing-engine', ...data };
    } catch (err) {
      return { online: false, error: err.message };
    }
  }

  /**
   * Get all emails with optional filtering & search
   */
  async getEmails(options = {}) {
    // Simulate network delay for realistic loading skeleton experience
    await new Promise((res) => setTimeout(res, options.skipDelay ? 0 : 250));

    let list = [...this.emails];

    if (options.riskLevel && options.riskLevel !== 'ALL') {
      list = list.filter((em) => em.phishing_analysis?.risk_level === options.riskLevel);
    }

    if (options.priorityLevel && options.priorityLevel !== 'ALL') {
      list = list.filter((em) => em.priority_analysis?.priority_level === options.priorityLevel);
    }

    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.toLowerCase().trim();
      list = list.filter(
        (em) =>
          em.subject.toLowerCase().includes(q) ||
          em.sender.toLowerCase().includes(q) ||
          em.sender_name.toLowerCase().includes(q) ||
          em.body.toLowerCase().includes(q)
      );
    }

    if (options.filterType === 'starred') {
      list = list.filter((em) => em.is_starred);
    } else if (options.filterType === 'quarantined') {
      list = list.filter((em) => em.is_quarantined);
    } else if (options.filterType === 'threats') {
      list = list.filter((em) => em.phishing_analysis?.is_phishing);
    }

    return list;
  }

  /**
   * Get a single email by ID
   */
  async getEmailById(id) {
    await new Promise((res) => setTimeout(res, 100));
    const found = this.emails.find((em) => em.id === id);
    if (!found) {
      throw new Error(`Email with ID "${id}" not found.`);
    }
    return found;
  }

  /**
   * Toggle email read status
   */
  async markEmailAsRead(id, isRead = true) {
    this.emails = this.emails.map((em) => (em.id === id ? { ...em, is_read: isRead } : em));
    saveStoredEmails(this.emails);
    return this.getEmailById(id);
  }

  /**
   * Toggle Starred status
   */
  async toggleStar(id) {
    this.emails = this.emails.map((em) =>
      em.id === id ? { ...em, is_starred: !em.is_starred } : em
    );
    saveStoredEmails(this.emails);
    return this.getEmailById(id);
  }

  /**
   * Quarantine a suspicious email
   */
  async quarantineEmail(id) {
    this.emails = this.emails.map((em) =>
      em.id === id ? { ...em, is_quarantined: true, is_read: true } : em
    );
    saveStoredEmails(this.emails);
    return this.getEmailById(id);
  }

  /**
   * Mark an email as Safe / Verified
   */
  async markEmailSafe(id) {
    this.emails = this.emails.map((em) => {
      if (em.id === id) {
        return {
          ...em,
          is_quarantined: false,
          phishing_analysis: {
            ...em.phishing_analysis,
            is_phishing: false,
            risk_score: Math.min(em.phishing_analysis?.risk_score || 5, 8.0),
            risk_level: 'LOW',
            flagged_reasons: ['User manually verified and marked as safe.']
          }
        };
      }
      return em;
    });
    saveStoredEmails(this.emails);
    return this.getEmailById(id);
  }

  /**
   * Toggle Action Item Completion
   */
  async toggleActionItem(emailId, actionId) {
    this.emails = this.emails.map((em) => {
      if (em.id === emailId && em.action_items) {
        return {
          ...em,
          action_items: em.action_items.map((act) =>
            act.id === actionId ? { ...act, completed: !act.completed } : act
          ),
        };
      }
      return em;
    });
    saveStoredEmails(this.emails);
    return this.getEmailById(emailId);
  }

  /**
   * Core AI Analysis: Connects to FastAPI endpoint or runs client heuristic engine
   */
  async analyzeEmail(payload) {
    const { subject, sender, body, reply_to = '', links = [] } = payload;

    // 1. Try Live FastAPI backend if not explicitly disabled
    if (!this.useMock) {
      try {
        const liveResponse = await apiClient.post('/api/v1/analyze', {
          subject,
          sender,
          body,
          reply_to,
          links,
        });

        // Enrich with Priority, Understanding, and Action engines
        return this.synthesizeFullAnalysis({
          subject,
          sender,
          body,
          reply_to,
          links,
          phishing_analysis: liveResponse,
        });
      } catch (err) {
        console.warn('Live FastAPI analyze failed, falling back to mock intelligence:', err.message);
      }
    }

    // 2. Mock / Heuristic Analysis fallback
    await new Promise((res) => setTimeout(res, 600)); // Simulate AI computation time
    return this.heuristicAnalyze({ subject, sender, body, reply_to, links });
  }

  /**
   * Heuristic analysis generator for standalone demonstration
   */
  heuristicAnalyze({ subject, sender, body, reply_to = '', links = [] }) {
    const textLower = `${subject} ${body}`.toLowerCase();
    const flagged_reasons = [];

    // Extract links from body if not provided
    const extractedLinks = [...links];
    const urlRegex = /https?:\/\/[^\s$.?#].[^\s]*/gi;
    const matches = body.match(urlRegex) || [];
    matches.forEach((m) => {
      if (!extractedLinks.includes(m)) extractedLinks.push(m);
    });

    let has_ip_url = 0;
    let has_shortener = 0;
    let suspicious_tld_count = 0;
    let urgent_word_count = 0;
    let sensitive_word_count = 0;
    let sender_replyto_mismatch = 0;
    let has_suspicious_sender_tld = 0;
    let has_freemail_sender = 0;
    let suspicious_brand_impersonation = 0;

    // Check IP URLs
    extractedLinks.forEach((url) => {
      if (/\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
        has_ip_url = 1;
        flagged_reasons.push(`Direct IP Address hyperlink detected: ${url}`);
      }
      if (/bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd/i.test(url)) {
        has_shortener = 1;
        flagged_reasons.push(`Shortened or obfuscated hyperlink detected: ${url}`);
      }
      if (/\.(xyz|top|online|pw|club|vip|buzz|work|shop)\b/i.test(url)) {
        suspicious_tld_count++;
        flagged_reasons.push(`Suspicious top-level domain detected in link: ${url}`);
      }
    });

    // Check urgency words
    const urgentWords = ['urgent', 'immediately', '24 hours', 'action required', 'suspend', 'restricted', 'expire', 'asap', 'overdue', 'final notice'];
    urgentWords.forEach((w) => {
      if (textLower.includes(w)) urgent_word_count++;
    });
    if (urgent_word_count >= 2) {
      flagged_reasons.push(`High concentration of urgent/coercive language (${urgent_word_count} triggers)`);
    }

    // Check sensitive words
    const sensitiveWords = ['wire', 'transfer', 'password', 'bank', 'routing', 'credentials', 'invoice', 'credit card', 'ssn', 'tax', 'escrow'];
    sensitiveWords.forEach((w) => {
      if (textLower.includes(w)) sensitive_word_count++;
    });
    if (sensitive_word_count >= 2) {
      flagged_reasons.push(`Sensitive financial or credential keywords detected (${sensitive_word_count} triggers)`);
    }

    // Check sender mismatch
    if (reply_to && reply_to.trim() !== '' && sender !== reply_to) {
      sender_replyto_mismatch = 1;
      flagged_reasons.push(`Sender address (${sender}) does not match Reply-To (${reply_to})`);
    }

    // Check sender domain
    if (/@(gmail\.com|yahoo\.com|protonmail\.com|hotmail\.com)/i.test(sender)) {
      has_freemail_sender = 1;
    }
    if (/\.(xyz|top|online|pw|club|co|vip)\b/i.test(sender)) {
      has_suspicious_sender_tld = 1;
      flagged_reasons.push(`Suspicious sender domain extension`);
    }

    // Brand impersonation check
    const brands = ['microsoft', 'apple', 'amazon', 'paypal', 'google', 'bank of america', 'wells fargo', 'dhl', 'fedex'];
    brands.forEach((brand) => {
      if (textLower.includes(brand) && !sender.toLowerCase().includes(brand.replace(/\s+/g, ''))) {
        suspicious_brand_impersonation = 1;
        flagged_reasons.push(`Possible ${brand.toUpperCase()} brand impersonation detected in unverified sender`);
      }
    });

    // Calculate risk score
    let score = 5.0;
    if (has_ip_url) score += 40;
    if (has_shortener) score += 20;
    if (suspicious_brand_impersonation) score += 25;
    if (sender_replyto_mismatch) score += 20;
    if (urgent_word_count >= 2) score += 15;
    if (sensitive_word_count >= 2) score += 15;
    if (suspicious_tld_count > 0) score += 10;
    if (has_freemail_sender && sensitive_word_count > 0) score += 15;

    score = Math.min(Math.max(score, 2.5), 98.5);

    let risk_level = 'LOW';
    if (score >= 80) risk_level = 'CRITICAL';
    else if (score >= 60) risk_level = 'HIGH';
    else if (score >= 30) risk_level = 'MEDIUM';

    const is_phishing = score >= 50;

    const phishing_analysis = {
      is_phishing,
      risk_score: Number(score.toFixed(1)),
      risk_level,
      confidence: 0.92,
      flagged_reasons,
      features: {
        url_count: extractedLinks.length,
        has_ip_url,
        has_shortener,
        suspicious_tld_count,
        urgent_word_count,
        sensitive_word_count,
        uppercase_ratio: 0.05,
        exclamation_mark_count: (body.match(/!/g) || []).length,
        currency_symbol_count: (body.match(/[\$\€\£]/g) || []).length,
        sender_replyto_mismatch,
        has_suspicious_sender_tld,
        has_freemail_sender,
        suspicious_brand_impersonation,
      },
    };

    return this.synthesizeFullAnalysis({
      subject,
      sender,
      body,
      reply_to,
      links: extractedLinks,
      phishing_analysis,
    });
  }

  /**
   * Synthesize priority, understanding and action engines for any analysis
   */
  synthesizeFullAnalysis({ subject, sender, body, reply_to = '', links = [], phishing_analysis }) {
    const isPhish = phishing_analysis.is_phishing;
    const isCritical = phishing_analysis.risk_level === 'CRITICAL';

    const priority_score = isCritical ? 98 : isPhish ? 75 : 60;
    const priority_level = isCritical ? 'HIGH' : isPhish ? 'HIGH' : 'MEDIUM';

    const newEmail = {
      id: `em-scan-${Date.now()}`,
      subject,
      sender,
      sender_name: sender.split('@')[0].replace(/[._-]/g, ' '),
      recipient: 'user@company.internal',
      reply_to,
      timestamp: 'Just now',
      date: new Date().toISOString(),
      is_read: false,
      is_starred: isCritical,
      is_quarantined: false,
      body,
      links,
      headers: {
        spf: isPhish ? 'FAIL / SOFTFAIL' : 'PASS',
        dkim: isPhish ? 'NONE' : 'PASS',
        dmarc: isPhish ? 'FAIL' : 'PASS',
        sender_ip: links.length > 0 && links[0].includes('194') ? '194.26.29.112' : '198.51.100.42',
        location: isPhish ? 'High-Risk Network ASN' : 'Verified Cloud Relay',
      },
      phishing_analysis,
      priority_analysis: {
        priority_score,
        priority_level,
        urgency: isCritical ? 'URGENT' : 'NORMAL',
        category: isPhish ? 'Security Alert / Threat Triage' : 'General Communication',
        deadline: isCritical ? 'Immediate Action Required' : 'Standard Routine',
      },
      understanding: {
        tldr: [
          isPhish
            ? `Threat analysis detected ${phishing_analysis.flagged_reasons.length} security flags.`
            : `Verified communication analyzed without significant threat signals.`,
          `Analyzed content contains ${body.split(' ').length} words and ${links.length} hyperlinks.`,
        ],
        intent: isPhish ? 'Potential Attack / Phishing Probe' : 'General Inquiry / Correspondence',
        key_entities: [
          { label: 'Sender Host', value: sender.split('@')[1] || sender },
          { label: 'Hyperlinks', value: `${links.length} link(s)` },
          { label: 'Threat Status', value: isPhish ? 'Malicious / Suspicious' : 'Clean / Safe' },
        ],
        sentiment: isPhish ? 'Suspicious / Coercive' : 'Neutral / Legitimate',
      },
      action_items: [
        {
          id: `act-${Date.now()}-1`,
          title: isPhish ? 'Quarantine message and submit to threat intelligence feed' : 'Review message details and respond',
          completed: false,
          deadline: isPhish ? 'Immediate' : 'Today',
          priority: isPhish ? 'CRITICAL' : 'MEDIUM',
        },
      ],
      suggested_replies: [
        {
          id: `rep-${Date.now()}-1`,
          tone: isPhish ? 'security_report' : 'professional',
          label: isPhish ? '🛡️ Log Security Warning' : '✅ Send Professional Acknowledgment',
          text: isPhish
            ? 'Security Advisory: This message was identified as potentially fraudulent. Sender address has been submitted for firewall blocklisting.'
            : 'Thank you for reaching out. I have received your message and will review the details shortly.',
        },
      ],
    };

    // Save to active list
    this.emails = [newEmail, ...this.emails];
    saveStoredEmails(this.emails);

    return newEmail;
  }
}

export const emailService = new EmailService();
