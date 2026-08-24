from typing import Dict, Any
from pydantic import BaseModel, Field


class EmailFeatures(BaseModel):
    """
    ML-ready numerical feature vector extracted from email security analyses.

    All categorical/boolean indicators are represented as integers (0 or 1).
    All continuous characteristics are integers or floats.
    """

    # ── Sender Features ──────────────────────────────────────────────
    sender_risk_score: int = Field(default=0, description="Sender risk score from 0 to 100")
    sender_domain_length: int = Field(default=0, description="Character length of sender domain")
    sender_is_ip: int = Field(default=0, description="1 if sender domain is a raw IP address, else 0")
    sender_has_display_name_mismatch: int = Field(default=0, description="1 if display name impersonates or mismatches domain, else 0")
    sender_warning_count: int = Field(default=0, description="Number of warnings produced by sender analyzer")
    sender_risk_factor_count: int = Field(default=0, description="Number of risk factors produced by sender analyzer")

    # ── URL Aggregation Features ─────────────────────────────────────
    url_count: int = Field(default=0, description="Total number of URLs extracted from email")
    suspicious_url_count: int = Field(default=0, description="Number of URLs with risk score > 0 or flagged risk factors")
    http_url_count: int = Field(default=0, description="Number of HTTP (non-HTTPS) URLs")
    https_url_count: int = Field(default=0, description="Number of HTTPS URLs")
    ip_url_count: int = Field(default=0, description="Number of URLs with raw IP addresses as host")
    average_url_length: float = Field(default=0.0, description="Average character length across all URLs (0.0 if none)")
    maximum_url_length: int = Field(default=0, description="Maximum character length among all URLs")
    maximum_subdomain_count: int = Field(default=0, description="Maximum subdomain depth among all URLs")
    url_warning_count: int = Field(default=0, description="Total warnings across all analyzed URLs")
    max_url_risk_score: int = Field(default=0, description="Highest URL risk score across all URLs")

    # ── Content Linguistic & Statistical Features ───────────────────
    content_risk_score: int = Field(default=0, description="Content risk score from 0 to 100")
    urgency_detected: int = Field(default=0, description="1 if urgent/pressure language was detected, else 0")
    credential_request_detected: int = Field(default=0, description="1 if password/credential request was detected, else 0")
    otp_request_detected: int = Field(default=0, description="1 if OTP/2FA code request was detected, else 0")
    financial_request_detected: int = Field(default=0, description="1 if payment/financial request was detected, else 0")
    account_verification_detected: int = Field(default=0, description="1 if account verification request was detected, else 0")
    threat_detected: int = Field(default=0, description="1 if threatening/account suspension language was detected, else 0")
    reward_claim_detected: int = Field(default=0, description="1 if prize/lottery/reward claim was detected, else 0")
    impersonation_detected: int = Field(default=0, description="1 if IT/administrator impersonation language was detected, else 0")
    call_to_action_detected: int = Field(default=0, description="1 if suspicious call to action was detected, else 0")
    exclamation_count: int = Field(default=0, description="Number of exclamation marks in text")
    uppercase_token_count: int = Field(default=0, description="Number of uppercase-screaming words in text")
    body_word_count: int = Field(default=0, description="Total word count in email body")
    subject_length: int = Field(default=0, description="Character length of subject")
    body_length: int = Field(default=0, description="Character length of body")
    detected_security_requests_count: int = Field(default=0, description="Count of distinct security-related requests in content")

    def to_dict(self) -> Dict[str, Any]:
        """Returns the features as a flat python dictionary."""
        return self.model_dump()
