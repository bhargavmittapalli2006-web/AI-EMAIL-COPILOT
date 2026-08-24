import { ReplySuggestions, ReplySuggestionsRequest } from '../types/reply';

const API_BASE_URL = 'http://localhost:8000';

// In-memory session cache for reply suggestions
const replyCache = new Map<string, ReplySuggestions>();

// Demo mock replies for local demonstration mode
const DEMO_REPLIES: Record<string, ReplySuggestions> = {
  sprint: {
    reply_allowed: true,
    professional_reply: "Thank you for sharing the sprint planning agenda, Sarah. I will review the Jira board and ensure all my assigned tickets are updated before tomorrow's 10:00 AM meeting.",
    friendly_reply: "Thanks for sending over the agenda, Sarah! I'll take a look at the Jira board today and get my tickets ready for our sync tomorrow morning.",
    concise_reply: "Thanks Sarah, I'll review the Jira tickets before 10 AM tomorrow.",
    source: 'gemini'
  },
  'all-hands': {
    reply_allowed: true,
    professional_reply: "Thank you for distributing the Q3 All-Hands recording and slide deck. I have bookmarked the materials for review and will submit any follow-up questions via the portal.",
    friendly_reply: "Thanks for sharing the recording and slides! It was a great session and I appreciate the team putting these materials together.",
    concise_reply: "Thank you for sharing the recording and slides.",
    source: 'gemini'
  },
  bank: {
    reply_allowed: false,
    reason: "Reply generation disabled because this email may be malicious.",
    professional_reply: null,
    friendly_reply: null,
    concise_reply: null,
    source: 'blocked'
  },
  paypal: {
    reply_allowed: false,
    reason: "Reply generation disabled because this email may be malicious.",
    professional_reply: null,
    friendly_reply: null,
    concise_reply: null,
    source: 'blocked'
  }
};

export async function fetchReplySuggestions(
  request: ReplySuggestionsRequest,
  isDemoMode = false
): Promise<ReplySuggestions> {
  const cacheKey = `${request.subject}_${request.sender}_${request.is_phishing}`;
  if (replyCache.has(cacheKey)) {
    return replyCache.get(cacheKey)!;
  }

  // Handle Demo Mode
  if (isDemoMode) {
    const combined = `${request.subject} ${request.body} ${request.sender}`.toLowerCase();
    for (const [key, fixture] of Object.entries(DEMO_REPLIES)) {
      if (combined.includes(key)) {
        replyCache.set(cacheKey, fixture);
        return fixture;
      }
    }

    if (request.is_phishing || request.risk_level === 'HIGH' || request.risk_level === 'CRITICAL') {
      const blocked: ReplySuggestions = {
        reply_allowed: false,
        reason: 'Reply generation disabled because this email may be malicious.',
        professional_reply: null,
        friendly_reply: null,
        concise_reply: null,
        source: 'blocked'
      };
      replyCache.set(cacheKey, blocked);
      return blocked;
    }

    const defaultSafe: ReplySuggestions = {
      reply_allowed: true,
      professional_reply: `Thank you for your message regarding '${request.subject}'. I have received the details and will follow up accordingly.`,
      friendly_reply: `Thanks for reaching out about this! I'll take a look and get back to you shortly.`,
      concise_reply: `Received with thanks, I will follow up soon.`,
      source: 'fallback'
    };
    replyCache.set(cacheKey, defaultSafe);
    return defaultSafe;
  }

  // Live Backend Call
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/reply-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Reply suggestions API returned status ${response.status}`);
    }

    const data: ReplySuggestions = await response.json();
    replyCache.set(cacheKey, data);
    return data;
  } catch (error: any) {
    console.warn('Backend reply suggestion call failed, checking fallback:', error);

    // If marked as threat, enforce security block locally
    if (request.is_phishing || request.risk_level === 'HIGH' || request.risk_level === 'CRITICAL') {
      return {
        reply_allowed: false,
        reason: 'Reply generation disabled because this email may be malicious.',
        professional_reply: null,
        friendly_reply: null,
        concise_reply: null,
        source: 'blocked'
      };
    }

    return {
      reply_allowed: true,
      reason: 'Generated via local offline fallback.',
      professional_reply: `Thank you for your email regarding '${request.subject}'. I have received your message and will review the details.`,
      friendly_reply: `Thanks for reaching out! I appreciate the message and will follow up soon.`,
      concise_reply: `Received with thanks. I will review and follow up.`,
      source: 'fallback'
    };
  }
}
