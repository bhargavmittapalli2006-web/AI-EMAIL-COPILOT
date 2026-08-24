import os
import logging
import joblib
import pandas as pd
from typing import Dict, List, Any, Optional
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from ml.features import FeatureExtractor

logger = logging.getLogger(__name__)

# Search candidate locations for the validated trained model pipeline
DEFAULT_MODEL_CANDIDATES = [
    os.getenv("PHISHING_MODEL_PATH"),
    os.path.join(os.path.dirname(__file__), "..", "saved_models", "phishing_email_pipeline.pkl"),
    os.path.join(os.path.dirname(__file__), "..", "saved_models", "phishing_pipeline.joblib"),
    os.path.join(os.path.dirname(__file__), "..", "..", "saved_models", "phishing_email_pipeline.pkl"),
    os.path.join(os.path.dirname(__file__), "..", "..", "saved_models", "phishing_pipeline.joblib"),
    os.path.join(os.getcwd(), "saved_models", "phishing_email_pipeline.pkl"),
    os.path.join(os.getcwd(), "phishing-engine", "saved_models", "phishing_email_pipeline.pkl"),
    os.path.join(os.getcwd(), "saved_models", "phishing_pipeline.joblib"),
    os.path.join(os.getcwd(), "phishing-engine", "saved_models", "phishing_pipeline.joblib"),
]


