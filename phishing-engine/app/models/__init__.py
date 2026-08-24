"""Models package for phishing-engine."""
from app.models.email_data import EmailData, AttachmentData
from app.models.sender_analysis import SenderAnalysis

__all__ = ["EmailData", "AttachmentData", "SenderAnalysis"]
