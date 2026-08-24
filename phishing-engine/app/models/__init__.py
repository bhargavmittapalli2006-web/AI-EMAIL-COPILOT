"""Models package for phishing-engine."""
from app.models.email_data import EmailData, AttachmentData
from app.models.sender_analysis import SenderAnalysis
from app.models.url_analysis import URLAnalysis

__all__ = ["EmailData", "AttachmentData", "SenderAnalysis", "URLAnalysis"]
