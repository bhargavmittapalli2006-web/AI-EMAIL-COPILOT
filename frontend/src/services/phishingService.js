/**
 * Phishing Analysis API Service (ML-10)
 * ----------------------------------------------------
 * Connects the frontend directly to the FastAPI /api/v1/analyze and /health endpoints.
 * 
 * CRITICAL ARCHITECTURE RULE:
 * - The backend is the ONLY authoritative source for ML threat classifications and risk scores.
 * - No ML calculations or fake risk scores are generated in frontend code.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const TIMEOUT_MS = 10000;

/**
 * Extracts links from text body if not explicitly provided
 */
export function extractLinksFromText(body = '') {
  if (!body || typeof body !== 'string') return [];
  const urlRegex = /https?:\/\/[^\s$.?#].[^\s]*/gi;
  const matches = body.match(urlRegex) || [];
  return [...new Set(matches)];
}

/**
 * Checks backend health and model readiness
 * @returns {Promise<{ isOnline: boolean, status: string, modelLoaded: boolean, geminiAvailable: boolean, version: string, error?: string }>}
 */
export async function checkBackendHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        isOnline: false,
        status: 'degraded',
        modelLoaded: false,
        geminiAvailable: false,
        version: '1.0.0',
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      isOnline: true,
      status: data.status || 'healthy',
      modelLoaded: Boolean(data.model_loaded),
      geminiAvailable: Boolean(data.gemini_available),
      version: data.version || '1.0.0',
      modelPath: data.model_path || null,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      isOnline: false,
      status: 'offline',
      modelLoaded: false,
      geminiAvailable: false,
      version: '1.0.0',
      error: err.name === 'AbortError' ? 'Health probe timed out' : err.message,
    };
  }
}

/**
 * Sends email payload to backend ML-10 endpoint (POST /api/v1/analyze)
 * @param {Object} email - Email payload
 * @param {string} email.subject - Subject line
 * @param {string} email.sender - Sender email address
 * @param {string} email.body - Email text body
 * @param {string} [email.reply_to] - Reply-To header if present
 * @param {string[]} [email.links] - Extracted links
 * @returns {Promise<Object>} Real ML PhishingAnalysisResponse
 */
export async function analyzeEmailWithML(email = {}) {
  const requestPayload = {
    subject: email.subject || '',
    sender: email.senderEmail || email.sender || '',
    body: email.body || '',
    reply_to: email.replyTo || email.reply_to || email.senderEmail || email.sender || '',
    links: email.links && email.links.length > 0 ? email.links : extractLinksFromText(email.body || ''),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
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

    const analysis = await response.json();
    return normalizeAnalysisResponse(analysis);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Analysis request timed out after 10 seconds.');
    }
    throw error;
  }
}

/**
 * Normalizes backend PhishingAnalysisResponse fields for frontend display
 */
function normalizeAnalysisResponse(data) {
  return {
    is_phishing: Boolean(data.is_phishing),
    classification: data.classification || (data.is_phishing ? 'phishing' : 'legitimate'),
    risk_score: typeof data.risk_score === 'number' ? data.risk_score : 0.0,
    risk_level: (data.risk_level || (data.is_phishing ? 'CRITICAL' : 'LOW')).toUpperCase(),
    confidence: typeof data.confidence === 'number' ? data.confidence : 0.5,
    flagged_reasons: Array.isArray(data.flagged_reasons) ? data.flagged_reasons : [],
    features: {
      sender_risk: data.features?.sender_risk ?? 0.0,
      link_risk: data.features?.link_risk ?? 0.0,
      content_risk: data.features?.content_risk ?? 0.0,
      url_count: data.features?.url_count ?? 0,
      has_ip_url: data.features?.has_ip_url ?? 0,
      has_shortener: data.features?.has_shortener ?? 0,
      suspicious_tld_count: data.features?.suspicious_tld_count ?? 0,
      urgent_word_count: data.features?.urgent_word_count ?? 0,
      sensitive_word_count: data.features?.sensitive_word_count ?? 0,
      uppercase_ratio: data.features?.uppercase_ratio ?? 0.0,
      exclamation_mark_count: data.features?.exclamation_mark_count ?? 0,
      currency_symbol_count: data.features?.currency_symbol_count ?? 0,
      sender_replyto_mismatch: data.features?.sender_replyto_mismatch ?? 0,
      has_suspicious_sender_tld: data.features?.has_suspicious_sender_tld ?? 0,
      has_freemail_sender: data.features?.has_freemail_sender ?? 0,
      suspicious_brand_impersonation: data.features?.suspicious_brand_impersonation ?? 0,
    },
  };
}
