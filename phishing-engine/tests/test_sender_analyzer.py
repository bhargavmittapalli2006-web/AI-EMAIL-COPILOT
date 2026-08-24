import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.sender_analyzer import SenderAnalyzer
from app.models.sender_analysis import SenderAnalysis


@pytest.fixture
def analyzer():
    return SenderAnalyzer()


# 1. Normal sender
def test_normal_sender(analyzer):
    res = analyzer.analyze("security@example.com")
    assert isinstance(res, SenderAnalysis)
    assert res.sender == "security@example.com"
    assert res.domain == "example.com"
    assert res.display_name == ""
    assert res.sender_risk_score == 0
    assert len(res.risk_factors) == 0


def test_normal_sender_with_display_name(analyzer):
    res = analyzer.analyze("Security Team <security@example.com>")
    assert res.sender == "security@example.com"
    assert res.domain == "example.com"
    assert res.display_name == "Security Team"
    assert res.sender_risk_score == 0
    assert len(res.risk_factors) == 0


# 2. Missing sender
def test_missing_sender(analyzer):
    res_empty = analyzer.analyze("")
    assert res_empty.sender == ""
    assert res_empty.sender_risk_score > 0
    assert any("Missing" in f for f in res_empty.risk_factors)

    res_none = analyzer.analyze(None)
    assert res_none.sender == ""
    assert res_none.sender_risk_score > 0
    assert any("Missing" in f for f in res_none.risk_factors)


# 3. Malformed sender
def test_malformed_sender_no_at(analyzer):
    res = analyzer.analyze("invalid-user-format")
    assert res.sender_risk_score > 0
    assert any("Malformed" in f or "valid email" in f for f in res.risk_factors)


def test_malformed_sender_multiple_at(analyzer):
    res = analyzer.analyze("user@@example.com")
    assert res.sender_risk_score > 0
    assert any("multiple '@'" in f for f in res.risk_factors)


def test_malformed_sender_missing_tld(analyzer):
    res = analyzer.analyze("admin@localhost")
    assert res.sender_risk_score > 0
    assert any("no valid extension" in f for f in res.risk_factors)


# 4. Sender using an IP address as domain
def test_sender_ip_address_domain(analyzer):
    res = analyzer.analyze("admin@192.168.1.1")
    assert res.sender == "admin@192.168.1.1"
    assert res.domain == "192.168.1.1"
    assert res.sender_risk_score >= 40
    assert any("raw IP address" in f for f in res.risk_factors)


def test_sender_ip_in_brackets(analyzer):
    res = analyzer.analyze("root@[10.0.0.1]")
    assert res.domain == "10.0.0.1"
    assert res.sender_risk_score >= 40
    assert any("raw IP address" in f for f in res.risk_factors)


# 5. Display name that does not match the sender domain (impersonation / spoofing signal)
def test_display_name_mismatch_brand_impersonation(analyzer):
    res = analyzer.analyze("PayPal Support <billing@random-unauthorized-server.com>")
    assert res.display_name == "PayPal Support"
    assert res.domain == "random-unauthorized-server.com"
    assert res.sender_risk_score > 0
    assert any("PayPal" in f and "does not belong" in f for f in res.risk_factors)


def test_display_name_embedded_mismatched_email(analyzer):
    res = analyzer.analyze('"security@paypal.com" <attacker@fakemailservice.net>')
    assert res.domain == "fakemailservice.net"
    assert res.sender_risk_score > 0
    assert any("Display name contains an email address" in f for f in res.risk_factors)


# 6. Suspicious-looking fictional domain
def test_suspicious_domain_excessive_hyphens(analyzer):
    res = analyzer.analyze("alert@paypal-security-update-center-auth.xyz")
    assert res.domain == "paypal-security-update-center-auth.xyz"
    assert res.sender_risk_score > 0
    assert any("excessive hyphens" in f for f in res.risk_factors)


def test_suspicious_domain_brand_lookalike(analyzer):
    res = analyzer.analyze("support@microsoft-verify-login.com")
    assert res.domain == "microsoft-verify-login.com"
    assert res.sender_risk_score > 0
    assert any("impersonate brand 'Microsoft'" in f for f in res.risk_factors)


def test_suspicious_domain_keywords_and_numbers(analyzer):
    res = analyzer.analyze("verify@account-security-update-998811.top")
    assert res.sender_risk_score > 0
    assert len(res.warnings) > 0 or len(res.risk_factors) > 0


# 7. Multiple valid sender examples
@pytest.mark.parametrize("valid_sender, expected_domain", [
    ("john.doe@company.org", "company.org"),
    ("support@service.sub.example.com", "service.sub.example.com"),
    ("Alice Smith <alice@university.edu>", "university.edu"),
    ("billing-dept@legit-store.co.uk", "legit-store.co.uk"),
    ("Customer Care <care@brand.net>", "brand.net"),
])
def test_multiple_valid_senders(analyzer, valid_sender, expected_domain):
    res = analyzer.analyze(valid_sender)
    assert res.domain == expected_domain
    assert res.sender_risk_score == 0
    assert len(res.risk_factors) == 0
