import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.features import FeatureExtractor

@pytest.fixture
def extractor():
    return FeatureExtractor()

def test_ip_link_detection(extractor):
    res = extractor.extract_features(
        subject="Alert",
        sender="test@domain.com",
        body="Click here: http://192.168.1.1/login",
        links=["http://192.168.1.1/login"]
    )
    assert res["features"]["has_ip_url"] == 1
    assert any("raw IP" in r for r in res["flagged_reasons"])

def test_url_shortener_detection(extractor):
    res = extractor.extract_features(
        subject="Check this link",
        sender="friend@domain.com",
        body="Go to http://bit.ly/secret",
        links=["http://bit.ly/secret"]
    )
    assert res["features"]["has_shortener"] == 1
    assert any("URL shorteners" in r for r in res["flagged_reasons"])

def test_sender_replyto_mismatch(extractor):
    res = extractor.extract_features(
        subject="Meeting",
        sender="boss@company.com",
        reply_to="attacker@attacker.com",
        body="Let's talk soon."
    )
    assert res["features"]["sender_replyto_mismatch"] == 1
    assert any("does not match Reply-To domain" in r for r in res["flagged_reasons"])

def test_clean_legitimate_email(extractor):
    res = extractor.extract_features(
        subject="Project Update Agenda",
        sender="colleague@company.com",
        reply_to="colleague@company.com",
        body="Hi team, here is the agenda for tomorrow's meeting."
    )
    assert res["features"]["has_ip_url"] == 0
    assert res["features"]["has_shortener"] == 0
    assert res["features"]["sender_replyto_mismatch"] == 0
    assert len(res["flagged_reasons"]) == 0
