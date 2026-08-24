"""
URL Analyzer — Deterministic URL Security Signal Extraction

Analyzes URLs extracted by EmailParser and produces structured, explainable
security signals WITHOUT visiting, fetching, or resolving any URL.

═══════════════════════════════════════════════════════════════════════════
SECURITY CONTRACT
═══════════════════════════════════════════════════════════════════════════
  • NEVER makes HTTP/HTTPS requests to analyzed URLs.
  • NEVER downloads content or follows redirects.
  • NEVER executes content or performs DNS resolution.
  • NEVER uses browser automation.
  • NEVER queries external reputation services.
  • Treats every URL strictly as an untrusted input string.
═══════════════════════════════════════════════════════════════════════════

RISK SCORING
═══════════════════════════════════════════════════════════════════════════
The url_risk_score (0-100) is a deterministic sum of weighted indicators.
Each detected characteristic adds a fixed number of points:

  Indicator                                     Points
  ─────────────────────────────────────────────  ──────
  HTTP instead of HTTPS                          10
  Hostname is a raw IP address                   20
  URL length > 100 characters                    10
  URL length > 200 characters                    +5   (cumulative)
  Excessive subdomains (>= 4)                    15
  Username embedded in URL (user@host syntax)    25
  Suspicious percent-encoding / obfuscation      15
  Non-standard port number                       10
  Suspicious path patterns (login/verify/etc.)   10
  Suspicious query-string patterns               10
  Misleading domain structure                    15

The raw sum is clamped to [0, 100].

No single indicator proves phishing — the score simply aggregates
observable structural properties for downstream decision-making.
═══════════════════════════════════════════════════════════════════════════
"""

import re
import ipaddress
from urllib.parse import urlparse, parse_qs, unquote
from typing import List, Optional, Dict

from app.models.url_analysis import URLAnalysis


