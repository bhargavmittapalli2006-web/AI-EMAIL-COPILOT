"""
Inference Module for the Validated Phishing Email Detection Pipeline.

Loads the validated TF-IDF + Logistic Regression pipeline from saved_models/
and performs inference on new email subjects and bodies.

Supports:
- predict()
- predict_proba()
"""

import os
import sys
import json
import logging
import pickle
import joblib
from typing import Dict, Any, Optional, Tuple, Union

try:
    from ml.preprocessing import clean_text_content
except ImportError:
    # Handle direct script execution or alternate working directory
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from ml.preprocessing import clean_text_content

logger = logging.getLogger(__name__)

# Default model path candidates
DEFAULT_MODEL_PATHS = [
    os.path.join(os.path.dirname(__file__), "..", "saved_models", "phishing_email_pipeline.pkl"),
    os.path.join(os.path.dirname(__file__), "..", "saved_models", "phishing_pipeline.joblib"),
    os.path.join("saved_models", "phishing_email_pipeline.pkl"),
    os.path.join("saved_models", "phishing_pipeline.joblib"),
]


def load_model(model_path: Optional[str] = None):
    """
    Loads the trained TF-IDF + Logistic Regression pipeline.
    
    Args:
        model_path: Optional custom path to model artifact.
        
    Returns:
        Loaded scikit-learn Pipeline instance.
    """
    candidates = [model_path] if model_path else DEFAULT_MODEL_PATHS
    
    for path in candidates:
        if path and os.path.exists(path):
            try:
                # Try loading via pickle first
                with open(path, "rb") as f:
                    model = pickle.load(f)
                return model
            except Exception:
                try:
                    # Try loading via joblib
                    return joblib.load(path)
                except Exception as e:
                    logger.warning("Failed loading %s: %s", path, e)

    raise FileNotFoundError(
        f"Could not find valid model pipeline at candidate locations: {candidates}"
    )


class PhishingPredictor:
    """
    Predictor class encapsulating the validated ML model pipeline and preprocessing.
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model = load_model(model_path)

    def preprocess(self, subject: Union[str, None] = "", body: Union[str, None] = "") -> str:
        """
        Applies identical preprocessing used during model training.
        """
        _, _, combined_text = clean_text_content(subject or "", body or "")
        return combined_text

    def predict(self, subject: str = "", body: str = "") -> Dict[str, Any]:
        """
        Runs inference on an email subject and body.
        
        Returns:
            Dict with prediction (0 or 1), label ('legitimate' or 'phishing'),
            and phishing_probability (0.0 to 1.0).
        """
        combined_text = self.preprocess(subject, body)
        
        # Pipeline expects an iterable of strings
        probs = self.model.predict_proba([combined_text])[0]
        phishing_prob = float(probs[1])
        prediction = int(self.model.predict([combined_text])[0])
        label = "phishing" if prediction == 1 else "legitimate"

        return {
            "prediction": prediction,
            "label": label,
            "phishing_probability": round(phishing_prob, 4),
            "confidence": round(float(max(phishing_prob, 1.0 - phishing_prob)), 4)
        }

    def predict_proba(self, subject: str = "", body: str = "") -> float:
        """
        Returns the phishing probability (class 1 probability) as a float between 0.0 and 1.0.
        """
        combined_text = self.preprocess(subject, body)
        probs = self.model.predict_proba([combined_text])[0]
        return float(probs[1])


# Global singleton instance
_predictor: Optional[PhishingPredictor] = None


def get_predictor(model_path: Optional[str] = None) -> PhishingPredictor:
    """Returns singleton instance of PhishingPredictor."""
    global _predictor
    if _predictor is None or model_path is not None:
        _predictor = PhishingPredictor(model_path)
    return _predictor


def predict(subject: str = "", body: str = "", model_path: Optional[str] = None) -> Dict[str, Any]:
    """Convenience function for email prediction."""
    return get_predictor(model_path).predict(subject=subject, body=body)


def predict_proba(subject: str = "", body: str = "", model_path: Optional[str] = None) -> float:
    """Convenience function for email phishing probability."""
    return get_predictor(model_path).predict_proba(subject=subject, body=body)


if __name__ == "__main__":
    print("=" * 60)
    print("AI Email Copilot — Phishing ML Inference Test")
    print("=" * 60)

    # 1. Safe email test
    safe_subject = "Team Sprint Planning Tomorrow"
    safe_body = "Hi team, please review the sprint backlog before tomorrow's 10:00 AM sync."
    safe_result = predict(safe_subject, safe_body)
    print(f"\n[Safe Email Sample]")
    print(f"Subject: {safe_subject}")
    print(f"Output:  {json.dumps(safe_result, indent=2)}")

    # 2. Phishing email test
    phish_subject = "URGENT: Verify your bank account immediately!"
    phish_body = "Your account has been suspended. Please confirm your credentials at http://192.168.1.1/login or your account will be deleted."
    phish_result = predict(phish_subject, phish_body)
    print(f"\n[Phishing Email Sample]")
    print(f"Subject: {phish_subject}")
    print(f"Output:  {json.dumps(phish_result, indent=2)}")
    print("=" * 60)
