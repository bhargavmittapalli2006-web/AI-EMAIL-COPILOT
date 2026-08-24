import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ──────────────────────────── /health ────────────────────────────

def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_response_body():
    response = client.get("/health")
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "phishing-engine"


# ──────────────────────────── /analyze-email ─────────────────────

def test_analyze_email_returns_200():
    payload = {
        "sender": "security@example.com",
        "subject": "Hello there",
        "body": "This is a test email body.",
    }
    response = client.post("/analyze-email", json=payload)
    assert response.status_code == 200


def test_analyze_email_response_structure():
    payload = {
        "sender": "Security Team <security@example.com>",
        "subject": "Verify your account",
        "body": "Please visit https://example.com/verify to continue.",
    }
    response = client.post("/analyze-email", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify parsed email, sender analysis, URL analysis, content analysis, and features exist
    assert "email" in data
    assert "sender_analysis" in data
    assert "url_analysis" in data
    assert "content_analysis" in data
    assert "features" in data

    # Verify email component
    email_data = data["email"]
    assert email_data["sender"] == "Security Team <security@example.com>"
    assert email_data["subject"] == "Verify your account"
    assert email_data["body"] == "Please visit https://example.com/verify to continue."
    assert email_data["urls"] == ["https://example.com/verify"]
    assert email_data["attachments"] == []

    # Verify sender analysis component
    sender_analysis = data["sender_analysis"]
    assert sender_analysis["sender"] == "security@example.com"
    assert sender_analysis["domain"] == "example.com"
    assert sender_analysis["display_name"] == "Security Team"
    assert sender_analysis["sender_risk_score"] == 0
    assert sender_analysis["risk_factors"] == []
    assert sender_analysis["warnings"] == []

    # Verify URL analysis component
    url_analysis = data["url_analysis"]
    assert len(url_analysis) == 1
    assert url_analysis[0]["url"] == "https://example.com/verify"
    assert url_analysis[0]["uses_https"] is True
    assert url_analysis[0]["is_ip_address"] is False
    assert url_analysis[0]["domain"] == "example.com"

    # Verify Content analysis component
    content_analysis = data["content_analysis"]
    assert "content_risk_score" in content_analysis
    assert "signals" in content_analysis
    assert "text_characteristics" in content_analysis

    # Verify ML-ready features component
    features = data["features"]
    assert features["url_count"] == 1
    assert features["https_url_count"] == 1
    assert features["http_url_count"] == 0
    assert "sender_risk_score" in features
    assert "content_risk_score" in features


def test_analyze_email_suspicious_sender_pipeline():
    payload = {
        "sender": "PayPal Alert <admin@192.168.1.1>",
        "subject": "Suspicious login",
        "body": "Check http://192.168.1.1/login immediately.",
    }
    response = client.post("/analyze-email", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["email"]["urls"] == ["http://192.168.1.1/login"]
    assert data["sender_analysis"]["domain"] == "192.168.1.1"
    assert data["sender_analysis"]["sender_risk_score"] > 0
    assert len(data["sender_analysis"]["risk_factors"]) > 0

    # Verify URL analysis for the suspicious URL
    assert "url_analysis" in data
    assert len(data["url_analysis"]) == 1
    url_result = data["url_analysis"][0]
    assert url_result["is_ip_address"] is True
    assert url_result["uses_https"] is False
    assert url_result["url_risk_score"] > 0
    assert len(url_result["risk_factors"]) > 0

    # Verify Content analysis for suspicious content
    assert "content_analysis" in data
    content_result = data["content_analysis"]
    assert content_result["content_risk_score"] > 0
    assert len(content_result["signals"]) > 0

    # Verify features reflect suspicious signals
    assert "features" in data
    features = data["features"]
    assert features["sender_is_ip"] == 1
    assert features["ip_url_count"] == 1
    assert features["urgency_detected"] == 1


def test_analyze_email_missing_field_returns_422():
    payload = {
        "sender": "incomplete@example.com",
    }
    response = client.post("/analyze-email", json=payload)
    assert response.status_code == 422
