import re
from typing import List, Optional
from app.models.email_data import EmailData, AttachmentData


class EmailParser:
    """
    Parser for email components that extracts structured data safely.
    
    Adheres to security constraints:
    - Pure static text parsing without network calls.
    - Does NOT visit or access any extracted URLs.
    - Does NOT download or execute any attachment payloads.
    """

    # Matches http:// and https:// URLs in body text
    _URL_REGEX = re.compile(r'https?://[^\s<>"\']+', re.IGNORECASE)
    _TRAILING_PUNCTUATION = '.,;:!?)]}>"\''

    @classmethod
    def extract_urls(cls, text: str) -> List[str]:
        """
        Extracts HTTP and HTTPS URLs from the provided text safely.
        Strips surrounding trailing punctuation from sentence boundaries.
        Returns a list of extracted URLs.
        """
        if not text:
            return []

        raw_matches = cls._URL_REGEX.findall(text)
        urls: List[str] = []

        for raw in raw_matches:
            cleaned = raw.rstrip(cls._TRAILING_PUNCTUATION)
            # Balance unmatched closing parentheses if not part of URL path
            while cleaned.endswith(')') and '(' not in cleaned:
                cleaned = cleaned[:-1].rstrip(cls._TRAILING_PUNCTUATION)
            
            if cleaned:
                urls.append(cleaned)

        return urls

    def parse(
        self,
        sender: str,
        subject: str,
        body: str,
        attachments: Optional[List[AttachmentData]] = None
    ) -> EmailData:
        """
        Parses sender, subject, and body into a structured EmailData instance.
        Preserves original content and safely extracts URLs without network activity.
        """
        sender_clean = sender if sender is not None else ""
        subject_clean = subject if subject is not None else ""
        body_clean = body if body is not None else ""

        extracted_urls = self.extract_urls(body_clean)
        attachment_list = attachments if attachments is not None else []

        return EmailData(
            sender=sender_clean,
            subject=subject_clean,
            body=body_clean,
            urls=extracted_urls,
            attachments=attachment_list,
        )