class PhishingModel:
    """
    Production-ready Phishing Detection Inference Model.
    Loads and executes a trained Scikit-learn TF-IDF + Logistic Regression Pipeline
    augmented with explainable rule-assisted heuristic indicators.
    """

    def __init__(self, model_path: Optional[str] = None):
        self.pipeline: Optional[Pipeline] = None
        self.feature_extractor = FeatureExtractor()
        self.is_trained: bool = False
        self.loaded_model_path: Optional[str] = None
        self.custom_model_path = model_path

    def _resolve_model_path(self) -> Optional[str]:
        """Resolves the valid path to the serialized model pipeline artifact."""
        if self.custom_model_path and os.path.exists(self.custom_model_path):
            return os.path.abspath(self.custom_model_path)

        for candidate in DEFAULT_MODEL_CANDIDATES:
            if candidate and os.path.exists(candidate) and os.path.isfile(candidate):
                return os.path.abspath(candidate)
        return None

    def load(self, filepath: Optional[str] = None) -> bool:
        """Loads trained Pipeline artifact from disk."""
        target_path = filepath or self._resolve_model_path()
        if not target_path or not os.path.exists(target_path):
            logger.warning("No trained model artifact found at specified paths.")
            return False

        try:
            artifact = joblib.load(target_path)
            if isinstance(artifact, Pipeline):
                self.pipeline = artifact
                self.is_trained = True
                self.loaded_model_path = target_path
                logger.info("Successfully loaded Pipeline model from: %s", target_path)
                return True
            elif isinstance(artifact, dict) and "pipeline" in artifact:
                self.pipeline = artifact["pipeline"]
                self.is_trained = True
                self.loaded_model_path = target_path
                logger.info("Successfully loaded dict-wrapped Pipeline from: %s", target_path)
                return True
            elif isinstance(artifact, dict) and "classifier" in artifact and "vectorizer" in artifact:
                # Handle legacy custom dict formats by wrapping into standard Pipeline
                self.pipeline = Pipeline([
                    ("tfidf", artifact["vectorizer"]),
                    ("clf", artifact["classifier"])
                ])
                self.is_trained = True
                self.loaded_model_path = target_path
                logger.info("Successfully adapted legacy artifact into Pipeline from: %s", target_path)
                return True
            else:
                logger.error("Unknown artifact structure in: %s", target_path)
                return False
        except Exception as e:
            logger.error("Failed to load model from %s: %s", target_path, e, exc_info=True)
            return False

    def train_fallback_model(self, df: pd.DataFrame) -> Dict[str, float]:
        """Trains a fallback TF-IDF + Logistic Regression pipeline if no saved artifact exists."""
        logger.info("Training fallback TF-IDF + Logistic Regression pipeline on %d samples...", len(df))
        
        # Prepare text representation
        texts = []
        for _, row in df.iterrows():
            subj = str(row.get("subject", "")).strip()
            body = str(row.get("body", "")).strip()
            texts.append(f"{subj} {body}".strip())

        y = df["is_phishing"].values if "is_phishing" in df.columns else df["label"].values

        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(max_features=10000, ngram_range=(1, 2), stop_words="english", sublinear_tf=True)),
            ("clf", LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42, solver="liblinear"))
        ])

        self.pipeline.fit(texts, y)
        self.is_trained = True
        train_acc = float(self.pipeline.score(texts, y))
        logger.info("Fallback training complete. Accuracy: %.4f", train_acc)
        return {"training_accuracy": train_acc}

    def save(self, filepath: Optional[str] = None) -> None:
        """Saves current Pipeline artifact."""
        target_path = filepath or os.path.join(os.path.dirname(__file__), "..", "saved_models", "phishing_pipeline.joblib")
        os.makedirs(os.path.dirname(os.path.abspath(target_path)), exist_ok=True)
        joblib.dump(self.pipeline, target_path)
        self.loaded_model_path = os.path.abspath(target_path)
        logger.info("Saved pipeline to: %s", target_path)

    def predict_proba(self, email_text: str) -> float:
        """Returns the predicted probability of the email being phishing (class 1)."""
        if not self.is_trained or self.pipeline is None:
            raise ValueError("Model pipeline is not trained or loaded.")

        proba = self.pipeline.predict_proba([email_text])[0]
        if len(proba) == 2:
            return float(proba[1])
        return float(proba[0])

    def predict(
        self,
        subject: str,
        sender: str,
        body: str,
        reply_to: str = "",
        links: List[str] = None
    ) -> Dict[str, Any]:
        """
        Executes explainable phishing inference:
        1. Extracts security features and flags
        2. Computes statistical TF-IDF + Logistic Regression probability
        3. Fuses ML probability with heuristic risk modifiers
        4. Categorizes risk level and threat explanations
        """
        if not self.is_trained or self.pipeline is None:
            raise ValueError("Model pipeline is not trained or loaded. Please train or provide model artifact.")

        # Extract features and explanations
        extracted = self.feature_extractor.extract_features(
            subject=subject,
            sender=sender,
            body=body,
            reply_to=reply_to,
            links=links
        )

        combined_text = extracted["combined_text"]
        phishing_prob = self.predict_proba(combined_text)

        # Heuristic scoring based on rule triggers
        tabular = extracted["features"]
        rule_score = (
            tabular["has_ip_url"] * 35 +
            tabular["has_shortener"] * 20 +
            tabular["suspicious_brand_impersonation"] * 25 +
            tabular["sender_replyto_mismatch"] * 25 +
            tabular["has_suspicious_sender_tld"] * 20 +
            (tabular["urgent_word_count"] >= 2) * 15 +
            (tabular["sensitive_word_count"] >= 2) * 20 +
            (tabular["suspicious_tld_count"] > 0) * 15 +
            (tabular["uppercase_ratio"] > 0.35) * 10
        )

        ml_score = phishing_prob * 100.0

        if rule_score == 0 and phishing_prob < 0.65:
            # Clean email with no security threat indicators
            raw_risk_score = ml_score * 0.35
        elif rule_score == 0:
            raw_risk_score = ml_score * 0.50
        else:
            raw_risk_score = (ml_score * 0.65) + (min(rule_score, 100.0) * 0.35)


        # Critical override: Raw IP link with credential request or brand impersonation forces high risk
        if tabular["has_ip_url"] and (tabular["sensitive_word_count"] >= 1 or tabular["suspicious_brand_impersonation"]):
            raw_risk_score = max(raw_risk_score, 80.0)
        elif tabular["has_ip_url"] and tabular["urgent_word_count"] >= 1:
            raw_risk_score = max(raw_risk_score, 75.0)

        risk_score = round(min(max(raw_risk_score, 0.0), 100.0), 1)
        is_phishing = bool(risk_score >= 50.0)
        classification = "phishing" if is_phishing else "legitimate"

        # Determine categorical risk level
        if risk_score >= 75.0:
            risk_level = "CRITICAL"
        elif risk_score >= 50.0:
            risk_level = "HIGH"
        elif risk_score >= 25.0:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        confidence = round(max(phishing_prob, 1.0 - phishing_prob), 3)

        # Calculate normalized vector risk ratios (0.0 to 1.0)
        sender_risk = round(min(1.0, (
            tabular.get("sender_replyto_mismatch", 0) * 0.4 +
            tabular.get("has_suspicious_sender_tld", 0) * 0.35 +
            tabular.get("suspicious_brand_impersonation", 0) * 0.35 +
            tabular.get("has_freemail_sender", 0) * 0.1
        )), 2)

        link_risk = round(min(1.0, (
            tabular.get("has_ip_url", 0) * 0.55 +
            tabular.get("has_shortener", 0) * 0.35 +
            (tabular.get("suspicious_tld_count", 0) > 0) * 0.25 +
            (tabular.get("url_count", 0) > 3) * 0.1
        )), 2)

        content_risk = round(min(1.0, (
            (tabular.get("urgent_word_count", 0) >= 1) * 0.35 +
            (tabular.get("sensitive_word_count", 0) >= 1) * 0.45 +
            (tabular.get("uppercase_ratio", 0.0) > 0.25) * 0.2 +
            (tabular.get("currency_symbol_count", 0) > 0) * 0.15
        )), 2)

        # Merge normalized ratios into features dictionary
        enriched_features = dict(extracted["features"])
        enriched_features["sender_risk"] = sender_risk
        enriched_features["link_risk"] = link_risk
        enriched_features["content_risk"] = content_risk

        return {
            "is_phishing": is_phishing,
            "classification": classification,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": confidence,
            "flagged_reasons": extracted["flagged_reasons"],
            "features": enriched_features,
            "model_path": self.loaded_model_path
        }

