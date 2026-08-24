from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum

from app.models.email_data import EmailData, AttachmentData
from app.models.sender_analysis import SenderAnalysis
from app.models.url_analysis import URLAnalysis
from app.models.content_analysis import ContentAnalysis
from app.models.features import EmailFeatures


class EmailRequest(BaseModel):
    """Request model for the /analyze-email endpoint."""
    sender: str
    subject: str
    body: str


class HealthResponse(BaseModel):
    """Response model for the /health endpoint."""
    status: str
    service: str
    model_loaded: Optional[bool] = None
    version: Optional[str] = None


class EmailAnalysisResponse(BaseModel):
    """Response model returned by /analyze-email containing parsed email, sender analysis, URL analysis, content analysis, and ML-ready features."""
    email: EmailData
    sender_analysis: SenderAnalysis
    url_analysis: List[URLAnalysis] = Field(default_factory=list)
    content_analysis: ContentAnalysis
    features: EmailFeatures


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ActionItemPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ActionItem(BaseModel):
    text: str = Field(..., description="Actionable task, request, or deadline", json_schema_extra={"example": "Submit the project report by Friday at 5 PM"})
    priority: ActionItemPriority = Field(default=ActionItemPriority.MEDIUM, description="Task priority tier (low, medium, high)", json_schema_extra={"example": "high"})


class EmailAnalysisRequest(BaseModel):
    subject: str = Field(
        ...,
        description="Subject line of the email",
        json_schema_extra={"example": "URGENT: Verify your bank account immediately to prevent suspension!"}
    )
    sender: str = Field(
        ...,
        description="Sender email address or RFC header",
        json_schema_extra={"example": "security-alert@bank-verification-update.xyz"}
    )
    body: str = Field(
        ...,
        description="Full text body content of the email",
        json_schema_extra={"example": "Dear Customer, suspicious activity was detected on your account. Immediate action required. Re-enter your banking credentials and password now: http://192.168.1.1/login or your account will be locked."}
    )
    reply_to: Optional[str] = Field(
        default="",
        description="Reply-To header address if present",
        json_schema_extra={"example": "attacker-collector@gmail.com"}
    )
    links: Optional[List[str]] = Field(
        default_factory=list,
        description="List of extracted hyperlink URLs contained within the email",
        json_schema_extra={"example": ["http://192.168.1.1/login", "http://bit.ly/bank-security"]}
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "subject": "URGENT: Verify your bank account immediately to prevent suspension!",
                    "sender": "security-alert@bank-verification-update.xyz",
                    "reply_to": "attacker-collector@gmail.com",
                    "body": "Dear Customer, suspicious activity was detected on your account. Immediate action required. Re-enter your banking credentials and password now: http://192.168.1.1/login or your account will be locked.",
                    "links": ["http://192.168.1.1/login", "http://bit.ly/bank-security"]
                },
                {
                    "subject": "Sprint Retrospective Notes & Action Items",
                    "sender": "sarah.jenkins@company.com",
                    "reply_to": "sarah.jenkins@company.com",
                    "body": "Hi team, thank you for participating in today's sprint retrospective. Please review the updated Jira board for assigned tasks.",
                    "links": ["https://company.atlassian.net/jira/software-projects/ENG/boards/12"]
                }
            ]
        }
    }


class FeatureMetrics(BaseModel):
    # Normalized risk scores (0.0 to 1.0)
    sender_risk: float = Field(default=0.0, description="Normalized sender risk ratio between 0.0 and 1.0")
    link_risk: float = Field(default=0.0, description="Normalized hyperlink risk ratio between 0.0 and 1.0")
    content_risk: float = Field(default=0.0, description="Normalized content & urgency risk ratio between 0.0 and 1.0")

    # Granular security indicators
    url_count: int = Field(default=0, description="Total count of URLs extracted from email")
    has_ip_url: int = Field(default=0, description="1 if any URL uses a raw IP address, 0 otherwise")
    has_shortener: int = Field(default=0, description="1 if any URL uses a URL shortener service, 0 otherwise")
    suspicious_tld_count: int = Field(default=0, description="Number of links using high-risk phishing TLDs")
    urgent_word_count: int = Field(default=0, description="Count of detected urgency and panic-inducing keywords")
    sensitive_word_count: int = Field(default=0, description="Count of credential and personal data harvesting keywords")
    uppercase_ratio: float = Field(default=0.0, description="Ratio of uppercase alphabetical characters across the email")
    exclamation_mark_count: int = Field(default=0, description="Total exclamation marks in subject and body")
    currency_symbol_count: int = Field(default=0, description="Count of currency symbols indicating financial scams")
    sender_replyto_mismatch: int = Field(default=0, description="1 if sender domain differs from reply-to domain")
    has_suspicious_sender_tld: int = Field(default=0, description="1 if sender address domain uses a suspicious TLD")
    has_freemail_sender: int = Field(default=0, description="1 if sender uses a public freemail provider")
    suspicious_brand_impersonation: int = Field(default=0, description="1 if email claims official branding from unverified origin")


