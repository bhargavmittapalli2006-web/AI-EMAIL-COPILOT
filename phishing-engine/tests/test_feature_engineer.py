"""
Unit tests for the Feature Engineering Layer.

Verifies transformation of Sender, URL, and Content analysis results into
clean, numerical, ML-ready feature representations.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app.models.sender_analysis import SenderAnalysis
from app.models.url_analysis import URLAnalysis
from app.models.content_analysis import ContentAnalysis, ContentSignal, TextCharacteristics
from app.models.email_data import EmailData
from app.services.feature_engineer import FeatureEngineer
from app.services.sender_analyzer import SenderAnalyzer
from app.services.url_analyzer import URLAnalyzer
from app.services.content_analyzer import ContentAnalyzer

fe = FeatureEngineer()
sender_analyzer = SenderAnalyzer()
url_analyzer = URLAnalyzer()
content_analyzer = ContentAnalyzer()


# ─────────────────────────────────────────────────────────────────
# 1. Completely normal email
# ─────────────────────────────────────────────────────────────────

class TestNormalEmailFeatures:
    """A clean, normal email should produce mostly zero/low numerical features."""

    def test_benign_features(self):
        sender_res = sender_analyzer.analyze("Alice Smith <alice@example.com>")
        url_res = url_analyzer.analyze_urls(["https://example.com/page"])
        content_res = content_analyzer.analyze(
            subject="Team Sync",
            body="Hey team, here is the agenda for tomorrow."
        )

        features = fe.extract_features(
            sender_analysis=sender_res,
            url_analysis=url_res,
            content_analysis=content_res,
        )

        assert features.sender_risk_score == 0
        assert features.sender_is_ip == 0
        assert features.sender_has_display_name_mismatch == 0
        assert features.url_count == 1
        assert features.suspicious_url_count == 0
        assert features.http_url_count == 0
        assert features.https_url_count == 1
        assert features.ip_url_count == 0
        assert features.content_risk_score == 0
        assert features.urgency_detected == 0
        assert features.credential_request_detected == 0
        assert features.threat_detected == 0


# ─────────────────────────────────────────────────────────────────
# 2. Suspicious sender
# ─────────────────────────────────────────────────────────────────

class TestSuspiciousSenderFeatures:
    """Suspicious sender indicators (IP domain, brand mismatch) reflected as 0/1."""

    def test_ip_and_brand_impersonation(self):
        sender_res = sender_analyzer.analyze("PayPal Support <security@192.168.1.50>")
        features = fe.extract_features(sender_analysis=sender_res)

        assert features.sender_risk_score > 50
        assert features.sender_is_ip == 1
        assert features.sender_has_display_name_mismatch == 1
        assert features.sender_domain_length == len("192.168.1.50")
        assert features.sender_risk_factor_count >= 2


# ─────────────────────────────────────────────────────────────────
# 3. Email with no URLs
# ─────────────────────────────────────────────────────────────────

class TestNoURLsFeatures:
    """Zero URLs must not crash the feature extractor; all URL stats must be 0/0.0."""

    def test_zero_urls_aggregation(self):
        features = fe.extract_features(url_analysis=[])

        assert features.url_count == 0
        assert features.suspicious_url_count == 0
        assert features.http_url_count == 0
        assert features.https_url_count == 0
        assert features.ip_url_count == 0
        assert features.average_url_length == 0.0
        assert features.maximum_url_length == 0
        assert features.maximum_subdomain_count == 0
        assert features.max_url_risk_score == 0


# ─────────────────────────────────────────────────────────────────
# 4. Email with one URL
# ─────────────────────────────────────────────────────────────────

class TestOneURLFeatures:
    """Single URL aggregation matches the individual URL metrics."""

    def test_single_url_aggregation(self):
        url_res = url_analyzer.analyze_urls(["http://sub.example.com:8080/test"])
        features = fe.extract_features(url_analysis=url_res)

        assert features.url_count == 1
        assert features.http_url_count == 1
        assert features.https_url_count == 0
        assert features.maximum_subdomain_count == 1
        assert features.average_url_length == len("http://sub.example.com:8080/test")
        assert features.maximum_url_length == len("http://sub.example.com:8080/test")


# ─────────────────────────────────────────────────────────────────
# 5. Email with multiple URLs
# ─────────────────────────────────────────────────────────────────

class TestMultipleURLsFeatures:
    """Multiple URLs correctly aggregated for averages, maximums, and counts."""

    def test_multiple_urls_aggregation(self):
        urls = [
            "https://short.com/a",                     # len 19
            "http://192.168.1.1/login",                # len 24
            "https://a.b.c.longdomain.org/very/deep",  # len 38
        ]
        url_res = url_analyzer.analyze_urls(urls)
        features = fe.extract_features(url_analysis=url_res)

        assert features.url_count == 3
        assert features.http_url_count == 1
        assert features.https_url_count == 2
        assert features.ip_url_count == 1
        assert features.maximum_subdomain_count == 3
        assert features.maximum_url_length == 38
        expected_avg = round(sum(len(u) for u in urls) / len(urls), 2)
        assert features.average_url_length == expected_avg
        assert features.suspicious_url_count >= 1


# ─────────────────────────────────────────────────────────────────
# 6. Email with multiple content signals
# ─────────────────────────────────────────────────────────────────

class TestMultipleContentSignalsFeatures:
    """Multiple content threats and demands mapped accurately to binary 0/1 flags."""

    def test_phishing_content_signals_mapping(self):
        content_res = content_analyzer.analyze(
            subject="URGENT: ACCOUNT SUSPENDED",
            body="Your account is permanently suspended! Verify your password and enter your OTP immediately!"
        )
        features = fe.extract_features(content_analysis=content_res)

        assert features.urgency_detected == 1
        assert features.credential_request_detected == 1
        assert features.otp_request_detected == 1
        assert features.threat_detected == 1
        assert features.content_risk_score >= 60


# ─────────────────────────────────────────────────────────────────
# 7. Empty body
# ─────────────────────────────────────────────────────────────────

class TestEmptyBodyFeatures:
    """Empty body and subject handle cleanly without NoneType errors."""

    def test_empty_content_handling(self):
        content_res = content_analyzer.analyze(subject="", body="")
        features = fe.extract_features(content_analysis=content_res)

        assert features.content_risk_score == 0
        assert features.body_word_count == 0
        assert features.subject_length == 0
        assert features.body_length == 0
        assert features.exclamation_count == 0


# ─────────────────────────────────────────────────────────────────
# 8. Missing optional fields
# ─────────────────────────────────────────────────────────────────

class TestMissingOptionalFields:
    """All parameters None should yield default zeroed EmailFeatures safely."""

    def test_all_none_inputs(self):
        features = fe.extract_features(
            sender_analysis=None,
            url_analysis=None,
            content_analysis=None,
            email=None,
        )

        assert features.sender_risk_score == 0
        assert features.url_count == 0
        assert features.average_url_length == 0.0
        assert features.content_risk_score == 0
        assert features.urgency_detected == 0


# ─────────────────────────────────────────────────────────────────
# 9. Verify boolean values become 0/1
# ─────────────────────────────────────────────────────────────────

class TestBooleanConversion:
    """Ensures all categorical indicators are strict ints (0 or 1), suitable for ML matrices."""

    def test_boolean_int_types(self):
        features = fe.extract_features(
            sender_analysis=sender_analyzer.analyze("user@domain.com"),
            url_analysis=[],
            content_analysis=content_analyzer.analyze("Title", "Body"),
        )
        d = features.to_dict()

        binary_keys = [
            "sender_is_ip",
            "sender_has_display_name_mismatch",
            "urgency_detected",
            "credential_request_detected",
            "otp_request_detected",
            "financial_request_detected",
            "account_verification_detected",
            "threat_detected",
            "reward_claim_detected",
            "impersonation_detected",
            "call_to_action_detected",
        ]

        for k in binary_keys:
            val = d[k]
            assert isinstance(val, int), f"{k} is not an int"
            assert val in (0, 1), f"{k} is {val}, expected 0 or 1"


# ─────────────────────────────────────────────────────────────────
# 10. Verify numeric aggregation correctness
# ─────────────────────────────────────────────────────────────────

class TestNumericAggregationCorrectness:
    """Verifies that mathematical calculations and counts are exact."""

    def test_exact_aggregation_math(self):
        urls = [
            "https://domain1.com/123",
            "http://domain2.org/12345678901",
        ]
        url_res = url_analyzer.analyze_urls(urls)
        features = fe.extract_features(url_analysis=url_res)

        assert features.url_count == 2
        assert features.average_url_length == round(sum(len(u) for u in urls) / len(urls), 2)
        assert features.maximum_url_length == max(len(u) for u in urls)
