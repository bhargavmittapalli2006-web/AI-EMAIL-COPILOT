/**
 * Type definitions & constants aligned with AI Email Copilot Backend Schemas
 */

export const RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const PriorityLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const ThreatCategory = {
  CREDENTIAL_HARVESTING: 'Credential Harvesting',
  CEO_FRAUD: 'CEO / Executive Impersonation',
  FINANCIAL_SCAM: 'Financial Scam / Wire Transfer',
  MALICIOUS_ATTACHMENT: 'Malicious Link / Attachment',
  URGENCY_EXTORTION: 'Extortion / Urgency Coercion',
  SAFE: 'Legitimate / Verified',
};

export const ReplyTone = {
  PROFESSIONAL: 'professional',
  DECLINE: 'decline',
  CLARIFY: 'clarify',
  SECURITY_REPORT: 'security_report',
  URGENT_CONFIRM: 'urgent_confirm',
};