class URLAnalyzer:
    """
    Deterministic, offline URL analysis engine.

    Accepts raw URL strings and produces structured URLAnalysis results.
    Supports zero, one, or many URLs per invocation.
    """

    # ── Standard ports that should NOT trigger warnings ──────────────
    _STANDARD_PORTS = {80, 443, 8080, 8443}

    # ── Suspicious path segments (case-insensitive matching) ─────────
    _SUSPICIOUS_PATH_KEYWORDS = [
        "login", "signin", "sign-in", "log-in",
        "verify", "verification", "confirm",
        "account", "secure", "update",
        "password", "credential", "banking",
        "wallet", "paypal", "suspend",
        ".exe", ".scr", ".bat", ".cmd", ".ps1",
        ".zip", ".rar", ".js",
    ]

    # ── Suspicious query-string parameter names ──────────────────────
    _SUSPICIOUS_QUERY_PARAMS = [
        "redirect", "redirect_uri", "redirect_url",
        "return", "returnurl", "return_to",
        "next", "url", "goto", "continue",
        "token", "session", "ssn", "password",
        "cmd", "exec", "command",
    ]

    # ── High-value brand strings for misleading-domain detection ─────
    _BRAND_KEYWORDS = [
        "paypal", "microsoft", "apple", "google", "amazon",
        "netflix", "facebook", "chase", "wellsfargo",
        "bankofamerica", "instagram", "whatsapp",
    ]

    # ── Obfuscation patterns in percent-encoded URLs ─────────────────
    _ENCODED_SUSPICIOUS = re.compile(
        r'(%[0-9a-fA-F]{2}){3,}',  # 3+ consecutive percent-encoded chars
    )
    _DOUBLE_ENCODED = re.compile(
        r'%25[0-9a-fA-F]{2}',  # double-encoding (e.g. %252F = %2F)
    )

    # ── Username-in-URL pattern  (e.g. http://admin@evil.com) ────────
    _USERINFO_PATTERN = re.compile(r'^https?://[^/]*@', re.IGNORECASE)

    # ──────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────

    def analyze_urls(self, urls: List[str]) -> List[URLAnalysis]:
        """
        Analyzes a list of URL strings and returns a URLAnalysis for each.

        Handles zero, one, or many URLs gracefully.
        """
        return [self._analyze_single(url) for url in urls]

    # ──────────────────────────────────────────────────────────────────
    # Internal — single URL analysis pipeline
    # ──────────────────────────────────────────────────────────────────

    def _analyze_single(self, raw_url: str) -> URLAnalysis:
        """
        Produces a complete URLAnalysis for one URL string.
        """
        risk_factors: List[str] = []
        warnings: List[str] = []
        score = 0

        # ── 1. Parse the URL components ──────────────────────────────
        parsed = urlparse(raw_url)
        scheme = parsed.scheme.lower() if parsed.scheme else ""
        hostname = parsed.hostname or ""
        port = parsed.port  # None if not explicit
        path = parsed.path or ""
        query_string = parsed.query or ""
        query_params = self._safe_parse_qs(query_string)

        # ── 2. Derived features ──────────────────────────────────────
        uses_https = scheme == "https"
        is_ip = self._is_ip_address(hostname)
        url_length = len(raw_url)
        subdomain_count = self._count_subdomains(hostname, is_ip)
        domain = hostname

        # ── 3. Indicator checks (each adds to score) ─────────────────

        # 3a. HTTP instead of HTTPS (+10)
        if scheme == "http":
            score += 10
            risk_factors.append("URL does not use HTTPS.")

        # 3b. IP address as hostname (+20)
        if is_ip:
            score += 20
            risk_factors.append(
                f"URL uses a raw IP address ({hostname}) instead of a domain name."
            )

        # 3c. URL length (+10 if >100, +5 more if >200)
        if url_length > 200:
            score += 15
            risk_factors.append(
                f"URL is unusually long ({url_length} characters)."
            )
        elif url_length > 100:
            score += 10
            warnings.append(
                f"URL is moderately long ({url_length} characters)."
            )

        # 3d. Excessive subdomains (+15 if >= 4)
        if subdomain_count >= 4:
            score += 15
            risk_factors.append(
                f"URL has an excessive number of subdomains ({subdomain_count})."
            )
        elif subdomain_count >= 3:
            warnings.append(
                f"URL has multiple subdomains ({subdomain_count})."
            )

        # 3e. Username embedded in URL (+25)
        if self._has_userinfo(raw_url):
            score += 25
            risk_factors.append(
                "URL contains embedded user credentials (userinfo before '@')."
            )

        # 3f. Suspicious percent-encoding / obfuscation (+15)
        encoding_issue = self._check_encoding(raw_url)
        if encoding_issue:
            score += 15
            risk_factors.append(encoding_issue)

        # 3g. Non-standard port (+10)
        if port is not None and port not in self._STANDARD_PORTS:
            score += 10
            risk_factors.append(
                f"URL uses a non-standard port ({port})."
            )

        # 3h. Suspicious path patterns (+10)
        path_issue = self._check_path(path)
        if path_issue:
            score += 10
            risk_factors.append(path_issue)

        # 3i. Suspicious query-string parameters (+10)
        query_issue = self._check_query_params(query_params)
        if query_issue:
            score += 10
            risk_factors.append(query_issue)

        # 3j. Misleading domain structure (+15)
        domain_issue = self._check_misleading_domain(hostname, is_ip)
        if domain_issue:
            score += 15
            risk_factors.append(domain_issue)

        # ── 4. Clamp score to [0, 100] ───────────────────────────────
        final_score = min(100, max(0, score))

        return URLAnalysis(
            url=raw_url,
            scheme=scheme,
            domain=domain,
            port=port,
            path=path,
            query_params=query_params,
            uses_https=uses_https,
            is_ip_address=is_ip,
            url_length=url_length,
            subdomain_count=subdomain_count,
            url_risk_score=final_score,
            risk_factors=risk_factors,
            warnings=warnings,
        )

    # ──────────────────────────────────────────────────────────────────
    # Internal — helper methods
    # ──────────────────────────────────────────────────────────────────

    @staticmethod
    def _is_ip_address(hostname: str) -> bool:
        """Returns True if hostname is a raw IPv4 or IPv6 address."""
        if not hostname:
            return False
        clean = hostname.strip("[]")
        try:
            ipaddress.ip_address(clean)
            return True
        except ValueError:
            return False

    @staticmethod
    def _count_subdomains(hostname: str, is_ip: bool) -> int:
        """
        Counts subdomains. For 'a.b.example.com', subdomain_count = 2.
        Returns 0 for IPs, bare domains ('example.com'), or empty hostnames.
        """
        if is_ip or not hostname:
            return 0
        labels = hostname.split(".")
        # A standard domain has 2 labels (e.g. example.com).
        # Anything beyond that is subdomains.
        return max(0, len(labels) - 2)

    @staticmethod
    def _safe_parse_qs(query_string: str) -> Dict[str, str]:
        """
        Safely parses a query string into a flat dict.
        For multi-valued keys, only the first value is kept.
        """
        if not query_string:
            return {}
        raw = parse_qs(query_string, keep_blank_values=True)
        return {k: v[0] if v else "" for k, v in raw.items()}

    @classmethod
    def _has_userinfo(cls, raw_url: str) -> bool:
        """Checks for username:password@ syntax in the authority section."""
        return bool(cls._USERINFO_PATTERN.match(raw_url))

    @classmethod
    def _check_encoding(cls, raw_url: str) -> Optional[str]:
        """
        Detects suspicious percent-encoding patterns that may indicate
        URL obfuscation or evasion attempts.
        """
        if cls._DOUBLE_ENCODED.search(raw_url):
            return (
                "URL contains double percent-encoding, which may indicate obfuscation."
            )
        if cls._ENCODED_SUSPICIOUS.search(raw_url):
            return (
                "URL contains excessive percent-encoding, which may indicate obfuscation."
            )
        return None

    @classmethod
    def _check_path(cls, path: str) -> Optional[str]:
        """Detects suspicious keywords or patterns in the URL path."""
        if not path:
            return None
        path_lower = path.lower()
        found = [kw for kw in cls._SUSPICIOUS_PATH_KEYWORDS if kw in path_lower]
        if found:
            return (
                f"URL path contains suspicious keyword(s): {', '.join(found)}."
            )
        return None

    @classmethod
    def _check_query_params(cls, params: Dict[str, str]) -> Optional[str]:
        """Detects suspicious parameter names in the query string."""
        if not params:
            return None
        param_names_lower = [k.lower() for k in params.keys()]
        found = [
            sp for sp in cls._SUSPICIOUS_QUERY_PARAMS
            if sp in param_names_lower
        ]
        if found:
            return (
                f"URL query string contains suspicious parameter(s): {', '.join(found)}."
            )
        return None

    @classmethod
    def _check_misleading_domain(
        cls, hostname: str, is_ip: bool
    ) -> Optional[str]:
        """
        Detects domains that embed well-known brand names in subdomains or
        hyphenated labels, which may indicate impersonation.

        Example: 'paypal-login.evil.com' or 'google.security-update.xyz'
        """
        if is_ip or not hostname:
            return None

        hostname_lower = hostname.lower()
        labels = hostname_lower.split(".")

        # The registered domain is typically the last 2 labels
        if len(labels) < 2:
            return None

        registered_domain = ".".join(labels[-2:])

        for brand in cls._BRAND_KEYWORDS:
            if brand in hostname_lower:
                # Allow if the brand IS the registered domain
                # e.g. 'paypal.com', 'mail.google.com'
                if registered_domain.startswith(brand):
                    continue
                return (
                    f"URL domain '{hostname}' contains brand name '{brand}' in a "
                    f"non-authoritative position, which may indicate impersonation."
                )
        return None
