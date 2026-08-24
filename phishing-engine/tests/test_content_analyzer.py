"""
Unit tests for the Email Content Analyzer service.

Tests verify deterministic linguistic security indicator detection,
statistical text characteristics, and explainable signal generation.
No external network, LLMs, or ML models are used.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app.services.content_analyzer import ContentAnalyzer

analyzer = ContentAnalyzer()


# ─────────────────────────────────────────────────────────────────
# 1. Normal business email
# ─────────────────────────────────────────────────────────────────

class TestNormalBusinessEmail:
    """A standard business email should have low/zero risk score."""

    def test_benign_business_meeting(self):
        subject = "Project Sync - Tuesday 10am"
        body = (
            "Hi team,\n\n"
            "Here is the agenda for our weekly sprint review. "
            "Please review the attached notes and let me know if you have any questions.\n\n"
            "Best regards,\nSarah"
        )
        result = analyzer.analyze(subject=subject, body=body)
        assert result.content_risk_score == 0
        assert len(result.signals) == 0
        assert result.text_characteristics.word_count > 0
        assert result.text_characteristics.detected_security_requests_count == 0


# ─────────────────────────────────────────────────────────────────
# 2. Normal student/assignment email
# ─────────────────────────────────────────────────────────────────

class TestNormalStudentEmail:
    """Classroom or academic emails should not trigger false positives."""

    def test_assignment_submission_reminder(self):
        subject = "CS101: Assignment 3 Submission"
        body = "Please submit your assignment by Friday. Ensure all unit tests pass before uploading."
        result = analyzer.analyze(subject=subject, body=body)
        assert result.content_risk_score == 0
        assert len(result.signals) == 0
        assert result.text_characteristics.detected_security_requests_count == 0


# ─────────────────────────────────────────────────────────────────
# 3. Urgent account message
# ─────────────────────────────────────────────────────────────────

class TestUrgentAccountMessage:
    """Urgency / time pressure language must be detected as a signal."""

    def test_urgent_action_required(self):
        subject = "URGENT: Action Required on your account"
        body = "Immediate action required. You must respond within 24 hours without delay."
        result = analyzer.analyze(subject=subject, body=body)
        assert result.content_risk_score >= 15
        assert any(s.type == "urgency" for s in result.signals)


# ─────────────────────────────────────────────────────────────────
# 4. Credential request
# ─────────────────────────────────────────────────────────────────

class TestCredentialRequest:
    """Emails requesting passwords or credentials must produce high-severity signals."""

    def test_password_entry_request(self):
        subject = "Password Reset Request"
        body = "Please enter your current password to continue using your mailbox."
        result = analyzer.analyze(subject=subject, body=body)
        assert result.content_risk_score >= 25
        assert any(s.type == "credential_request" and s.severity == "high" for s in result.signals)
        assert result.text_characteristics.detected_security_requests_count >= 1


# ─────────────────────────────────────────────────────────────────
# 5. OTP request
# ─────────────────────────────────────────────────────────────────

class TestOTPRequest:
    """Emails requesting OTP or verification codes must produce high-severity signals."""

    def test_otp_code_solicitation(self):
        subject = "Authentication Check"
        body = "Please reply with your OTP verification code to confirm your session."
        result = analyzer.analyze(subject=subject, body=body)
        assert result.content_risk_score >= 25
        assert any(s.type == "otp_request" and s.severity == "high" for s in result.signals)
        assert result.text_characteristics.detected_security_requests_count >= 1


# ─────────────────────────────────────────────────────────────────
# 6. Financial/payment request
# ─────────────────────────────────────────────────────────────────

class TestFinancialPaymentRequest:
    """Emails requesting credit cards, bank accounts, or wire transfers."""

    def test_update_credit_card(self):
        subject = "Billing Update Needed"
        body = "Please update your credit card details immediately to avoid disruption."
        result = analyzer.analyze(subject=subject, body=body)
        assert result.content_risk_score >= 15
        assert any(s.type == "financial_request" for s in result.signals)

    def test_wire_transfer_request(self):
        subject = "Urgent Payment Request"
        body = "Please process a wire transfer to our new vendor account right away."
        result = analyzer.analyze(subject=subject, body=body)
        assert any(s.type == "financial_request" for s in result.signals)


# ─────────────────────────────────────────────────────────────────
# 7. Account verification request
# ─────────────────────────────────────────────────────────────────

class TestAccountVerificationRequest:
    """Prompts to verify or validate user identity/account."""

    def test_account_verification(self):
        subject = "Security Notice"
        body = "Please verify your account information to keep your profile active."
        result = analyzer.analyze(subject=subject, body=body)
        assert result.content_risk_score >= 15
        assert any(s.type == "account_verification" for s in result.signals)


# ─────────────────────────────────────────────────────────────────
# 8. Threatening language
# ─────────────────────────────────────────────────────────────────

class TestThreateningLanguage:
    """Threats of account suspension, legal action, or termination."""

    def test_suspension_threat(self):
        subject = "Account Termination Notice"
        body = "Your account will be permanently suspended due to suspicious activity."
        result = analyzer.analyze(subject=subject, body=body)
        assert result.content_risk_score >= 20
        assert any(s.type == "threatening_language" and s.severity == "high" for s in result.signals)


# ─────────────────────────────────────────────────────────────────
# 9. Reward/prize message
# ─────────────────────────────────────────────────────────────────

class TestRewardPrizeMessage:
    """Unsolicited reward, lottery, or gift card claims."""

    def test_lottery_winner_claim(self):
        subject = "Congratulations!"
        body = "You have won our annual lottery winner draw! Claim your prize now."
        result = analyzer.analyze(subject=subject, body=body)
        assert result.content_risk_score >= 20
        assert any(s.type == "reward_prize" for s in result.signals)


# ─────────────────────────────────────────────────────────────────
# 10. Multiple suspicious indicators
# ─────────────────────────────────────────────────────────────────

class TestMultipleSuspiciousIndicators:
    """Emails combining multiple threats, credential demands, and urgency."""

    def test_combined_phishing_payload(self):
        subject = "CRITICAL: ACCOUNT SUSPENDED - ACT NOW!!!"
        body = (
            "Your account will be permanently suspended within 24 hours! "
            "Unauthorized activity was detected. Click here to verify your password immediately "
            "or enter your credit card to confirm your identity!"
        )
        result = analyzer.analyze(subject=subject, body=body)
        assert result.content_risk_score >= 60
        assert len(result.signals) >= 3
        # Ensure signals include urgency, threatening, credential/verification
        signal_types = {s.type for s in result.signals}
        assert "urgency" in signal_types
        assert "threatening_language" in signal_types
        assert ("credential_request" in signal_types or "account_verification" in signal_types)


# ─────────────────────────────────────────────────────────────────
# 11. Empty body
# ─────────────────────────────────────────────────────────────────

class TestEmptyBody:
    """Empty or whitespace-only bodies should return 0 risk cleanly."""

    def test_empty_content(self):
        result = analyzer.analyze(subject="", body="")
        assert result.content_risk_score == 0
        assert result.signals == []
        assert result.text_characteristics.word_count == 0
        assert result.text_characteristics.subject_length == 0
        assert result.text_characteristics.body_length == 0

    def test_subject_only(self):
        result = analyzer.analyze(subject="Hello World", body="")
        assert result.content_risk_score == 0
        assert result.text_characteristics.subject_length == 11
        assert result.text_characteristics.body_length == 0


# ─────────────────────────────────────────────────────────────────
# 12. Long normal email
# ─────────────────────────────────────────────────────────────────

class TestLongNormalEmail:
    """Lengthy benign newsletters or meeting notes should compute stats cleanly."""

    def test_long_newsletter(self):
        subject = "Engineering Weekly Update #42"
        body = (
            "Hello everyone,\n\n"
            "This week we achieved several milestones across our engineering organization. "
            "The backend team successfully upgraded our database clusters with zero downtime. "
            "The frontend team shipped the new dark mode theme across all user dashboards. "
            "Our automated test suite now covers 95% of the codebase, ensuring high stability. "
            "Next week, we will focus on performance benchmarks and memory profiling. "
            "Please refer to the internal wiki for detailed release notes and architecture diagrams.\n\n"
            "Thank you for your continuous dedication!\nEngineering Leadership"
        )
        result = analyzer.analyze(subject=subject, body=body)
        assert result.content_risk_score == 0
        assert len(result.signals) == 0
        assert result.text_characteristics.word_count > 50
        assert result.text_characteristics.body_length > 300
