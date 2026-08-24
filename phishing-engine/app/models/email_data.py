from typing import List, Optional
from pydantic import BaseModel, Field


class AttachmentData(BaseModel):
    """
    Data structure representing email attachment metadata.
    Downloading or execution is intentionally not implemented.
    """
    filename: str
    content_type: Optional[str] = None
    size_bytes: Optional[int] = None


class EmailData(BaseModel):
    """
    Structured representation of parsed email content.
    """
    sender: str
    subject: str
    body: str
    urls: List[str] = Field(default_factory=list)
    attachments: List[AttachmentData] = Field(default_factory=list)
