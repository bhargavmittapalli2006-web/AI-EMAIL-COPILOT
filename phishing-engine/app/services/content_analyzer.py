"""
Content Analyzer — Deterministic Email Content Security Signal Extraction

Analyzes textual content (subject, body, and combined text) to detect
security-relevant linguistic signals and extract text characteristics
WITHOUT machine learning, LLMs, or external API calls.

═══════════════════════════════════════════════════════════════════════════
SECURITY CONTRACT
═══════════════════════════════════════════════════════════════════════════
  • Pure static text processing.
  • NEVER visits, fetches, or queries any URL or service.
  • NEVER executes or downloads attachment content.
  • Purely offline and deterministic rule-based evaluation.
═══════════════════════════════════════════════════════════════════════════

RISK SCORING
═══════════════════════════════════════════════════════════════════════════
The content_risk_score (0-100) aggregates weighted linguistic indicators.
Each detected indicator produces a typed, explainable signal:

  Indicator Type                Severity    Points
  ────────────────────────────  ──────────  ──────
  Credential Request            High        +25
  OTP / Security Code Request   High        +25
  Threatening Language          High        +20
  Urgent / Pressure Language    Medium      +15
  Account Verification Request  Medium      +15
  Financial / Payment Request   Medium      +15
  Reward / Prize Claims         Medium      +20
  Impersonation Language        Medium      +10
  Suspicious Call to Action     Medium      +10
  Excessive Exclamation Marks   Low         +10
  Excessive Capitalization      Low         +10

The raw sum is clamped to [0, 100].
═══════════════════════════════════════════════════════════════════════════
"""

import re
from typing import List, Tuple
from app.models.content_analysis import ContentAnalysis, ContentSignal, TextCharacteristics


