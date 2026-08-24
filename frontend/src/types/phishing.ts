/**
 * Phishing Detection Types & API Contract
 */

export interface EmailAnalysisRequest {
  subject: string;
  sender: string;
  body: string;
  reply_to?: string;
  links?: string[];
}

export interface PhishingAnalysisResponse {
  is_phishing: boolean;
  classification: string;
  risk_score: number;
  risk_level: string;
  confidence: number;
  flagged_reasons: string[];
  features: {
    sender_risk: number;
    link_risk: number;
    content_risk: number;
    [key: string]: any;
  };
}

export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityMetricsSummary {
  emailsScanned: number;
  threatsDetected: number;
  safeEmails: number;
  criticalThreats: number;
  averageRiskScore: number;
}
