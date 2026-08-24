import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Any
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from ml.features import FeatureExtractor

MODEL_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "saved_models", "phishing_model.joblib")

class PhishingModel:
    """ML Model pipeline combining TF-IDF text features and structural security features."""

    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=100, stop_words="english")
        self.classifier = RandomForestClassifier(n_estimators=50, random_state=42)
        self.feature_extractor = FeatureExtractor()
        self.is_trained = False

    def _prepare_feature_matrix(self, df: pd.DataFrame, is_fit: bool = False) -> np.ndarray:
        """Extracts text and tabular features and returns concatenated feature matrix."""
        text_list = []
        tabular_features_list = []

        for _, row in df.iterrows():
            extracted = self.feature_extractor.extract_features(
                subject=row.get("subject", ""),
                sender=row.get("sender", ""),
                body=row.get("body", ""),
                reply_to=row.get("reply_to", ""),
                links=row.get("links", [])
            )
            text_list.append(extracted["combined_text"])
            tabular_features_list.append(list(extracted["features"].values()))

        tabular_matrix = np.array(tabular_features_list)

        if is_fit:
            text_matrix = self.vectorizer.fit_transform(text_list).toarray()
        else:
            text_matrix = self.vectorizer.transform(text_list).toarray()

        return np.hstack((tabular_matrix, text_matrix))

    def train(self, df: pd.DataFrame) -> Dict[str, float]:
        """Trains the Random Forest model on the provided dataset."""
        X = self._prepare_feature_matrix(df, is_fit=True)
        y = df["is_phishing"].values

        self.classifier.fit(X, y)
        self.is_trained = True
        
        train_acc = float(self.classifier.score(X, y))
        return {"training_accuracy": train_acc}

    def predict(self, subject: str, sender: str, body: str, reply_to: str = "", links: List[str] = None) -> Dict[str, Any]:
        """Predicts phishing risk score, level, and flagged reasons for a given email."""
        if not self.is_trained:
            raise ValueError("Model is not trained or loaded. Train the model first.")

        extracted = self.feature_extractor.extract_features(
            subject=subject,
            sender=sender,
            body=body,
            reply_to=reply_to,
            links=links
        )

        single_df = pd.DataFrame([{
            "subject": subject,
            "sender": sender,
            "body": body,
            "reply_to": reply_to,
            "links": links or []
        }])

        X_single = self._prepare_feature_matrix(single_df, is_fit=False)
        phishing_prob = float(self.classifier.predict_proba(X_single)[0][1])

        # Heuristic boost for critical security flags
        tabular = extracted["features"]
        rule_score = (
            tabular["has_ip_url"] * 30 +
            tabular["has_shortener"] * 20 +
            tabular["suspicious_brand_impersonation"] * 25 +
            tabular["sender_replyto_mismatch"] * 25 +
            (tabular["urgent_word_count"] >= 2) * 15 +
            (tabular["sensitive_word_count"] >= 2) * 15
        )
        
        # Combine model probability (70% weight) and explicit rule triggers (30% weight)
        raw_risk_score = (phishing_prob * 70) + (min(rule_score, 100) * 0.3)
        risk_score = round(min(max(raw_risk_score, 0.0), 100.0), 1)

        is_phishing = bool(risk_score >= 50.0)

        if risk_score >= 75.0:
            risk_level = "CRITICAL"
        elif risk_score >= 50.0:
            risk_level = "HIGH"
        elif risk_score >= 25.0:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        confidence = round(max(phishing_prob, 1.0 - phishing_prob), 3)

        return {
            "is_phishing": is_phishing,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": confidence,
            "flagged_reasons": extracted["flagged_reasons"],
            "features": extracted["features"]
        }

    def save(self, filepath: str = MODEL_FILE_PATH) -> None:
        """Saves trained model artifacts."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({
            "vectorizer": self.vectorizer,
            "classifier": self.classifier,
            "is_trained": self.is_trained
        }, filepath)

    def load(self, filepath: str = MODEL_FILE_PATH) -> bool:
        """Loads trained model artifacts if present."""
        if not os.path.exists(filepath):
            return False
        artifacts = joblib.load(filepath)
        self.vectorizer = artifacts["vectorizer"]
        self.classifier = artifacts["classifier"]
        self.is_trained = artifacts.get("is_trained", True)
        return True
