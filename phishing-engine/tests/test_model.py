import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.dataset import get_sample_dataset
from ml.model import PhishingModel


def test_model_loading_and_prediction():
    model = PhishingModel()
    loaded = model.load()
    if not loaded:
        df = get_sample_dataset()
        model.train_fallback_model(df)

    assert model.is_trained is True
    assert model.pipeline is not None

    # Test phishing email prediction
    phishing_pred = model.predict(
        subject="URGENT: Password Expiring Now!",
        sender="security@bank-alert.xyz",
        reply_to="attacker@gmail.com",
        body="Your account will be terminated in 1 hour. Verify credentials here: http://192.168.1.1/login",
        links=["http://192.168.1.1/login"]
    )
    assert phishing_pred["is_phishing"] is True
    assert phishing_pred["classification"] == "phishing"
    assert phishing_pred["risk_score"] >= 50.0
    assert len(phishing_pred["flagged_reasons"]) > 0
    assert phishing_pred["confidence"] >= 0.5

    # Test legitimate email prediction
    legit_pred = model.predict(
        subject="Weekly Design Sync",
        sender="alex@company.com",
        reply_to="alex@company.com",
        body="Hey team, here are the updated slides for today's call.",
        links=["https://company.atlassian.net"]
    )
    assert legit_pred["is_phishing"] is False
    assert legit_pred["classification"] == "legitimate"
    assert legit_pred["risk_score"] < 50.0
    assert legit_pred["risk_level"] == "LOW"


def test_predict_proba():
    model = PhishingModel()
    loaded = model.load()
    if not loaded:
        df = get_sample_dataset()
        model.train_fallback_model(df)

    prob = model.predict_proba("URGENT: Verify password immediately")
    assert isinstance(prob, float)
    assert 0.0 <= prob <= 1.0
