import re
import urllib.parse
from typing import Dict, List, Any

# Urgent language and coercive trigger words
PHISHING_URGENCY_WORDS = {
    "urgent", "suspended", "immediately", "immediate action", "security alert",
    "password reset", "expire", "expiration", "action required",
    "unauthorized", "legal action", "overdue", "locked", "compromised",
    "terminated", "terminate", "within 24 hours", "within 2 hours", "critical alert"
}

# Credential and sensitive data theft keywords
SENSITIVE_DATA_WORDS = {
    "ssn", "social security", "credit card", "banking", "password", "passcode",
    "pin", "credentials", "tax refund", "wire transfer", "bank details",
    "gift card", "claim reward", "payroll", "cvv", "security code", "card details"
}

# Explicit account verification / identity confirmation triggers
ACCOUNT_VERIFICATION_WORDS = {
    "verify your account", "verify identity", "confirm identity", "confirm your account",
    "unlock your account", "identity verification", "account verification", "re-activate",
    "verify your identity", "validate your account", "update your password", "re-enter your banking"
}

# Suspicious TLDs commonly abused in automated phishing domains
SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".site", ".online", ".tech", ".info", ".space",
    ".click", ".tk", ".ml", ".ga", ".cf", ".gq", ".buzz", ".rest", ".club"
}

# Popular URL shorteners hiding true destination endpoints
SHORTENER_DOMAINS = {
    "bit.ly", "tinyurl.com", "goo.gl", "ow.ly", "t.co", "is.gd", "buff.ly", "adf.ly", "cutt.ly"
}

# Generic freemail domains
FREEMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "protonmail.com", "mail.com", "yandex.com"
}

# Targeted high-value brands commonly impersonated
IMPERSONATED_BRANDS = {
    "bank", "security", "support", "billing", "ceo", "paypal", "amazon", "google",
    "apple", "irs", "hr", "payroll", "microsoft", "netflix", "chase", "wells fargo", "citibank"
}


