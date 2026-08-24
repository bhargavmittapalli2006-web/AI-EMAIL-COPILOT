import os
import sys

# Ensure ml modules are discoverable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ml.model import PhishingModel
from ml.dataset import get_sample_dataset
from app.schemas import EmailAnalysisRequest, PhishingAnalysisResponse


class PhishingService:
    """Service layer for managing model inference and fallback initialization."""

    def __init__(self):
        self.model = PhishingModel()
        self._initialize_model()

    def _initialize_model(self):
        """Loads serialized model or trains a fresh model if none exists."""
        loaded = self.model.load()
        if not loaded:
            print("No saved model found. Training initial model from sample dataset...")
            df = get_sample_dataset()
            self.model.train(df)
            self.model.save()
            print("Initial model trained and saved successfully.")

    def analyze_email(self, request: EmailAnalysisRequest) -> PhishingAnalysisResponse:
        """Runs security features extraction and ML prediction on an incoming email request."""
        result = self.model.predict(
            subject=request.subject,
            sender=request.sender,
            body=request.body,
            reply_to=request.reply_to or "",
            links=request.links or []
        )

        return PhishingAnalysisResponse(
            is_phishing=result["is_phishing"],
            risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            confidence=result["confidence"],
            flagged_reasons=result["flagged_reasons"],
            features=result["features"]
        )


# Global service instance
phishing_service = PhishingService()
