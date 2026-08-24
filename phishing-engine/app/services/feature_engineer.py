"""
Feature Engineering Layer — ML-Ready Numerical Feature Extraction

Transforms the explainable security signals from SenderAnalyzer,
URLAnalyzer, and ContentAnalyzer into a structured, numerical feature
vector suitable for downstream ML classifiers and risk models.

═══════════════════════════════════════════════════════════════════════════
SECURITY & ISOLATION CONTRACT
═══════════════════════════════════════════════════════════════════════════
  • Consumes ONLY already extracted analysis objects.
  • NEVER visits, fetches, or queries any URL.
  • NEVER performs DNS, whois, or network operations.
  • Pure in-memory deterministic transformation.
  • Robust to missing, empty, or None analysis structures.
═══════════════════════════════════════════════════════════════════════════
"""

from typing import List, Optional
import ipaddress

from app.models.sender_analysis import SenderAnalysis
from app.models.url_analysis import URLAnalysis
from app.models.content_analysis import ContentAnalysis
from app.models.email_data import EmailData
from app.models.features import EmailFeatures


class FeatureEngineer:
    """
    Transforms structured sender, URL, and content analysis results
    into numerical, ML-ready feature representations.
    """

    def extract_features(
        self,
        sender_analysis: Optional[SenderAnalysis] = None,
        url_analysis: Optional[List[URLAnalysis]] = None,
        content_analysis: Optional[ContentAnalysis] = None,
        email: Optional[EmailData] = None,
    ) -> EmailFeatures:
        """
        Aggregates outputs from the Sender, URL, and Content analyzers
        into a unified, flat numerical feature vector.
        """
        # ── 1. Sender Features ───────────────────────────────────────
        sender_risk_score = 0
        sender_domain_len = 0
        sender_is_ip = 0
        sender_display_mismatch = 0
        sender_warnings_count = 0
        sender_risk_factors_count = 0

        if sender_analysis is not None:
            sender_risk_score = sender_analysis.sender_risk_score
            domain = sender_analysis.domain or ""
            sender_domain_len = len(domain)

            if domain and self._is_raw_ip(domain):
                sender_is_ip = 1

            for rf in sender_analysis.risk_factors:
                rf_lower = rf.lower()
                if "ip address" in rf_lower:
                    sender_is_ip = 1
                if "display name" in rf_lower or "impersonate" in rf_lower:
                    sender_display_mismatch = 1

            sender_warnings_count = len(sender_analysis.warnings)
            sender_risk_factors_count = len(sender_analysis.risk_factors)

        # ── 2. URL Aggregation Features ──────────────────────────────
        urls = url_analysis if url_analysis is not None else []
        url_count = len(urls)

        if url_count == 0:
            suspicious_url_count = 0
            http_url_count = 0
            https_url_count = 0
            ip_url_count = 0
            avg_url_length = 0.0
            max_url_length = 0
            max_subdomains = 0
            url_warning_count = 0
            max_url_risk = 0
        else:
            suspicious_url_count = sum(
                1 for u in urls if u.url_risk_score > 0 or len(u.risk_factors) > 0
            )
            http_url_count = sum(1 for u in urls if not u.uses_https or u.scheme == "http")
            https_url_count = sum(1 for u in urls if u.uses_https or u.scheme == "https")
            ip_url_count = sum(1 for u in urls if u.is_ip_address)
            avg_url_length = round(sum(u.url_length for u in urls) / url_count, 2)
            max_url_length = max(u.url_length for u in urls)
            max_subdomains = max(u.subdomain_count for u in urls)
            url_warning_count = sum(len(u.warnings) for u in urls)
            max_url_risk = max(u.url_risk_score for u in urls)

        # ── 3. Content Linguistic & Statistical Features ─────────────
        content_risk_score = 0
        urgency_detected = 0
        credential_request_detected = 0
        otp_request_detected = 0
        financial_request_detected = 0
        account_verification_detected = 0
        threat_detected = 0
        reward_claim_detected = 0
        impersonation_detected = 0
        call_to_action_detected = 0
        exclamation_count = 0
        uppercase_token_count = 0
        body_word_count = 0
        subject_length = 0
        body_length = 0
        detected_sec_requests = 0

        if content_analysis is not None:
            content_risk_score = content_analysis.content_risk_score

            signal_types = {s.type for s in content_analysis.signals}
            if "urgency" in signal_types:
                urgency_detected = 1
            if "credential_request" in signal_types:
                credential_request_detected = 1
            if "otp_request" in signal_types:
                otp_request_detected = 1
            if "financial_request" in signal_types:
                financial_request_detected = 1
            if "account_verification" in signal_types:
                account_verification_detected = 1
            if "threatening_language" in signal_types:
                threat_detected = 1
            if "reward_prize" in signal_types:
                reward_claim_detected = 1
            if "impersonation_language" in signal_types:
                impersonation_detected = 1
            if "suspicious_call_to_action" in signal_types:
                call_to_action_detected = 1

            tc = content_analysis.text_characteristics
            if tc is not None:
                exclamation_count = tc.exclamation_count
                uppercase_token_count = tc.uppercase_token_count
                body_word_count = tc.word_count
                subject_length = tc.subject_length
                body_length = tc.body_length
                detected_sec_requests = tc.detected_security_requests_count

        # Fallback to email object if text lengths/word counts not populated
        if email is not None:
            if subject_length == 0 and email.subject:
                subject_length = len(email.subject)
            if body_length == 0 and email.body:
                body_length = len(email.body)

        return EmailFeatures(
            sender_risk_score=sender_risk_score,
            sender_domain_length=sender_domain_len,
            sender_is_ip=sender_is_ip,
            sender_has_display_name_mismatch=sender_display_mismatch,
            sender_warning_count=sender_warnings_count,
            sender_risk_factor_count=sender_risk_factors_count,
            url_count=url_count,
            suspicious_url_count=suspicious_url_count,
            http_url_count=http_url_count,
            https_url_count=https_url_count,
            ip_url_count=ip_url_count,
            average_url_length=avg_url_length,
            maximum_url_length=max_url_length,
            maximum_subdomain_count=max_subdomains,
            url_warning_count=url_warning_count,
            max_url_risk_score=max_url_risk,
            content_risk_score=content_risk_score,
            urgency_detected=urgency_detected,
            credential_request_detected=credential_request_detected,
            otp_request_detected=otp_request_detected,
            financial_request_detected=financial_request_detected,
            account_verification_detected=account_verification_detected,
            threat_detected=threat_detected,
            reward_claim_detected=reward_claim_detected,
            impersonation_detected=impersonation_detected,
            call_to_action_detected=call_to_action_detected,
            exclamation_count=exclamation_count,
            uppercase_token_count=uppercase_token_count,
            body_word_count=body_word_count,
            subject_length=subject_length,
            body_length=body_length,
            detected_security_requests_count=detected_sec_requests,
        )

    @staticmethod
    def _is_raw_ip(domain: str) -> bool:
        """Checks if a domain string is a raw IP address."""
        clean = domain.strip("[]")
        try:
            ipaddress.ip_address(clean)
            return True
        except ValueError:
            return False