class ContentAnalyzer:
    """
    Deterministic linguistic indicator detection and text characteristic extraction engine.
    """

    # Common acronyms that should not be counted as suspicious uppercase screaming
    _EXCLUDED_ACRONYMS = {
        "HTML", "HTTP", "HTTPS", "URL", "PDF", "API", "JSON", "XML", "REST",
        "USA", "UK", "FAQ", "ASAP", "ID", "IT", "CEO", "CTO", "CFO", "HR",
        "PM", "AM", "EST", "PST", "UTC", "GMT", "AI", "ML", "SQL", "SMS",
    }

    # ── Compiled Regular Expressions for Security Indicators ─────────────

    _CREDENTIAL_PATTERNS = [
        re.compile(r'\b(?:enter|send|provide|verify|confirm|reset|submit|type)\s+(?:your\s+)?(?:current\s+)?(?:password|passcode|pin\s+number|login credentials|credentials|secret key)\b', re.IGNORECASE),
        re.compile(r'\b(?:password|credential)\s+(?:expiry|expiration|has expired|reset required)\b', re.IGNORECASE),
    ]

    _OTP_PATTERNS = [
        re.compile(r'\b(?:send|share|provide|enter|submit|reply with)\s+(?:the\s+|your\s+)?(?:otp|one[-\s]?time password|verification code|security code|2fa code|auth code)\b', re.IGNORECASE),
        re.compile(r'\b(?:enter|submit)\s+(?:the\s+)?6[-\s]digit\s+code\b', re.IGNORECASE),
    ]

    _THREATENING_PATTERNS = [
        re.compile(r'\b(?:will be|is|account)\s+(?:permanently\s+)?(?:suspended|terminated|disabled|deleted|locked|closed|deactivated)\b', re.IGNORECASE),
        re.compile(r'\b(?:unauthorized|suspicious)\s+(?:access|activity|sign-?in|attempt|login)\b', re.IGNORECASE),
        re.compile(r'\b(?:legal action|law enforcement|police report)\b', re.IGNORECASE),
        re.compile(r'\b(?:failure to comply will result in)\b', re.IGNORECASE),
    ]

    _URGENCY_PATTERNS = [
        re.compile(r'\b(?:immediately|right away|act now|urgent|urgently|action required|time[-\s]sensitive)\b', re.IGNORECASE),
        re.compile(r'\b(?:within\s+(?:24|12|48|2|1)\s*hours?|within\s+(?:30|60|15)\s*minutes?)\b', re.IGNORECASE),
        re.compile(r'\b(?:before your account is|without delay|at once|immediate attention)\b', re.IGNORECASE),
    ]

    _ACCOUNT_VERIFICATION_PATTERNS = [
        re.compile(r'\b(?:verify|validate|re-?activate|confirm|update)\s+(?:your\s+)?(?:account|identity|profile|information|details|records)\b', re.IGNORECASE),
        re.compile(r'\b(?:account confirmation|identity verification required)\b', re.IGNORECASE),
    ]

    _FINANCIAL_PATTERNS = [
        re.compile(r'\b(?:update|provide|enter|send)\s+(?:your\s+)?(?:credit card|debit card|bank account|banking details|billing info(?:rmation)?|payment method)\b', re.IGNORECASE),
        re.compile(r'\b(?:wire transfer|cryptocurrency|bitcoin|gift card payment|send funds)\b', re.IGNORECASE),
        re.compile(r'\b(?:overdue invoice|payment overdue|unpaid balance|past due payment)\b', re.IGNORECASE),
    ]

    _REWARD_PRIZE_PATTERNS = [
        re.compile(r'\b(?:you (?:have|\'ve) won|claim your (?:prize|reward|gift card|bonus)|lottery winner|exclusive reward)\b', re.IGNORECASE),
        re.compile(r'\b(?:congratulations,? you were selected|claim \$[0-9,]+|free crypto|free voucher)\b', re.IGNORECASE),
    ]

    _IMPERSONATION_PATTERNS = [
        re.compile(r'\b(?:official (?:support|security|it department|helpdesk)|it helpdesk administrator|system administrator|global security team|central security service)\b', re.IGNORECASE),
    ]

    _CALL_TO_ACTION_PATTERNS = [
        re.compile(r'\b(?:click (?:here|the link below|this link|on the button) to (?:verify|confirm|unlock|restore|reactivate|claim|view|login|sign in))\b', re.IGNORECASE),
        re.compile(r'\b(?:follow the link below to (?:avoid|prevent|keep))\b', re.IGNORECASE),
    ]

    def analyze(self, subject: str, body: str) -> ContentAnalysis:
        """
        Analyzes subject and body text and produces structured ContentAnalysis signals.
        """
        subj = subject if subject is not None else ""
        bdy = body if body is not None else ""
        combined = f"{subj}\n{bdy}".strip()

        # 1. Compute statistical text characteristics
        chars = self._compute_text_characteristics(subj, bdy)

        # 2. Extract linguistic security signals
        signals, warnings, score, sec_requests_count = self._evaluate_signals(subj, bdy, combined, chars)

        # Update detected requests count on characteristics
        chars.detected_security_requests_count = sec_requests_count

        # 3. Score normalization [0, 100]
        final_score = min(100, max(0, score))

        return ContentAnalysis(
            content_risk_score=final_score,
            signals=signals,
            warnings=warnings,
            text_characteristics=chars,
        )

    def _compute_text_characteristics(self, subject: str, body: str) -> TextCharacteristics:
        """Computes basic text statistics."""
        combined = f"{subject} {body}"
        words = re.findall(r'\b\w+\b', combined)
        word_count = len(words)

        exclamation_count = combined.count("!")

        # Count uppercase tokens (words with >= 3 chars that are all uppercase and not standard acronyms)
        uppercase_tokens = [
            w for w in words
            if len(w) >= 3 and w.isupper() and w not in self._EXCLUDED_ACRONYMS and not w.isdigit()
        ]

        return TextCharacteristics(
            subject_length=len(subject),
            body_length=len(body),
            word_count=word_count,
            exclamation_count=exclamation_count,
            uppercase_token_count=len(uppercase_tokens),
            detected_security_requests_count=0,
        )

    def _evaluate_signals(
        self, subject: str, body: str, combined: str, chars: TextCharacteristics
    ) -> Tuple[List[ContentSignal], List[str], int, int]:
        """
        Applies deterministic linguistic checks and scores them.
        """
        signals: List[ContentSignal] = []
        warnings: List[str] = []
        score = 0
        security_requests = 0

        if not combined:
            return signals, warnings, 0, 0

        # Check 1: Credential / Password Requests (+25)
        if any(p.search(combined) for p in self._CREDENTIAL_PATTERNS):
            score += 25
            security_requests += 1
            signals.append(ContentSignal(
                type="credential_request",
                severity="high",
                description="Email contains requests for password or login credentials.",
            ))

        # Check 2: OTP / 2FA / Security Code Requests (+25)
        if any(p.search(combined) for p in self._OTP_PATTERNS):
            score += 25
            security_requests += 1
            signals.append(ContentSignal(
                type="otp_request",
                severity="high",
                description="Email requests one-time passwords (OTP) or authentication codes.",
            ))

        # Check 3: Threatening / Account Suspension Language (+20)
        if any(p.search(combined) for p in self._THREATENING_PATTERNS):
            score += 20
            signals.append(ContentSignal(
                type="threatening_language",
                severity="high",
                description="Email contains threatening language or notices of account termination/suspension.",
            ))

        # Check 4: Urgency / Time-Pressure Language (+15)
        if any(p.search(combined) for p in self._URGENCY_PATTERNS):
            score += 15
            signals.append(ContentSignal(
                type="urgency",
                severity="medium",
                description="Email uses urgent language or creates pressure to act quickly.",
            ))

        # Check 5: Account Verification Requests (+15)
        if any(p.search(combined) for p in self._ACCOUNT_VERIFICATION_PATTERNS):
            score += 15
            security_requests += 1
            signals.append(ContentSignal(
                type="account_verification",
                severity="medium",
                description="Email prompts user to verify or re-activate account details.",
            ))

        # Check 6: Financial / Payment Requests (+15)
        if any(p.search(combined) for p in self._FINANCIAL_PATTERNS):
            score += 15
            security_requests += 1
            signals.append(ContentSignal(
                type="financial_request",
                severity="medium",
                description="Email contains requests regarding payment, banking, or financial data.",
            ))

        # Check 7: Reward / Prize / Lottery Claims (+20)
        if any(p.search(combined) for p in self._REWARD_PRIZE_PATTERNS):
            score += 20
            signals.append(ContentSignal(
                type="reward_prize",
                severity="medium",
                description="Email claims unsolicited rewards, prizes, or lottery winnings.",
            ))

        # Check 8: Impersonation Language (+10)
        if any(p.search(combined) for p in self._IMPERSONATION_PATTERNS):
            score += 10
            signals.append(ContentSignal(
                type="impersonation_language",
                severity="medium",
                description="Email uses authoritative IT or security administrator titles.",
            ))

        # Check 9: Suspicious Call To Action (+10)
        if any(p.search(combined) for p in self._CALL_TO_ACTION_PATTERNS):
            score += 10
            security_requests += 1
            signals.append(ContentSignal(
                type="suspicious_call_to_action",
                severity="medium",
                description="Email urges user to click external links to resolve account issues.",
            ))

        # Check 10: Excessive Exclamation Marks (+10 if >= 3)
        if chars.exclamation_count >= 3:
            score += 10
            signals.append(ContentSignal(
                type="excessive_punctuation",
                severity="low",
                description=f"Email contains excessive exclamation marks ({chars.exclamation_count}).",
            ))
        elif chars.exclamation_count >= 2:
            warnings.append(f"Email contains multiple exclamation marks ({chars.exclamation_count}).")

        # Check 11: Excessive Capitalization (+10 if >= 3 uppercase words)
        if chars.uppercase_token_count >= 3:
            score += 10
            signals.append(ContentSignal(
                type="excessive_capitalization",
                severity="low",
                description=f"Email contains {chars.uppercase_token_count} words in all-caps, indicating shouting or emotional pressure.",
            ))
        elif chars.uppercase_token_count >= 2:
            warnings.append("Email contains several capitalized words.")

        return signals, warnings, score, security_requests
