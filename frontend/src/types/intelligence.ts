export interface ActionItem {
  text: string;
  priority: 'low' | 'medium' | 'high';
}

export interface EmailIntelligence {
  summary: string;
  action_items: ActionItem[];
  key_points: string[];
  risk_explanation: string;
  recommended_actions: string[];
}

export interface EmailIntelligenceRequest {
  subject: string;
  sender: string;
  body: string;
  reply_to?: string;
  is_phishing?: boolean;
  risk_score?: number;
  risk_level?: string;
  flagged_reasons?: string[];
}
