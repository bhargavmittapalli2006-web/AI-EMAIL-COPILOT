from typing import List, Optional
from pydantic import BaseModel, Field


class SenderAnalysis(BaseModel):
    """
    Structured security analysis signals for an email sender.
    """
    sender: str
    domain: Optional[str] = ""
    display_name: Optional[str] = ""
    sender_risk_score: int = Field(default=0, ge=0, le=100)
    risk_factors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
