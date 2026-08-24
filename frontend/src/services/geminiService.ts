import { EmailIntelligence, EmailIntelligenceRequest } from '../types/intelligence';
import { DEMO_EMAILS } from '../data/demoEmails';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
const TIMEOUT_MS = 10000;


// In-memory cache keyed by email identifier to prevent redundant API calls
const intelligenceCache = new Map<string, EmailIntelligence>();

/**
 * Generates structured AI intelligence for an email:
 * 1. Checks in-memory session cache.
 * 2. If in demo mode, returns pre-computed demo intelligence.
 * 3. Otherwise calls server-side endpoint POST /api/v1/intelligence.
 */
export async function getEmailIntelligence(
  emailId: string,
  request: EmailIntelligenceRequest,
  isDemoMode: boolean = false
): Promise<EmailIntelligence> {
  const cacheKey = `${emailId}_${request.is_phishing}_${request.risk_score}`;

  if (intelligenceCache.has(cacheKey)) {
    return intelligenceCache.get(cacheKey)!;
  }

  if (isDemoMode) {
    const demoMatch = DEMO_EMAILS.find((e) => e.id === emailId || e.subject === request.subject);
    if (demoMatch && demoMatch.intelligence) {
      intelligenceCache.set(cacheKey, demoMatch.intelligence);
      return demoMatch.intelligence;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/intelligence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Intelligence API returned status ${response.status}: ${response.statusText}`);
    }

    const data: EmailIntelligence = await response.json();
    const normalized = normalizeIntelligence(data, request);
    intelligenceCache.set(cacheKey, normalized);
    return normalized;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // If server request fails but we have a matching demo email, use it as fallback
    const demoMatch = DEMO_EMAILS.find((e) => e.id === emailId || e.subject === request.subject);
    if (demoMatch && demoMatch.intelligence) {
      return demoMatch.intelligence;
    }

    if (error.name === 'AbortError') {
      throw new Error('AI Intelligence request timed out after 10 seconds.');
    }
    throw new Error(error.message || 'AI insights temporarily unavailable.');
  }
}

/**
 * Validates and normalizes intelligence response fields.
 */
function normalizeIntelligence(
  data: any,
  request: EmailIntelligenceRequest
): EmailIntelligence {
  const summary = typeof data?.summary === 'string' && data.summary.trim()
    ? data.summary.trim()
    : `AI analysis of message from ${request.sender} concerning ${request.subject}.`;

  const action_items = Array.isArray(data?.action_items)
    ? data.action_items.map((item: any) => ({
        text: typeof item?.text === 'string' ? item.text : String(item || ''),
        priority: ['low', 'medium', 'high'].includes(item?.priority) ? item.priority : 'medium',
      }))
    : [];

  const key_points = Array.isArray(data?.key_points)
    ? data.key_points.filter((pt: any) => typeof pt === 'string' && pt.trim().length > 0)
    : [];

  const risk_explanation = typeof data?.risk_explanation === 'string' && data.risk_explanation.trim()
    ? data.risk_explanation.trim()
    : request.is_phishing
      ? `This email was flagged as a potential security risk (Risk Score: ${request.risk_score || 80}/100). Exercise caution.`
      : 'This email appears low risk. Routine communication without detected threat indicators.';

  const recommended_actions = Array.isArray(data?.recommended_actions)
    ? data.recommended_actions.filter((rec: any) => typeof rec === 'string' && rec.trim().length > 0)
    : request.is_phishing
      ? ['Do not click links', 'Do not enter credentials', 'Quarantine email']
      : ['Review message', 'Reply if necessary', 'Archive'];

  return {
    summary,
    action_items,
    key_points,
    risk_explanation,
    recommended_actions,
  };
}

/**
 * Clears the in-memory intelligence cache.
 */
export function clearIntelligenceCache(): void {
  intelligenceCache.clear();
}
