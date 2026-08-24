import re
import urllib.parse
from typing import Dict, List, Any

# Common keywords associated with phishing and high-urgency scams
PHISHING_URGENCY_WORDS = {
    "urgent", "suspended", "immediately", "verify", "security alert",
    "password reset", "expire", "expiration", "action required",
    "unauthorized", "legal action", "overdue", "locked", "compromised"
}

SENSITIVE_DATA_WORDS = {
    "ssn", "social security", "credit card", "banking", "password",
    "pin", "credentials", "tax refund", "wire transfer", "bank details",
    "gift card", "claim reward", "payroll"
}

SUSPICIOUS_TLDS = {".xyz", ".top", ".site", ".online", ".tech", ".info", ".space", ".click", ".tk", ".ml", ".ga", ".cf", ".gq"}
SHORTENER_DOMAINS = {"bit.ly", "tinyurl.com", "goo.gl", "ow.ly", "t.co", "is.gd", "buff.ly", "adf.ly"}
FREEMAIL_DOMAINS = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "protonmail.com"}

class FeatureExtractor:
    """Extracts security and risk features from raw email data."""

    def extract_features(self, subject: str, sender: str, body: str, reply_to: str = "", links: List[str] = None) -> Dict[str, Any]:
        links = links or []
        subject_str = subject or ""
        body_str = body or ""
        sender_str = sender or ""
        reply_to_str = reply_to or sender_str

        combined_text = f"{subject_str} {body_str}".lower()

        # 1. URL / Link Analysis
        url_count = len(links)
        has_ip_url = int(any(re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', link) for link in links))
        
        has_shortener = 0
        suspicious_tld_count = 0
        for link in links:
            parsed = urllib.parse.urlparse(link)
            netloc = parsed.netloc.lower()
            if any(shortener in netloc for shortener in SHORTENER_DOMAINS):
                has_shortener = 1
            if any(netloc.endswith(tld) for tld in SUSPICIOUS_TLDS):
                suspicious_tld_count += 1

        # Extract URLs found directly inside body text if links list was empty
        body_urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', body_str)
        if not links and body_urls:
            url_count = len(body_urls)
            has_ip_url = int(any(re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', u) for u in body_urls))
            for u in body_urls:
                parsed = urllib.parse.urlparse(u)
                netloc = parsed.netloc.lower()
                if any(shortener in netloc for shortener in SHORTENER_DOMAINS):
                    has_shortener = 1
                if any(netloc.endswith(tld) for tld in SUSPICIOUS_TLDS):
                    suspicious_tld_count += 1

        # 2. Text & Urgency Analysis
        urgent_word_count = sum(1 for word in PHISHING_URGENCY_WORDS if word in combined_text)
        sensitive_word_count = sum(1 for word in SENSITIVE_DATA_WORDS if word in combined_text)
        
        raw_letters = [c for c in f"{subject_str} {body_str}" if c.isalpha()]
        uppercase_count = sum(1 for c in raw_letters if c.isupper())
        uppercase_ratio = round(uppercase_count / len(raw_letters), 3) if raw_letters else 0.0
        
        exclamation_mark_count = subject_str.count("!") + body_str.count("!")
        currency_symbol_count = sum(combined_text.count(sym) for sym in ["$", "€", "£"])

        # 3. Header & Sender Domain Analysis
        sender_domain = self._extract_domain(sender_str)
        reply_to_domain = self._extract_domain(reply_to_str)
        sender_replyto_mismatch = int(sender_domain != reply_to_domain and reply_to_domain != "")

        has_suspicious_sender_tld = int(any(sender_domain.endswith(tld) for tld in SUSPICIOUS_TLDS))
        has_freemail_sender = int(sender_domain in FREEMAIL_DOMAINS)
        
        # Check if email claims executive/official identity but uses generic freemail/suspicious domain
        official_keywords = {"bank", "security", "support", "billing", "ceo", "paypal", "amazon", "google", "apple", "irs", "hr"}
        claims_official_brand = any(kw in combined_text or kw in sender_str.lower() for kw in official_keywords)
        suspicious_brand_impersonation = int(claims_official_brand and (has_freemail_sender or has_suspicious_sender_tld))

        features = {
            # Link metrics
            "url_count": url_count,
            "has_ip_url": has_ip_url,
            "has_shortener": has_shortener,
            "suspicious_tld_count": suspicious_tld_count,

            # Text metrics
            "urgent_word_count": urgent_word_count,
            "sensitive_word_count": sensitive_word_count,
            "uppercase_ratio": uppercase_ratio,
            "exclamation_mark_count": exclamation_mark_count,
            "currency_symbol_count": currency_symbol_count,

            # Header metrics
            "sender_replyto_mismatch": sender_replyto_mismatch,
            "has_suspicious_sender_tld": has_suspicious_sender_tld,
            "has_freemail_sender": has_freemail_sender,
            "suspicious_brand_impersonation": suspicious_brand_impersonation
        }

        flagged_reasons = self._generate_flagged_reasons(features, sender_domain, reply_to_domain)

        return {
            "features": features,
            "flagged_reasons": flagged_reasons,
            "combined_text": combined_text
        }

    def _extract_domain(self, email_str: str) -> str:
        """Helper to extract domain from email string like 'Name <user@domain.com>'."""
        match = re.search(r'@([\w\.-]+)', email_str)
        if match:
            return match.group(1).lower().strip()
        return email_str.lower().strip()

    def _generate_flagged_reasons(self, features: Dict[str, Any], sender_domain: str, reply_to_domain: str) -> List[str]:
        """Generates human-readable explanations of safety flags."""
        reasons = []

        if features["has_ip_url"]:
            reasons.append("Email contains links pointing directly to raw IP addresses instead of trusted domain names.")

        if features["has_shortener"]:
            reasons.append("Email contains URL shorteners (e.g. bit.ly, tinyurl) used to hide true destinations.")

        if features["suspicious_tld_count"] > 0:
            reasons.append("Email contains links with high-risk TLDs commonly used in phishing campaigns.")

        if features["sender_replyto_mismatch"]:
            reasons.append(f"Sender domain ('{sender_domain}') does not match Reply-To domain ('{reply_to_domain}').")

        if features["suspicious_brand_impersonation"]:
            reasons.append("Email uses official/executive terminology while originating from an unverified or generic domain.")

        if features["urgent_word_count"] >= 2:
            reasons.append("Email creates artificial urgency or threatens negative consequences to force immediate action.")

        if features["sensitive_word_count"] >= 2:
            reasons.append("Email requests sensitive personal, banking, or account credential information.")

        if features["uppercase_ratio"] > 0.3:
            reasons.append("Email uses excessive CAPITALIZATION, often seen in scam or spam messaging.")

        return reasons
