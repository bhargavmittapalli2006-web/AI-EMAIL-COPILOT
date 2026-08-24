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

def test_analyze_phishing_email():
    payload = {
        "subject": "URGENT: Bank account security alert",
        "sender": "alert@bank-update.xyz",
        "reply_to": "hacker@gmail.com",
        "body": "Dear user, immediate action required. Verify your SSN and credit card here: http://10.0.0.1/verify",
        "links": ["http://10.0.0.1/verify"]
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_phishing"] is True
    assert data["risk_score"] > 50.0
    assert "CRITICAL" in data["risk_level"] or "HIGH" in data["risk_level"]
    assert len(data["flagged_reasons"]) > 0

def test_analyze_legitimate_email():
    payload = {
        "subject": "Sprint retrospective minutes",
        "sender": "jordan@mycompany.com",
        "reply_to": "jordan@mycompany.com",
        "body": "Hi team, thanks for a great sprint! Please check the notes on Jira.",
        "links": ["https://jira.mycompany.com/browse/PROJ-123"]
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_phishing"] is False
    assert data["risk_score"] < 50.0
    assert data["risk_level"] == "LOW"
