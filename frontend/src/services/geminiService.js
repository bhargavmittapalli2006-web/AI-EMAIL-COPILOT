/**
 * Gemini Email Intelligence API Service (ML-11)
 * ----------------------------------------------------
 * Connects the frontend to the backend /api/v1/intelligence endpoint.
 * 
 * CRITICAL SECURITY REQUIREMENTS:
 * - Direct browser calls to Gemini are STRICTLY PROHIBITED.
 * - GEMINI_API_KEY is never exposed to frontend code.
 * - The backend is the ONLY authoritative source for intelligence generation and security gating.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const TIMEOUT_MS = 15000;

/**
 * Fetches structured email intelligence from the backend
 * @param {Object} email - Email payload
 * @param {string} email.subject - Subject line
 * @param {string} email.sender - Sender email address
 * @param {string} email.body - Email text body
 * @param {string} [email.reply_to] - Reply-To header
 * @param {Object} [analysis] - Authoritative ML-10 analysis output (optional hint)
 * @returns {Promise<Object>} Normalized intelligence response
 */
export async function fetchEmailIntelligence(email = {}, analysis = null) {
  const requestPayload = {
    subject: email.subject || '',
    sender: email.senderEmail || email.sender || '',
    body: email.body || '',
    reply_to: email.replyTo || email.reply_to || email.senderEmail || email.sender || '',
    is_phishing: analysis ? Boolean(analysis.is_phishing) : null,
    risk_score: analysis && typeof analysis.risk_score === 'number' ? analysis.risk_score : null,
    risk_level: analysis?.risk_level ? String(analysis.risk_level).toUpperCase() : null,
    flagged_reasons: Array.isArray(analysis?.flagged_reasons) ? analysis.flagged_reasons : [],
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/intelligence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
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
    return normalizeIntelligenceResponse(data);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('AI Intelligence request timed out after 15 seconds.');
    }
    throw error;
  }
}

/**
 * Normalizes backend EmailIntelligenceResponse
 */
function normalizeIntelligenceResponse(data) {
  return {
    summary: typeof data.summary === 'string' ? data.summary.trim() : '',
    action_items: Array.isArray(data.action_items)
      ? data.action_items.map((item) => ({
          text: typeof item === 'string' ? item : item.text || '',
          priority: (item.priority || 'medium').toLowerCase(),
        }))
      : [],
    key_points: Array.isArray(data.key_points) ? data.key_points : [],
    risk_explanation: typeof data.risk_explanation === 'string' ? data.risk_explanation.trim() : '',
    recommended_actions: Array.isArray(data.recommended_actions) ? data.recommended_actions : [],
  };
}
