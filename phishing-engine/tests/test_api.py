import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "phishing-engine"
    assert data["model_loaded"] is True
    assert data["version"] == "1.0.0"
    assert data["model_path"] is not None


def test_analyze_phishing_email():
    payload = {
        "subject": "URGENT: Bank account security alert - action required",
        "sender": "alert@bank-update.xyz",
        "reply_to": "hacker@gmail.com",
        "body": "Dear user, immediate action required. Verify your SSN and credit card credentials here: http://10.0.0.1/verify",
        "links": ["http://10.0.0.1/verify"]
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_phishing"] is True
    assert data["classification"] == "phishing"
    assert data["risk_score"] >= 50.0
    assert data["risk_level"] in ["HIGH", "CRITICAL"]
    assert len(data["flagged_reasons"]) > 0
    assert data["confidence"] >= 0.5
    assert data["features"]["has_ip_url"] == 1
    assert data["features"]["sender_replyto_mismatch"] == 1


def test_analyze_legitimate_email():
    payload = {
        "subject": "Sprint retrospective minutes and design updates",
        "sender": "jordan@mycompany.com",
        "reply_to": "jordan@mycompany.com",
        "body": "Hi team, thanks for a great sprint! Please check the notes on Jira for upcoming milestones.",
        "links": ["https://jira.mycompany.com/browse/PROJ-123"]
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_phishing"] is False
    assert data["classification"] == "legitimate"
    assert data["risk_score"] < 50.0
    assert data["risk_level"] == "LOW"
    assert data["confidence"] >= 0.5
    assert data["features"]["has_ip_url"] == 0


def test_analyze_brand_impersonation_phishing():
    payload = {
        "subject": "Your Google Account has been suspended",
        "sender": "no-reply@google-security-support.site",
        "reply_to": "attacker-collector@gmail.com",
        "body": "We detected unauthorized access to your account. Click http://bit.ly/secure-login to verify your password immediately.",
        "links": ["http://bit.ly/secure-login"]
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_phishing"] is True
    assert data["classification"] == "phishing"
    assert data["risk_score"] >= 50.0
    assert data["features"]["has_shortener"] == 1
    assert data["features"]["suspicious_brand_impersonation"] == 1
