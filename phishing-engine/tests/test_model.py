import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.dataset import get_sample_dataset
from ml.model import PhishingModel

def test_model_training_and_prediction():
    df = get_sample_dataset()
    model = PhishingModel()
    metrics = model.train(df)

    assert metrics["training_accuracy"] >= 0.8
    assert model.is_trained is True

    # Test phishing email prediction
    phishing_pred = model.predict(
        subject="URGENT: Password Expiring Now!",
        sender="security@bank-alert.xyz",
        reply_to="attacker@gmail.com",
        body="Your account will be terminated in 1 hour. Verify credentials here: http://192.168.1.1/login",
        links=["http://192.168.1.1/login"]
    )
    assert phishing_pred["is_phishing"] is True
    assert phishing_pred["risk_score"] > 50.0
    assert len(phishing_pred["flagged_reasons"]) > 0

    # Test legitimate email prediction
    legit_pred = model.predict(
        subject="Weekly Design Sync",
        sender="alex@company.com",
        reply_to="alex@company.com",
        body="Hey team, here are the updated slides for today's call.",
        links=["https://company.atlassian.net"]
    )
    assert legit_pred["is_phishing"] is False
    assert legit_pred["risk_score"] < 50.0