class FeatureExtractor:
    """Extracts security, lexical, and structural risk indicators from email payloads."""

    def extract_features(
        self,
        subject: str,
        sender: str,
        body: str,
        reply_to: str = "",
        links: List[str] = None
    ) -> Dict[str, Any]:
        links = links or []
        subject_str = subject or ""
        body_str = body or ""
        sender_str = sender or ""
        reply_to_str = reply_to or sender_str

        combined_text = f"{subject_str} {body_str}".lower()

        # 1. URL / Link Analysis
        all_links = list(links)
        # Extract body URLs if none explicitly supplied in links parameter
        body_urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', body_str)
        for u in body_urls:
            if u not in all_links:
                all_links.append(u)

        url_count = len(all_links)
        has_ip_url = int(any(re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', link) for link in all_links))

        has_shortener = 0
        suspicious_tld_count = 0
        for link in all_links:
            parsed = urllib.parse.urlparse(link if "://" in link else f"http://{link}")
            netloc = parsed.netloc.lower()
            if any(shortener in netloc for shortener in SHORTENER_DOMAINS):
                has_shortener = 1
            if any(netloc.endswith(tld) for tld in SUSPICIOUS_TLDS):
                suspicious_tld_count += 1

        # 2. Text, Urgency & Sensitive Content Analysis
        urgent_word_count = sum(1 for phrase in PHISHING_URGENCY_WORDS if phrase in combined_text)
        sensitive_word_count = sum(1 for phrase in SENSITIVE_DATA_WORDS if phrase in combined_text)
        verification_request_count = sum(1 for phrase in ACCOUNT_VERIFICATION_WORDS if phrase in combined_text)

        raw_letters = [c for c in f"{subject_str} {body_str}" if c.isalpha()]
        uppercase_count = sum(1 for c in raw_letters if c.isupper())
        uppercase_ratio = round(uppercase_count / len(raw_letters), 3) if raw_letters else 0.0

        exclamation_mark_count = subject_str.count("!") + body_str.count("!")
        currency_symbol_count = sum(combined_text.count(sym) for sym in ["$", "€", "£", "₹"])

        # 3. Header & Sender Domain Analysis
        sender_domain = self._extract_domain(sender_str)
        reply_to_domain = self._extract_domain(reply_to_str)
        sender_replyto_mismatch = int(bool(sender_domain and reply_to_domain and (sender_domain != reply_to_domain)))

        has_suspicious_sender_tld = int(any(sender_domain.endswith(tld) for tld in SUSPICIOUS_TLDS))
        has_freemail_sender = int(sender_domain in FREEMAIL_DOMAINS)

        # Detect brand impersonation
        claims_official_brand = any(brand in combined_text or brand in sender_str.lower() for brand in IMPERSONATED_BRANDS)
        suspicious_brand_impersonation = int(claims_official_brand and (has_freemail_sender or has_suspicious_sender_tld or has_ip_url))

        features = {
            # Link indicators
            "url_count": url_count,
            "has_ip_url": has_ip_url,
            "has_shortener": has_shortener,
            "suspicious_tld_count": suspicious_tld_count,

            # Content indicators
            "urgent_word_count": urgent_word_count,
            "sensitive_word_count": sensitive_word_count,
            "uppercase_ratio": uppercase_ratio,
            "exclamation_mark_count": exclamation_mark_count,
            "currency_symbol_count": currency_symbol_count,

            # Header & domain indicators
            "sender_replyto_mismatch": sender_replyto_mismatch,
            "has_suspicious_sender_tld": has_suspicious_sender_tld,
            "has_freemail_sender": has_freemail_sender,
            "suspicious_brand_impersonation": suspicious_brand_impersonation,
        }

        flagged_reasons = self._generate_flagged_reasons(
            features=features,
            sender_domain=sender_domain,
            reply_to_domain=reply_to_domain,
            verification_request_count=verification_request_count
        )

        return {
            "features": features,
            "flagged_reasons": flagged_reasons,
            "combined_text": combined_text
        }

    def _extract_domain(self, email_str: str) -> str:
        """Extracts domain from raw email string or RFC header (e.g. 'Support <support@domain.com>')."""
        match = re.search(r'@([\w\.-]+)', email_str)
        if match:
            return match.group(1).lower().strip()
        return email_str.lower().strip()

    def _generate_flagged_reasons(
        self,
        features: Dict[str, Any],
        sender_domain: str,
        reply_to_domain: str,
        verification_request_count: int
    ) -> List[str]:
        """Generates human-readable security threat explanations for flagged indicators."""
        reasons = []

        if features["has_ip_url"]:
            reasons.append("Email contains links pointing directly to raw IP addresses instead of verified domain names.")

        if features["has_shortener"]:
            reasons.append("Email contains URL shorteners (e.g. bit.ly, tinyurl) commonly used to conceal malicious destinations.")

        if features["suspicious_tld_count"] > 0:
            reasons.append("Email links contain high-risk top-level domains frequently associated with phishing campaigns.")

        if features["sender_replyto_mismatch"]:
            reasons.append(f"Sender domain ('{sender_domain}') does not match Reply-To domain ('{reply_to_domain}'), indicating potential header spoofing.")

        if features["suspicious_brand_impersonation"]:
            reasons.append("Email claims an official institution or executive identity but originates from an unverified, generic, or high-risk domain.")

        if features["urgent_word_count"] >= 2:
            reasons.append("Email utilizes high-urgency psychological triggers or threats of negative consequences to force immediate user action.")

        if features["sensitive_word_count"] >= 2:
            reasons.append("Email requests sensitive personal, banking, or account credential information.")

        if verification_request_count > 0:
            reasons.append("Email solicits immediate account re-verification, credential updates, or identity confirmation.")

        if features["has_suspicious_sender_tld"]:
            reasons.append(f"Sender address uses a high-risk TLD commonly linked to disposable phishing infrastructure ('{sender_domain}').")

        if features["uppercase_ratio"] > 0.35:
            reasons.append("Email contains excessive CAPITALIZATION, typical of coercive spam and social engineering scams.")

        return reasons
