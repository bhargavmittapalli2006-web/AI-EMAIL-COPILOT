/**
 * API Service Abstraction for AI Email Copilot
 * Provides unified interface for email phishing and threat analysis.
 * Target Endpoint: POST /api/v1/analyze
 */

import { apiClient } from './apiClient';

const USE_MOCK_DEFAULT = import.meta.env.VITE_USE_MOCK !== 'false';

/**
 * Extracts links from text body if not explicitly provided
 */
function extractLinks(body = '') {
  const urlRegex = /https?:\/\/[^\s$.?#].[^\s]*/gi;
  return body.match(urlRegex) || [];
}

/**
 * Generates dynamic mock analysis data matching the target schema
 */
function generateMockAnalysis(email) {
  const subject = email.subject || '';
  const sender = email.sender || '';
  const body = email.body || '';
  const reply_to = email.reply_to || '';
  const links = email.links || extractLinks(body);
  const text = `${subject} ${body}`.toLowerCase();

  // If email already contains pre-computed phishing_analysis, normalize to target schema
  if (email.phishing_analysis) {
    const pa = email.phishing_analysis;
    const isPhish = Boolean(pa.is_phishing);
    const score = Math.round(pa.risk_score ?? (isPhish ? 92 : 8));
    const level = (pa.risk_level || (score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 30 ? 'suspicious' : 'safe')).toLowerCase();
    const classification = isPhish ? (score >= 80 ? 'phishing' : 'suspicious') : 'safe';
    const confidence = pa.confidence ?? 0.96;

    const rawFeat = pa.features || {};
    const senderRisk = rawFeat.sender_risk != null
      ? rawFeat.sender_risk
      : (rawFeat.sender_replyto_mismatch || rawFeat.suspicious_brand_impersonation ? 0.91 : isPhish ? 0.78 : 0.05);
    const linkRisk = rawFeat.link_risk != null
      ? rawFeat.link_risk
      : (rawFeat.has_ip_url || rawFeat.has_shortener ? 0.94 : isPhish ? 0.82 : 0.04);
    const contentRisk = rawFeat.content_risk != null
      ? rawFeat.content_risk
      : ((rawFeat.urgent_word_count || 0) > 1 || (rawFeat.sensitive_word_count || 0) > 1 ? 0.87 : isPhish ? 0.75 : 0.08);

    return {
      is_phishing: isPhish,
      classification,
      risk_score: score,
      risk_level: level,
      confidence,
      flagged_reasons: pa.flagged_reasons && pa.flagged_reasons.length > 0
        ? pa.flagged_reasons
        : isPhish
          ? ['Suspicious sender', 'Suspicious link', 'Urgent language']
          : [],
      features: {
        sender_risk: senderRisk,
        link_risk: linkRisk,
        content_risk: contentRisk,
      },
    };
  }

  // Heuristic evaluation for arbitrary custom email payloads
  const hasIpUrl = links.some((l) => /\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(l));
  const hasShortener = links.some((l) => /bit\.ly|tinyurl|t\.co/i.test(l));
  const hasMismatch = Boolean(reply_to && reply_to !== sender);
  const urgentWords = ['urgent', 'immediately', '24 hours', 'expire', 'suspend', 'action required', 'transfer', 'password', 'escrow'];
  const urgentTriggers = urgentWords.filter((w) => text.includes(w));

  const isPhishingThreat = hasIpUrl || hasShortener || hasMismatch || urgentTriggers.length >= 2;

  if (isPhishingThreat) {
    const reasons = [];
    if (hasMismatch || /secure-verify|update-auth|protonmail/i.test(sender)) reasons.push('Suspicious sender');
    if (hasIpUrl || hasShortener || links.length > 0) reasons.push('Suspicious link');
    if (urgentTriggers.length > 0) reasons.push('Urgent language');
    if (reasons.length === 0) reasons.push('Suspicious communication pattern');

    return {
      is_phishing: true,
      classification: 'phishing',
      risk_score: 92,
      risk_level: 'critical',
      confidence: 0.96,
      flagged_reasons: reasons,
      features: {
        sender_risk: hasMismatch ? 0.91 : 0.85,
        link_risk: hasIpUrl || hasShortener ? 0.94 : 0.76,
        content_risk: urgentTriggers.length >= 2 ? 0.87 : 0.65,
      },
    };
  }

  // Safe email
  return {
    is_phishing: false,
    classification: 'safe',
    risk_score: 6,
    risk_level: 'safe',
    confidence: 0.98,
    flagged_reasons: [],
    features: {
      sender_risk: 0.04,
      link_risk: 0.02,
      content_risk: 0.05,
    },
  };
}

/**
 * Main Email Analysis Abstraction
 * Calls FastAPI POST /api/v1/analyze or falls back to mock intelligence
 *
 * @param {Object} email - Email payload
 * @param {string} email.subject - Subject line of email
 * @param {string} email.sender - Sender email address
 * @param {string} email.body - Body text of email
 * @param {string} [email.reply_to] - Reply-To header if present
 * @param {Array<string>} [email.links] - Extracted links from email
 * @returns {Promise<Object>} Phishing analysis response
 */
export async function analyzeEmail(email = {}) {
  const requestPayload = {
    subject: email.subject || '',
    sender: email.sender || '',
    body: email.body || '',
    reply_to: email.reply_to || email.sender || '',
    links: email.links || extractLinks(email.body || ''),
  };

  // If mock mode is explicitly disabled, attempt live backend inference
  if (!USE_MOCK_DEFAULT) {
    try {
      const liveResponse = await apiClient.post('/api/v1/analyze', requestPayload);
      return liveResponse;
    } catch (err) {
      console.warn('[API] Live /api/v1/analyze request failed, falling back to mock intelligence:', err.message);
    }
  }

  // Simulate network latency (150-300ms) for realistic loading feedback
  await new Promise((resolve) => setTimeout(resolve, 250));

  return generateMockAnalysis(email);
}

/**
 * Check backend health status
 */
export async function checkHealth() {
  try {
    return await apiClient.get('/health');
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}