class PhishingAnalysisResponse(BaseModel):
    is_phishing: bool = Field(
        ...,
        description="Boolean classification flag: True if identified as a phishing threat"
    )
    classification: str = Field(
        ...,
        description="Classification label ('phishing' or 'legitimate')",
        json_schema_extra={"example": "phishing"}
    )
    risk_score: float = Field(
        ...,
        description="Overall threat risk score normalized from 0.0 (Completely Safe) to 100.0 (Severe Phishing Threat)",
        json_schema_extra={"example": 88.5}
    )
    risk_level: RiskLevel = Field(
        ...,
        description="Categorized threat severity tier (LOW, MEDIUM, HIGH, CRITICAL)",
        json_schema_extra={"example": "CRITICAL"}
    )
    confidence: float = Field(
        ...,
        description="Statistical confidence score between 0.500 and 1.000",
        json_schema_extra={"example": 0.942}
    )
    flagged_reasons: List[str] = Field(
        ...,
        description="Explainable human-readable descriptions of all triggered security threat indicators",
        json_schema_extra={"example": [
            "Email contains links pointing directly to raw IP addresses instead of verified domain names.",
            "Email contains URL shorteners commonly used to conceal malicious destinations.",
            "Sender domain does not match Reply-To domain, indicating potential header spoofing.",
            "Email requests sensitive personal, banking, or account credential information."
        ]}
    )
    features: FeatureMetrics = Field(
        ...,
        description="Extracted quantitative security features including sender_risk, link_risk, and content_risk"
    )


class EmailIntelligenceRequest(BaseModel):
    subject: str = Field(..., description="Subject line of the email", json_schema_extra={"example": "Quarterly Sprint Retrospective & Planning Meeting"})
    sender: str = Field(..., description="Sender email address", json_schema_extra={"example": "sarah.jenkins@company.com"})
    body: str = Field(..., description="Full body content of the email", json_schema_extra={"example": "Hi team, please find attached the agenda for our Q3 planning meeting tomorrow at 10 AM. Review the Jira board before the session."})
    reply_to: Optional[str] = Field(default="", description="Reply-to header address")
    is_phishing: Optional[bool] = Field(default=None, description="Authoritative classification from Phishing Engine")
    risk_score: Optional[float] = Field(default=None, description="Authoritative risk score (0-100)")
    risk_level: Optional[str] = Field(default=None, description="Authoritative risk level (LOW, MEDIUM, HIGH, CRITICAL)")
    flagged_reasons: Optional[List[str]] = Field(default_factory=list, description="Threat explanation flags from phishing engine")


