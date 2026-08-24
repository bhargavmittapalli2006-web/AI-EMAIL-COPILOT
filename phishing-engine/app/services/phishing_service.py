import os
import sys
import logging
from typing import Optional

# Ensure ml modules are discoverable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ml.model import PhishingModel
from app.schemas import EmailAnalysisRequest, PhishingAnalysisResponse

logger = logging.getLogger(__name__)


class PhishingService:
    """Production service layer orchestrating validated phishing model inference."""

    def __init__(self, model_path: Optional[str] = None):
        self.model = PhishingModel(model_path=model_path)
        self._initialize_model()

    def _initialize_model(self):
        """
        Loads the validated serialized model pipeline.
        CRITICAL: Never trains, retrains, or runs fallback training at startup.
        """
        loaded = self.model.load()
        if not loaded:
            logger.error(
                "CRITICAL: Failed to load validated phishing model pipeline from disk. "
                "Automatic training is strictly disabled in production."
            )
        else:
            logger.info("Validated inference model ready from: %s", self.model.loaded_model_path)

    def is_ready(self) -> bool:
        """Returns True if model pipeline is loaded and ready for inference."""
        return self.model.is_trained and (self.model.pipeline is not None)

    def get_model_path(self) -> Optional[str]:
        """Returns the active loaded model path."""
        return self.model.loaded_model_path

    def analyze_email(self, request: EmailAnalysisRequest) -> PhishingAnalysisResponse:
        """Runs security feature extraction and ML prediction on an incoming email request."""
        if not self.is_ready():
            raise RuntimeError("Phishing inference model is not initialized or ready. Model artifact missing or corrupted.")

        result = self.model.predict(
            subject=request.subject,
            sender=request.sender,
            body=request.body,
            reply_to=request.reply_to or "",
            links=request.links or []
        )

        return PhishingAnalysisResponse(
            is_phishing=result["is_phishing"],
            classification=result["classification"],
            risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            confidence=result["confidence"],
            flagged_reasons=result["flagged_reasons"],
            features=result["features"]
        )


# Global service singleton instance
phishing_service = PhishingService()
