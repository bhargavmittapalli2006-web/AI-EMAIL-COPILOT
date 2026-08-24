from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.email_data import EmailData, AttachmentData
from app.models.sender_analysis import SenderAnalysis


class EmailRequest(BaseModel):
    """Request model for the /analyze-email endpoint."""
    sender: str
    subject: str
    body: str


class HealthResponse(BaseModel):
    """Response model for the /health endpoint."""
    status: str
    service: str


class EmailAnalysisResponse(BaseModel):
    """Response model returned by /analyze-email containing parsed email and sender analysis."""
    email: EmailData
    sender_analysis: SenderAnalysis


# ML Service schemas for ML models
class EmailAnalysisRequest(BaseModel):
    subject: str
    sender: str
    body: str
    reply_to: Optional[str] = ""
    links: Optional[List[str]] = Field(default_factory=list)


class PhishingAnalysisResponse(BaseModel):
    is_phishing: bool
    risk_score: float
    risk_level: str
    confidence: float
    flagged_reasons: List[str]
    features: Dict[str, Any]
