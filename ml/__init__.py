"""
AI Email Copilot - Phishing Detection ML Package
"""

from .preprocessing import (
    clean_text_content,
    extract_urls,
    load_genuine_phishing_data,
    load_genuine_legitimate_data,
    build_genuine_phishing_dataset
)
from .train import build_pipeline, train_model
from .evaluate import load_model, predict_email, evaluate_final_phishing_model

__all__ = [
    "clean_text_content",
    "extract_urls",
    "load_genuine_phishing_data",
    "load_genuine_legitimate_data",
    "build_genuine_phishing_dataset",
    "build_pipeline",
    "train_model",
    "load_model",
    "predict_email",
    "evaluate_final_phishing_model",
]
