export interface ReplySuggestions {
  reply_allowed: boolean;
  reason?: string | null;
  professional_reply: string | null;
  friendly_reply: string | null;
  concise_reply: string | null;
  source?: 'gemini' | 'fallback' | 'blocked';
}

export interface ReplySuggestionsRequest {
  subject: string;
  sender: string;
  body: string;
  reply_to?: string;
  is_phishing?: boolean;
  risk_score?: number;
  risk_level?: string;
  links?: string[];
}
