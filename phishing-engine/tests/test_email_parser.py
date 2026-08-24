import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.email_parser import EmailParser
from app.models.email_data import EmailData, AttachmentData


@pytest.fixture
def parser():
    return EmailParser()


# 1. Email with no URL
def test_email_with_no_url(parser):
    sender = "colleague@company.com"
    subject = "Meeting Notes"
    body = "Hi team, attached are the notes from our sync. Let me know if you have questions."
    
    result = parser.parse(sender=sender, subject=subject, body=body)
    
    assert isinstance(result, EmailData)
    assert result.sender == sender
    assert result.subject == subject
    assert result.body == body
    assert result.urls == []
    assert result.attachments == []


# 2. Email with one URL
def test_email_with_one_url(parser):
    sender = "security@example.com"
    subject = "Verify your account"
    body = "Please visit https://example.com/verify to continue."
    
    result = parser.parse(sender=sender, subject=subject, body=body)
    
    assert result.sender == sender
    assert result.subject == subject
    assert result.body == body
    assert result.urls == ["https://example.com/verify"]
    assert result.attachments == []


# 3. Email with multiple URLs
def test_email_with_multiple_urls(parser):
    sender = "newsletter@updates.io"
    subject = "Weekly Digest"
    body = (
        "Check out our latest post at https://blog.updates.io/article1 "
        "and read our docs at http://docs.updates.io/guide. "
        "Also visit https://community.updates.io/t/123."
    )
    
    result = parser.parse(sender=sender, subject=subject, body=body)
    
    assert len(result.urls) == 3
    assert result.urls == [
        "https://blog.updates.io/article1",
        "http://docs.updates.io/guide",
        "https://community.updates.io/t/123"
    ]


# 4. HTTP URL
def test_email_with_http_url(parser):
    sender = "admin@legacy-portal.org"
    subject = "Legacy System Link"
    body = "Access the old portal at http://legacy.portal.org/login?ref=internal."
    
    result = parser.parse(sender=sender, subject=subject, body=body)
    
    assert result.urls == ["http://legacy.portal.org/login?ref=internal"]


# 5. HTTPS URL
def test_email_with_https_url(parser):
    sender = "alerts@bank-secure.com"
    subject = "Security Notification"
    body = "Sign in securely at https://bank-secure.com/auth/portal#dashboard."
    
    result = parser.parse(sender=sender, subject=subject, body=body)
    
    assert result.urls == ["https://bank-secure.com/auth/portal#dashboard"]


# 6. Empty body
def test_email_with_empty_body(parser):
    sender = "silent@domain.com"
    subject = "No content"
    body = ""
    
    result = parser.parse(sender=sender, subject=subject, body=body)
    
    assert result.sender == sender
    assert result.subject == subject
    assert result.body == ""
    assert result.urls == []
    assert result.attachments == []


# Extra test: Attachment data structures preserved
def test_email_with_attachments_structure(parser):
    sender = "finance@company.com"
    subject = "Invoice Q3"
    body = "Please find the invoice attached."
    attachments = [
        AttachmentData(filename="invoice.pdf", content_type="application/pdf", size_bytes=102400)
    ]
    
    result = parser.parse(sender=sender, subject=subject, body=body, attachments=attachments)
    
    assert len(result.attachments) == 1
    assert result.attachments[0].filename == "invoice.pdf"
    assert result.attachments[0].content_type == "application/pdf"
    assert result.attachments[0].size_bytes == 102400