class EmailIntelligenceResponse(BaseModel):
    summary: str = Field(
        ...,
        description="Concise 2-5 sentence AI-generated summary explaining what the email is about, what the sender wants, and key requests",
        json_schema_extra={"example": "Sarah Jenkins shared the agenda for the upcoming Q3 sprint planning meeting scheduled for tomorrow at 10:00 AM PST. Team members are requested to review the Jira board and update their assigned tickets prior to the call."}
    )
    action_items: List[ActionItem] = Field(
        default_factory=list,
        description="List of detected actionable tasks, deadlines, meetings, and required responses",
        json_schema_extra={"example": [
          {"text": "Review the Jira project board before the session", "priority": "high"},
          {"text": "Attend Q3 sprint planning meeting tomorrow at 10:00 AM PST", "priority": "medium"}
        ]}
    )
    key_points: List[str] = Field(
        default_factory=list,
        description="2-6 important bullet points extracted from the message",
        json_schema_extra={"example": [
          "Q3 sprint planning meeting scheduled for tomorrow at 10:00 AM PST",
          "Phase 1 Phishing Engine milestones and model integration to be reviewed",
          "Tickets on Jira board should be updated in advance"
        ]}
    )
    risk_explanation: str = Field(
        ...,
        description="Natural-language security explanation aligning with the authoritative phishing engine findings",
        json_schema_extra={"example": "This email appears low risk. The message contains routine internal sprint planning communication, verified company links, and no significant phishing indicators."}
    )
    recommended_actions: List[str] = Field(
        default_factory=list,
        description="Contextual user action recommendations conditioned on the security risk level",
        json_schema_extra={"example": [
          "Review the attached sprint agenda",
          "Update your Jira tickets before 10:00 AM",
          "Reply or confirm attendance"
        ]}
    )


class HealthCheckResponse(BaseModel):
    status: str = Field(..., description="Service health status", json_schema_extra={"example": "healthy"})
    service: str = Field(..., description="Service identifier", json_schema_extra={"example": "phishing-engine"})
    model_loaded: bool = Field(..., description="Indicates whether the ML inference model is loaded and ready", json_schema_extra={"example": True})
    gemini_available: bool = Field(default=False, description="Indicates whether Gemini API key is configured", json_schema_extra={"example": True})
    model_path: Optional[str] = Field(None, description="Absolute or relative path to loaded model artifact")
    version: str = Field(..., description="Service version", json_schema_extra={"example": "1.0.0"})


class ReplySuggestionsRequest(BaseModel):
    subject: str = Field(
        ...,
        description="Subject line of the email",
        json_schema_extra={"example": "Q3 Planning Meeting Tomorrow"}
    )
    sender: str = Field(
        ...,
        description="Sender email address",
        json_schema_extra={"example": "sarah.jenkins@company.com"}
    )
    body: str = Field(
        ...,
        description="Full text body content of the email",
        json_schema_extra={"example": "Hi team, can we meet tomorrow at 10 AM to review our Q3 sprint milestones?"}
    )
    reply_to: Optional[str] = Field(default="", description="Reply-to header address")
    is_phishing: Optional[bool] = Field(default=None, description="Client or cached phishing flag")
    risk_score: Optional[float] = Field(default=None, description="Client or cached risk score (0-100)")
    risk_level: Optional[str] = Field(default=None, description="Risk level (LOW, MEDIUM, HIGH, CRITICAL)")
    links: Optional[List[str]] = Field(default_factory=list, description="Extracted hyperlink URLs")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "subject": "Sprint Planning Tomorrow",
                    "sender": "sarah.jenkins@company.com",
                    "body": "Hi team, please review the sprint agenda before tomorrow's 10 AM meeting.",
                    "is_phishing": False,
                    "risk_score": 8.0,
                    "risk_level": "LOW"
                },
                {
                    "subject": "URGENT: Bank Account Suspended",
                    "sender": "security@fake-bank.xyz",
                    "body": "Your bank account has been locked. Verify PIN here: http://192.168.1.1/login",
                    "is_phishing": True,
                    "risk_score": 95.0,
                    "risk_level": "CRITICAL"
                }
            ]
        }
    }


class ReplySuggestionsResponse(BaseModel):
    reply_allowed: bool = Field(
        ...,
        description="True if email is safe and reply generation is permitted; False if blocked by backend security gate"
    )
    reason: Optional[str] = Field(
        default=None,
        description="Explanation when reply generation is blocked or conditioned"
    )
    professional_reply: Optional[str] = Field(
        default=None,
        description="Formal, professional, workplace-appropriate reply draft"
    )
    friendly_reply: Optional[str] = Field(
        default=None,
        description="Warm, natural, conversational reply draft"
    )
    concise_reply: Optional[str] = Field(
        default=None,
        description="Short, direct, one-sentence reply draft"
    )
    source: Optional[str] = Field(
        default="gemini",
        description="Source of replies: 'gemini', 'fallback', or 'blocked'"
    )

