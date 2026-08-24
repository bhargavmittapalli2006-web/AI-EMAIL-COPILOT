from typing import List
from pydantic import BaseModel, Field


class ContentSignal(BaseModel):
    """
    Structured explainable signal extracted from email text.
    """
    type: str
    severity: str  # "low", "medium", "high"
    description: str


class TextCharacteristics(BaseModel):
    """
    Basic statistical and lexical characteristics of the email text.
    """
    subject_length: int = 0
    body_length: int = 0
    word_count: int = 0
    exclamation_count: int = 0
    uppercase_token_count: int = 0
    detected_security_requests_count: int = 0


class ContentAnalysis(BaseModel):
    """
    Structured security analysis for textual content (subject and body).
    """
    content_risk_score: int = Field(default=0, ge=0, le=100)
    signals: List[ContentSignal] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    text_characteristics: TextCharacteristics = Field(default_factory=TextCharacteristics)
