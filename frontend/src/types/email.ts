import { PhishingAnalysisResponse } from './phishing';
import { EmailIntelligence } from './intelligence';

export interface EmailItem {
  id: string;
  subject: string;
  sender: string;
  senderName: string;
  reply_to?: string;
  timestamp: string;
  preview: string;
  body: string;
  links: string[];
  isRead?: boolean;
  isStarred?: boolean;
  tag?: string;
  analysis?: PhishingAnalysisResponse;
  intelligence?: EmailIntelligence;
}
