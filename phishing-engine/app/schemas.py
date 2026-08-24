from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class EmailAnalysisRequest(BaseModel):
    subject: str = Field(..., description="Subject line of the email", json_schema_extra={"example": "URGENT: Verify your account immediately!"})
    sender: str = Field(..., description="Sender email address or header", json_schema_extra={"example": "security@bank-alert-update.com"})
    body: str = Field(..., description="Body content of the email", json_schema_extra={"example": "Dear customer, click here to unlock your account: http://192.168.1.1/login"})
    reply_to: Optional[str] = Field(default="", description="Reply-to header address if present", json_schema_extra={"example": "hacker@gmail.com"})
    links: Optional[List[str]] = Field(default_factory=list, description="Extracted hyperlink URLs from email body")

class FeatureMetrics(BaseModel):
    url_count: int
    has_ip_url: int
    has_shortener: int
    suspicious_tld_count: int
    urgent_word_count: int
    sensitive_word_count: int
    uppercase_ratio: float
    exclamation_mark_count: int
    currency_symbol_count: int
    sender_replyto_mismatch: int
    has_suspicious_sender_tld: int
    has_freemail_sender: int
    suspicious_brand_impersonation: int

class PhishingAnalysisResponse(BaseModel):
    is_phishing: bool = Field(..., description="True if the email is classified as a phishing threat")
    risk_score: float = Field(..., description="Phishing risk score normalized from 0.0 (Safe) to 100.0 (Extreme Threat)")
    risk_level: RiskLevel = Field(..., description="Categorized risk level (LOW, MEDIUM, HIGH, CRITICAL)")
    confidence: float = Field(..., description="Model confidence score between 0.5 and 1.0")
    flagged_reasons: List[str] = Field(..., description="Explanations detailing why the email was flagged")
    features: FeatureMetrics = Field(..., description="Extracted numerical and boolean security feature indicators")
