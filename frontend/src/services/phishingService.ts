import { EmailAnalysisRequest, PhishingAnalysisResponse } from '../types/phishing';
import { DEMO_EMAILS } from '../data/demoEmails';

export { type PhishingAnalysisResponse };

const API_BASE_URL = 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Normalizes raw features into the standardized sender_risk, link_risk, and content_risk metrics.
 */
function normalizeFeatures(rawFeatures: any = {}): { sender_risk: number; link_risk: number; content_risk: number } {
  if (
    typeof rawFeatures.sender_risk === 'number' &&
    typeof rawFeatures.link_risk === 'number' &&
    typeof rawFeatures.content_risk === 'number'
  ) {
    return {
      sender_risk: rawFeatures.sender_risk,
      link_risk: rawFeatures.link_risk,
      content_risk: rawFeatures.content_risk,
    };
  }

  // Calculate normalized ratios from granular indicators
  const senderRisk = Math.min(
    1.0,
    (rawFeatures.sender_replyto_mismatch ? 0.4 : 0) +
    (rawFeatures.suspicious_brand_impersonation ? 0.35 : 0) +
    (rawFeatures.has_suspicious_sender_tld ? 0.25 : 0) +
    (rawFeatures.has_freemail_sender ? 0.1 : 0)
  );

  const linkRisk = Math.min(
    1.0,
    (rawFeatures.has_ip_url ? 0.5 : 0) +
    (rawFeatures.has_shortener ? 0.3 : 0) +
    ((rawFeatures.suspicious_tld_count || 0) > 0 ? 0.3 : 0) +
    ((rawFeatures.url_count || 0) > 2 ? 0.1 : 0)
  );

  const contentRisk = Math.min(
    1.0,
    ((rawFeatures.urgent_word_count || 0) >= 2 ? 0.4 : (rawFeatures.urgent_word_count || 0) * 0.2) +
    ((rawFeatures.sensitive_word_count || 0) >= 2 ? 0.45 : (rawFeatures.sensitive_word_count || 0) * 0.2) +
    ((rawFeatures.uppercase_ratio || 0) > 0.3 ? 0.2 : 0)
  );

  return {
    sender_risk: Number(senderRisk.toFixed(2)),
    link_risk: Number(linkRisk.toFixed(2)),
    content_risk: Number(contentRisk.toFixed(2)),
  };
}

/**
 * Executes phishing analysis against backend API with timeout and fallback support.
 */
export async function analyzeEmail(
  request: EmailAnalysisRequest,
  isDemoMode: boolean = false
): Promise<PhishingAnalysisResponse> {
  // If demo mode is active, look up matching mock email or generate heuristic mock
  if (isDemoMode) {
    await new Promise((res) => setTimeout(res, 500)); // simulate brief network delay
    const matched = DEMO_EMAILS.find((e) => e.subject === request.subject || e.sender === request.sender);
    if (matched && matched.analysis) {
      return matched.analysis;
    }

    // Default fallback calculation for custom demo inputs
    const hasPhishKeyword = /urgent|verify|suspend|password|ssn|pin|locked|bank/i.test(`${request.subject} ${request.body}`);
    const isPhishing = hasPhishKeyword;
    return {
      is_phishing: isPhishing,
      classification: isPhishing ? 'phishing' : 'legitimate',
      risk_score: isPhishing ? 82 : 12,
      risk_level: isPhishing ? 'CRITICAL' : 'LOW',
      confidence: 0.94,
      flagged_reasons: isPhishing
        ? ['Email text contains sensitive credential solicitation keywords.', 'Urgent tone urging user action detected.']
        : [],
      features: {
        sender_risk: isPhishing ? 0.75 : 0.05,
        link_risk: isPhishing ? 0.8 : 0.04,
        content_risk: isPhishing ? 0.85 : 0.1,
      },
    };
  }

  // Live Backend API call
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Phishing engine returned status code ${response.status}`);
    }

    const data = await response.json();

    // Ensure strict conformity with PhishingAnalysisResponse
    return {
      is_phishing: Boolean(data.is_phishing),
      classification: data.classification || (data.is_phishing ? 'phishing' : 'legitimate'),
      risk_score: typeof data.risk_score === 'number' ? data.risk_score : 0,
      risk_level: String(data.risk_level || 'LOW').toUpperCase(),
      confidence: typeof data.confidence === 'number' ? data.confidence : 0.5,
      flagged_reasons: Array.isArray(data.flagged_reasons) ? data.flagged_reasons : [],
      features: normalizeFeatures(data.features),
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Analysis request timed out after 8 seconds. Please check backend status.');
    }
    throw err;
  }
}

/**
 * Checks connectivity with the backend service.
 */
export async function checkBackendHealth(): Promise<{ isOnline: boolean; details?: any }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return { isOnline: true, details: data };
    }
    return { isOnline: false };
  } catch {
    return { isOnline: false };
  }
}
