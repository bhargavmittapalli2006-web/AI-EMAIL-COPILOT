"""Models package for phishing-engine."""
from app.models.email_data import EmailData, AttachmentData
from app.models.sender_analysis import SenderAnalysis
from app.models.url_analysis import URLAnalysis
from app.models.content_analysis import ContentAnalysis, ContentSignal, TextCharacteristics
from app.models.features import EmailFeatures

__all__ = [
    "EmailData",
    "AttachmentData",
    "SenderAnalysis",
    "URLAnalysis",
    "ContentAnalysis",
    "ContentSignal",
    "TextCharacteristics",
    "EmailFeatures",
]
