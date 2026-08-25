/**
 * AI Reply Suggestions API Service (ML-12)
 * ----------------------------------------------------
 * Connects the frontend to the backend /api/v1/reply-suggestions endpoint.
 * 
 * CRITICAL ARCHITECTURE & SECURITY RULES:
 * - Direct browser calls to Gemini are STRICTLY PROHIBITED.
 * - GEMINI_API_KEY is never exposed to frontend code.
 * - The backend is the ONLY authoritative source for security gating and reply generation.
 * - When reply_allowed is false, NO reply drafts may be rendered.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const TIMEOUT_MS = 15000;

/**
 * Extracts links from body if needed
 */
function extractLinks(body = '') {
  if (!body || typeof body !== 'string') return [];
  const urlRegex = /https?:\/\/[^\s$.?#].[^\s]*/gi;
  const matches = body.match(urlRegex) || [];
  return [...new Set(matches)];
}

/**
 * Fetches AI reply suggestions from backend
 * @param {Object} email - Email payload
 * @param {string} email.subject - Subject line
 * @param {string} email.sender - Sender email address
 * @param {string} email.body - Email text body
 * @param {string} [email.reply_to] - Reply-To header
 * @param {Object} [analysis] - Authoritative ML-10 analysis output (optional hint)
 * @returns {Promise<Object>} Normalized reply suggestions response
 */
export async function fetchReplySuggestions(email = {}, analysis = null, token = null) {
  const requestPayload = {
    subject: email.subject || '',
    sender: email.senderEmail || email.sender || '',
    body: email.body || '',
    reply_to: email.replyTo || email.reply_to || email.senderEmail || email.sender || '',
    is_phishing: analysis ? Boolean(analysis.is_phishing) : null,
    risk_score: analysis && typeof analysis.risk_score === 'number' ? analysis.risk_score : null,
    risk_level: analysis?.risk_level ? String(analysis.risk_level).toUpperCase() : null,
    links: email.links && email.links.length > 0 ? email.links : extractLinks(email.body || ''),
    ...(email.id ? { email_id: email.id } : {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/reply-suggestions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);


    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) errorDetail = errorJson.detail;
      } catch (_) {}
      throw new Error(errorDetail);
    }

    const data = await response.json();
    return normalizeReplyResponse(data);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('AI Reply generation request timed out after 15 seconds.');
    }
    throw error;
  }
}

/**
 * Normalizes backend ReplySuggestionsResponse
 */
function normalizeReplyResponse(data) {
  return {
    reply_allowed: Boolean(data.reply_allowed),
    reason: typeof data.reason === 'string' ? data.reason.trim() : null,
    professional_reply: data.reply_allowed && typeof data.professional_reply === 'string' ? data.professional_reply.trim() : null,
    friendly_reply: data.reply_allowed && typeof data.friendly_reply === 'string' ? data.friendly_reply.trim() : null,
    concise_reply: data.reply_allowed && typeof data.concise_reply === 'string' ? data.concise_reply.trim() : null,
    source: data.source || (data.reply_allowed ? 'gemini' : 'blocked'),
  };
}
