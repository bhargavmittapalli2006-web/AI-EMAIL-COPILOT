import re
import ipaddress
from email.utils import parseaddr
from typing import List, Tuple, Optional
from app.models.sender_analysis import SenderAnalysis


class SenderAnalyzer:
    """
    Analyzer for email sender information.
    Produces deterministic security signals and risk factors without making
    external network calls or querying live reputation engines.
    """

    # Common recognizable organizations/brands for impersonation detection
    KNOWN_BRANDS = {
        "paypal": {
            "name": "PayPal",
            "domains": ["paypal.com"]
        },
        "microsoft": {
            "name": "Microsoft",
            "domains": ["microsoft.com", "office.com", "live.com", "outlook.com"]
        },
        "apple": {
            "name": "Apple",
            "domains": ["apple.com", "icloud.com"]
        },
        "google": {
            "name": "Google",
            "domains": ["google.com", "gmail.com"]
        },
        "amazon": {
            "name": "Amazon",
            "domains": ["amazon.com", "aws.amazon.com"]
        },
        "netflix": {
            "name": "Netflix",
            "domains": ["netflix.com"]
        },
        "facebook": {
            "name": "Facebook",
            "domains": ["facebook.com", "meta.com"]
        },
        "meta": {
            "name": "Meta",
            "domains": ["meta.com", "facebook.com", "instagram.com"]
        },
        "chase": {
            "name": "Chase",
            "domains": ["chase.com"]
        },
        "wellsfargo": {
            "name": "Wells Fargo",
            "domains": ["wellsfargo.com"]
        },
        "bank of america": {
            "name": "Bank of America",
            "domains": ["bankofamerica.com"]
        },
    }

    # Common security/financial keywords that may indicate suspicious lookalike domains
    SUSPICIOUS_DOMAIN_KEYWORDS = [
        "verify", "verification", "security", "update", "alert",
        "login", "signin", "account", "banking", "secure", "billing"
    ]

    def _parse_sender(self, raw_sender: Optional[str]) -> Tuple[str, str, str]:
        """
        Parses raw sender string into (display_name, email_address, domain).
        Safely handles empty, malformed, or composite address formats.
        """
        if not raw_sender or not raw_sender.strip():
            return "", "", ""

        raw_sender = raw_sender.strip()
        display_name, address = parseaddr(raw_sender)

        # If parseaddr returns empty address, use raw string if no angle brackets
        if not address and "@" in raw_sender:
            address = raw_sender.strip()

        domain = ""
        if "@" in address:
            parts = address.split("@")
            if len(parts) == 2:
                domain = parts[1].strip().strip("[]").lower()

        return display_name.strip(), address.strip().lower(), domain

    def _is_ip_address(self, domain: str) -> bool:
        """Checks whether the domain string is a raw IPv4 or IPv6 address."""
        if not domain:
            return False
        clean_domain = domain.strip("[]")
        try:
            ipaddress.ip_address(clean_domain)
            return True
        except ValueError:
            return False

    def analyze(self, raw_sender: Optional[str]) -> SenderAnalysis:
        """
        Analyzes raw sender string and produces structured SenderAnalysis signals.
        """
        if not raw_sender or not raw_sender.strip():
            return SenderAnalysis(
                sender="",
                domain="",
                display_name="",
                sender_risk_score=30,
                risk_factors=["Missing or empty sender information."],
                warnings=[]
            )

        display_name, address, domain = self._parse_sender(raw_sender)
        risk_factors: List[str] = []
        warnings: List[str] = []
        score = 0

        # Check 1: Malformed Email Address
        if not address:
            score += 35
            risk_factors.append("Malformed sender: No valid email address detected.")
        elif "@" not in address:
            score += 35
            risk_factors.append("Malformed sender: Missing '@' in email address.")
        elif address.count("@") > 1:
            score += 35
            risk_factors.append("Malformed sender: Contains multiple '@' symbols.")
        elif not domain or ("." not in domain and not self._is_ip_address(domain)):
            score += 30
            risk_factors.append("Malformed sender domain: Domain has no valid extension.")

        # Check 2: IP Address as Domain
        if domain and self._is_ip_address(domain):
            score += 45
            risk_factors.append(f"Sender domain is a raw IP address ({domain}) instead of a domain name.")

        # Check 3: Display Name vs Domain Impersonation
        if display_name:
            display_lower = display_name.lower()

            # Check if display name contains a fake email address
            embedded_email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', display_name)
            if embedded_email_match:
                embedded_email = embedded_email_match.group(0).lower()
                if domain and domain not in embedded_email:
                    score += 35
                    risk_factors.append(
                        f"Display name contains an email address ({embedded_email}) that does not match sender domain ({domain})."
                    )

            # Check if display name claims a known brand
            for brand_key, brand_info in self.KNOWN_BRANDS.items():
                if brand_key in display_lower:
                    is_legit = any(domain == d or domain.endswith("." + d) for d in brand_info["domains"])
                    if not is_legit and domain:
                        score += 40
                        risk_factors.append(
                            f"Display name references '{brand_info['name']}' but sender domain '{domain}' does not belong to authorized domains."
                        )

        # Check 4: Suspicious Domain Characteristics
        if domain and not self._is_ip_address(domain):
            domain_lower = domain.lower()

            # Excessive hyphens
            if domain_lower.count("-") >= 3:
                score += 20
                risk_factors.append(f"Sender domain '{domain}' contains excessive hyphens ({domain_lower.count('-')}).")

            # Brand name lookalike in domain
            for brand_key, brand_info in self.KNOWN_BRANDS.items():
                if brand_key in domain_lower:
                    is_legit = any(domain_lower == d or domain_lower.endswith("." + d) for d in brand_info["domains"])
                    if not is_legit:
                        score += 35
                        risk_factors.append(
                            f"Sender domain '{domain}' appears to impersonate brand '{brand_info['name']}'."
                        )

            # Lookalike combinations (security keywords + long numbers)
            has_sec_keyword = any(k in domain_lower for k in self.SUSPICIOUS_DOMAIN_KEYWORDS)
            has_long_number = bool(re.search(r'\d{4,}', domain_lower))

            if has_sec_keyword and has_long_number:
                score += 20
                warnings.append(
                    f"Sender domain '{domain}' contains security/account keywords combined with numeric patterns."
                )

            # Excessive subdomains
            labels = domain_lower.split(".")
            if len(labels) > 4:
                score += 15
                warnings.append(f"Sender domain '{domain}' contains unusually deep subdomain hierarchy ({len(labels)} levels).")

        # Normalize risk score between 0 and 100
        final_score = min(100, max(0, score))

        return SenderAnalysis(
            sender=address or raw_sender,
            domain=domain,
            display_name=display_name,
            sender_risk_score=final_score,
            risk_factors=risk_factors,
            warnings=warnings,
        )
