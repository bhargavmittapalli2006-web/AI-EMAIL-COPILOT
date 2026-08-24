"""
Unit tests for the URL Analyzer service.

All URLs used here are fictional/safe and are NEVER fetched or visited.
Tests verify deterministic, offline URL string analysis only.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app.services.url_analyzer import URLAnalyzer

analyzer = URLAnalyzer()


# ─────────────────────────────────────────────────────────────────
# 1. Normal HTTPS URL
# ─────────────────────────────────────────────────────────────────

class TestNormalHTTPSURL:
    """A clean HTTPS URL should produce zero risk factors."""

    def test_safe_https_url_basic_fields(self):
        results = analyzer.analyze_urls(["https://example.com/account/login"])
        assert len(results) == 1
        r = results[0]
        assert r.url == "https://example.com/account/login"
        assert r.scheme == "https"
        assert r.domain == "example.com"
        assert r.uses_https is True
        assert r.is_ip_address is False
        assert r.subdomain_count == 0
        assert r.port is None

    def test_safe_https_url_low_risk(self):
        results = analyzer.analyze_urls(["https://example.com/page"])
        r = results[0]
        assert r.url_risk_score == 0
        assert r.risk_factors == []

    def test_safe_https_url_length(self):
        results = analyzer.analyze_urls(["https://example.com/page"])
        r = results[0]
        assert r.url_length == len("https://example.com/page")


# ─────────────────────────────────────────────────────────────────
# 2. HTTP URL (no TLS)
# ─────────────────────────────────────────────────────────────────

class TestHTTPURL:
    """An HTTP URL should flag the lack of HTTPS."""

    def test_http_flagged(self):
        results = analyzer.analyze_urls(["http://example.com/page"])
        r = results[0]
        assert r.uses_https is False
        assert r.scheme == "http"
        assert r.url_risk_score >= 10
        assert any("HTTPS" in f for f in r.risk_factors)

    def test_http_domain_extraction(self):
        results = analyzer.analyze_urls(["http://shop.example.org/checkout"])
        r = results[0]
        assert r.domain == "shop.example.org"
        assert r.subdomain_count == 1


# ─────────────────────────────────────────────────────────────────
# 3. IP-address URL
# ─────────────────────────────────────────────────────────────────

class TestIPAddressURL:
    """URLs using raw IP addresses should be flagged."""

    def test_ipv4_detected(self):
        results = analyzer.analyze_urls(["http://192.168.1.100/admin"])
        r = results[0]
        assert r.is_ip_address is True
        assert r.domain == "192.168.1.100"
        assert r.url_risk_score >= 20
        assert any("IP address" in f for f in r.risk_factors)

    def test_ipv4_https_still_flags_ip(self):
        results = analyzer.analyze_urls(["https://10.0.0.1/login"])
        r = results[0]
        assert r.is_ip_address is True
        assert r.uses_https is True
        # Should only flag IP, not HTTP
        assert any("IP address" in f for f in r.risk_factors)
        assert not any("HTTPS" in f for f in r.risk_factors)

    def test_ip_subdomain_count_is_zero(self):
        results = analyzer.analyze_urls(["http://192.168.1.1/"])
        r = results[0]
        assert r.subdomain_count == 0


# ─────────────────────────────────────────────────────────────────
# 4. Long URL
# ─────────────────────────────────────────────────────────────────

class TestLongURL:
    """Excessively long URLs should trigger length warnings or risk factors."""

    def test_moderately_long_url(self):
        # Build a URL just over 100 chars
        base = "https://example.com/"
        padding = "a" * (101 - len(base))
        url = base + padding
        assert len(url) > 100
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.url_length > 100
        # Should have a warning for moderate length
        assert len(r.warnings) > 0 or r.url_risk_score >= 10

    def test_very_long_url(self):
        base = "https://example.com/"
        padding = "b" * (201 - len(base))
        url = base + padding
        assert len(url) > 200
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.url_length > 200
        assert r.url_risk_score >= 15
        assert any("long" in f.lower() for f in r.risk_factors)


# ─────────────────────────────────────────────────────────────────
# 5. URL with multiple subdomains
# ─────────────────────────────────────────────────────────────────

class TestMultipleSubdomains:
    """URLs with deep subdomain hierarchies should be flagged."""

    def test_four_subdomains_flagged(self):
        url = "https://a.b.c.d.example.com/page"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.subdomain_count == 4
        assert r.url_risk_score >= 15
        assert any("subdomain" in f.lower() for f in r.risk_factors)

    def test_two_subdomains_ok(self):
        url = "https://www.mail.example.com/"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.subdomain_count == 2
        # 2 subdomains should not trigger excessive-subdomain risk
        assert not any("excessive" in f.lower() for f in r.risk_factors)

    def test_three_subdomains_warning(self):
        url = "https://a.b.c.example.com/"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.subdomain_count == 3
        assert any("subdomain" in w.lower() for w in r.warnings)


# ─────────────────────────────────────────────────────────────────
# 6. URL with query parameters
# ─────────────────────────────────────────────────────────────────

class TestQueryParameters:
    """Query parameters should be parsed and suspicious ones flagged."""

    def test_benign_query_params(self):
        url = "https://example.com/search?q=hello&page=1"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.query_params == {"q": "hello", "page": "1"}
        assert r.url_risk_score == 0

    def test_suspicious_redirect_param(self):
        url = "https://example.com/auth?redirect=http://evil.test/steal"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert "redirect" in r.query_params
        assert r.url_risk_score >= 10
        assert any("redirect" in f.lower() for f in r.risk_factors)

    def test_no_query_params(self):
        url = "https://example.com/page"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.query_params == {}


# ─────────────────────────────────────────────────────────────────
# 7. URL with unusual port
# ─────────────────────────────────────────────────────────────────

class TestUnusualPort:
    """Non-standard ports should be flagged."""

    def test_unusual_port_detected(self):
        url = "https://example.com:9999/admin"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.port == 9999
        assert r.url_risk_score >= 10
        assert any("port" in f.lower() for f in r.risk_factors)

    def test_standard_port_443_ok(self):
        url = "https://example.com:443/page"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.port == 443
        assert not any("port" in f.lower() for f in r.risk_factors)

    def test_standard_port_80_ok(self):
        url = "http://example.com:80/page"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.port == 80
        assert not any("port" in f.lower() for f in r.risk_factors)

    def test_port_8080_ok(self):
        url = "http://example.com:8080/page"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.port == 8080
        assert not any("port" in f.lower() for f in r.risk_factors)


# ─────────────────────────────────────────────────────────────────
# 8. URL containing encoded characters
# ─────────────────────────────────────────────────────────────────

class TestEncodedCharacters:
    """Excessive or double percent-encoding should be flagged."""

    def test_excessive_encoding(self):
        # Three consecutive percent-encoded characters
        url = "https://example.com/%61%62%63%64%65/page"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.url_risk_score >= 15
        assert any("encoding" in f.lower() or "obfuscation" in f.lower()
                    for f in r.risk_factors)

    def test_double_encoding(self):
        # %252F is double-encoded '/'
        url = "https://example.com/path%252Fhidden"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert any("double" in f.lower() or "obfuscation" in f.lower()
                    for f in r.risk_factors)

    def test_normal_encoding_ok(self):
        # Single %20 (space) should NOT trigger the obfuscation check
        url = "https://example.com/my%20page"
        results = analyzer.analyze_urls([url])
        r = results[0]
        # Normal single-character encoding should not be flagged as obfuscation
        assert not any("obfuscation" in f.lower() for f in r.risk_factors)


# ─────────────────────────────────────────────────────────────────
# 9. Email containing multiple URLs
# ─────────────────────────────────────────────────────────────────

class TestMultipleURLs:
    """The analyzer must handle zero, one, or many URLs."""

    def test_multiple_urls_analyzed(self):
        urls = [
            "https://safe.example.com/home",
            "http://192.168.0.1/login",
            "https://a.b.c.d.evil.test:4444/verify?redirect=http://steal.test",
        ]
        results = analyzer.analyze_urls(urls)
        assert len(results) == 3

        # First URL should be clean
        assert results[0].url_risk_score == 0

        # Second URL: HTTP + IP
        assert results[1].is_ip_address is True
        assert results[1].uses_https is False
        assert results[1].url_risk_score >= 30

        # Third URL: subdomains + unusual port + suspicious path + suspicious query
        assert results[2].subdomain_count >= 3
        assert results[2].port == 4444
        assert results[2].url_risk_score > 0


# ─────────────────────────────────────────────────────────────────
# 10. Email containing no URLs
# ─────────────────────────────────────────────────────────────────

class TestNoURLs:
    """When no URLs are present, an empty list should be returned."""

    def test_empty_list(self):
        results = analyzer.analyze_urls([])
        assert results == []
        assert isinstance(results, list)


# ─────────────────────────────────────────────────────────────────
# Additional edge-case tests
# ─────────────────────────────────────────────────────────────────

class TestEdgeCases:
    """Edge cases and composite indicators."""

    def test_userinfo_in_url(self):
        url = "http://admin@evil.test/dashboard"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.url_risk_score >= 25
        assert any("credential" in f.lower() or "userinfo" in f.lower()
                    for f in r.risk_factors)

    def test_misleading_domain(self):
        url = "https://paypal-login.evil.test/signin"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert any("paypal" in f.lower() for f in r.risk_factors)

    def test_legitimate_brand_domain_not_flagged(self):
        url = "https://mail.google.com/inbox"
        results = analyzer.analyze_urls([url])
        r = results[0]
        # google.com is the registered domain — should NOT flag misleading
        assert not any("impersonation" in f.lower() for f in r.risk_factors)

    def test_score_capped_at_100(self):
        # A URL that triggers many indicators
        url = "http://admin@192.168.1.1:31337/%61%62%63%64%65/login/verify?redirect=http://steal.test&password=x&" + "a" * 200
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.url_risk_score <= 100

    def test_path_extraction(self):
        url = "https://example.com/some/deep/path/here"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert r.path == "/some/deep/path/here"

    def test_suspicious_path_keywords(self):
        url = "https://example.com/secure/password/update"
        results = analyzer.analyze_urls([url])
        r = results[0]
        assert any("path" in f.lower() and "suspicious" in f.lower()
                    for f in r.risk_factors)
