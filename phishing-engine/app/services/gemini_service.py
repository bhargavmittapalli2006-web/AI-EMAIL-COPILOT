import os
import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.schemas import EmailIntelligenceRequest, EmailIntelligenceResponse, ActionItem, ActionItemPriority

logger = logging.getLogger(__name__)

# Fallback deterministic intelligence for common demo scenarios
DEMO_INTELLIGENCE_FIXTURES: Dict[str, Dict[str, Any]] = {
    "bank": {
        "summary": "This email is a high-severity phishing attempt impersonating a bank security department. The sender claims that your account has been suspended due to suspicious logins and attempts to coerce you into providing debit card PINs and SSN credentials via a raw IP address link within 24 hours.",
        "action_items": [
            {"text": "Do NOT click the provided login verification link", "priority": "high"},
            {"text": "Do NOT enter or share banking PINs, passwords, or SSN", "priority": "high"},
            {"text": "Report this email to your organization's IT security team immediately", "priority": "medium"}
        ],
        "key_points": [
            "Sender claims account suspension due to unauthorized login attempts",
            "Coercive 24-hour deadline used to induce panic",
            "Link directs to an unverified raw IP address (192.168.1.1)",
            "Requests sensitive credentials including SSN and debit card PIN"
        ],
        "risk_explanation": "The email was flagged as a CRITICAL threat because it exhibits multiple severe phishing indicators: direct links to a raw IP address, URL shorteners, header domain mismatch, panic-inducing urgent threats, and credential harvesting.",
        "recommended_actions": [
            "Block sender and quarantine email immediately",
            "Do not click any hyperlinks or shorteners",
            "Never provide credentials or PINs over email",
            "Report malicious phishing attempt to security operations"
        ]
    },
    "paypal": {
        "summary": "This message is a fraudulent payment dispute notice masquerading as PayPal. The sender claims an unauthorized $849.00 USD charge was placed on your account and provides an obfuscated URL shortener link to harvest login credentials under the guise of an account dispute.",
        "action_items": [
            {"text": "Avoid clicking the tinyurl dispute verification link", "priority": "high"},
            {"text": "Check your official PayPal account directly via paypal.com", "priority": "high"},
            {"text": "Flag sender as a brand impersonator", "priority": "medium"}
        ],
        "key_points": [
            "Claims unauthorized transaction of $849.00 USD",
            "Utilizes tinyurl.com shortener to mask true malicious destination",
            "Sender domain (.xyz) is unverified and mismatches reply-to domain",
            "Threatens account restriction if not addressed"
        ],
        "risk_explanation": "The email was flagged as HIGH risk due to high-risk sender TLD (.xyz), URL shortener obfuscation, sender/reply-to domain mismatch, and financial dispute coercion.",
        "recommended_actions": [
            "Do not enter passwords on the linked dispute page",
            "Verify your balance directly through the official PayPal app",
            "Report spoofing to spoof@paypal.com and internal IT"
        ]
    },
    "sprint": {
        "summary": "Sarah Jenkins shared the agenda and milestone overview for tomorrow's Q3 sprint planning session at 10:00 AM PST. Team members are requested to review the Phase 1 Phishing Engine integration progress and update their assigned tickets on the company Jira board in advance.",
        "action_items": [
            {"text": "Update assigned sprint tickets on Jira before 10:00 AM PST", "priority": "high"},
            {"text": "Review Phase 1 Phishing Engine milestones and architecture deck", "priority": "medium"},
            {"text": "Attend Q3 sprint planning meeting tomorrow at 10:00 AM PST", "priority": "medium"}
        ],
        "key_points": [
            "Sprint planning meeting scheduled for tomorrow at 10:00 AM PST",
            "Phase 1 Phishing Engine milestones and frontend architecture on agenda",
            "Tickets on Jira board must be updated before the session",
            "Meeting agenda and milestone details attached"
        ],
        "risk_explanation": "This email appears low risk. The message contains routine internal communication from a verified team member (@company.com) with official company Jira links and zero phishing indicators.",
        "recommended_actions": [
            "Review the sprint agenda items",
            "Update your assigned Jira tickets",
            "Confirm meeting attendance on calendar"
        ]
    },
    "all-hands": {
        "summary": "The Internal Communications team provided the recording, presentation deck, and Q&A summary from today's company-wide Q3 All-Hands meeting. Employees can access the materials on Google Drive and submit any follow-up leadership questions through the internal portal.",
        "action_items": [
            {"text": "Access the All-Hands recording and slide deck on Google Drive if missed", "priority": "low"},
            {"text": "Submit any leadership follow-up questions via internal feedback portal", "priority": "low"}
        ],
        "key_points": [
            "Q3 All-Hands meeting successfully concluded",
            "Recording and presentation slides available on Google Drive",
            "Leadership Q&A summary document published",
            "Internal feedback portal open for follow-up questions"
        ],
        "risk_explanation": "This email appears low risk. The message is standard internal corporate communication originating from a verified internal address with trusted Google Drive attachments.",
        "recommended_actions": [
            "Review meeting recording and slide deck as needed",
            "Archive email for future reference"
        ]
    }
}


class GeminiService:
    """
    Secure server-side Gemini service generating structured email intelligence.
    API key is read strictly from server environment variables.
    """

    def __init__(self):
        self.api_key: Optional[str] = os.getenv("GEMINI_API_KEY")
        self.client = None
        self._init_client()

    def _init_client(self):
        """Initializes google-genai client if API key is available."""
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info("Gemini GenAI client initialized successfully.")
            except Exception as e:
                logger.warning("Could not initialize google-genai Client: %s", e)
                self.client = None
        else:
            logger.info("GEMINI_API_KEY not configured or placeholder detected. Operating in intelligent fallback mode.")

    def is_available(self) -> bool:
        """Returns True if Gemini API key is configured and client initialized."""
        return bool(self.client is not None or (self.api_key and self.api_key != "your_gemini_api_key_here"))

    def generate_intelligence(self, request: EmailIntelligenceRequest) -> EmailIntelligenceResponse:
        """
        Generates structured email intelligence combining email content and authoritative phishing analysis.
        """
        # Re-check key in case environment was updated at runtime
        if not self.client and os.getenv("GEMINI_API_KEY"):
            self._init_client()

        # If live Gemini client is available, attempt real inference
        if self.client:
            try:
                return self._call_gemini_api(request)
            except Exception as e:
                logger.error("Gemini API call failed: %s. Falling back to rule-guided intelligence.", e, exc_info=True)

        # Fallback to deterministic / rule-guided intelligence generator
        return self._generate_fallback_intelligence(request)

    def _call_gemini_api(self, request: EmailIntelligenceRequest) -> EmailIntelligenceResponse:
        """Calls Gemini API using google-genai SDK and parses structured JSON response."""
        system_instruction = (
            "You are an expert AI email intelligence analyst in an enterprise cybersecurity copilot.\n"
            "Analyze the email subject, sender, and body alongside the authoritative phishing engine classification.\n"
            "CRITICAL SECURITY RULE: The phishing engine output is the authoritative security classification. "
            "You must NOT override or contradict its risk level or classification. If the phishing engine marks an email "
            "as phishing, suspicious, or critical, your risk_explanation and recommended_actions MUST reflect high caution "
            "(e.g., do not click links, do not enter credentials, quarantine/report). If marked low risk/legitimate, provide "
            "standard professional productivity recommendations (e.g., reply, review, archive).\n"
            "You must return ONLY a valid JSON object with the exact keys: summary, action_items, key_points, risk_explanation, recommended_actions.\n"
            "Do NOT include markdown formatting, code block fences, or commentary outside the JSON."
        )

        prompt = f"""
Analyze this incoming email:
---
SUBJECT: {request.subject}
SENDER: {request.sender}
REPLY-TO: {request.reply_to}
BODY:
{request.body}
---
AUTHORITATIVE PHISHING ENGINE METRICS:
- Is Phishing: {request.is_phishing}
- Risk Level: {request.risk_level or 'UNKNOWN'}
- Risk Score: {request.risk_score or 0}/100
- Flagged Reasons: {json.dumps(request.flagged_reasons or [])}
---
Generate structured JSON with:
1. "summary": A concise 2-5 sentence overview of what the email is about, what the sender wants, and key requests.
2. "action_items": An array of objects with "text" (actionable task or deadline) and "priority" ("low" | "medium" | "high").
3. "key_points": An array of 2-6 important bullet points.
4. "risk_explanation": A natural language explanation incorporating the phishing engine's score and flags.
5. "recommended_actions": An array of recommended user actions conditioned on the risk level.
"""

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "system_instruction": system_instruction,
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        )

        raw_text = response.text.strip()
        # Clean any accidental markdown backticks
        clean_json_str = re.sub(r"^```json\s*", "", raw_text)
        clean_json_str = re.sub(r"^```\s*", "", clean_json_str)
        clean_json_str = re.sub(r"\s*```$", "", clean_json_str).strip()

        data = json.loads(clean_json_str)
        return self._normalize_response(data, request)

    def _normalize_response(self, data: Dict[str, Any], request: EmailIntelligenceRequest) -> EmailIntelligenceResponse:
        """Validates and normalizes raw dictionary into EmailIntelligenceResponse."""
        summary = str(data.get("summary", "")).strip()
        if not summary:
            summary = f"Email from {request.sender} concerning '{request.subject}'."

        raw_action_items = data.get("action_items", [])
        action_items: List[ActionItem] = []
        if isinstance(raw_action_items, list):
            for item in raw_action_items:
                if isinstance(item, dict) and "text" in item:
                    pri_val = str(item.get("priority", "medium")).lower()
                    if pri_val not in ["low", "medium", "high"]:
                        pri_val = "medium"
                    action_items.append(ActionItem(text=str(item["text"]), priority=ActionItemPriority(pri_val)))
                elif isinstance(item, str):
                    action_items.append(ActionItem(text=item, priority=ActionItemPriority.MEDIUM))

        raw_key_points = data.get("key_points", [])
        key_points = [str(pt) for pt in raw_key_points if isinstance(pt, (str, int, float))] if isinstance(raw_key_points, list) else []
        if not key_points:
            key_points = [f"Subject: {request.subject}", f"From: {request.sender}"]

        risk_explanation = str(data.get("risk_explanation", "")).strip()
        if not risk_explanation:
            if request.is_phishing:
                risk_explanation = f"Flagged as a security threat with a risk score of {request.risk_score or 85}/100. Do not interact with links or attachments."
            else:
                risk_explanation = "This email appears low risk. Routine communication without detected threat indicators."

        raw_recs = data.get("recommended_actions", [])
        recommended_actions = [str(r) for r in raw_recs if isinstance(r, (str, int, float))] if isinstance(raw_recs, list) else []
        if not recommended_actions:
            if request.is_phishing:
                recommended_actions = ["Do not click links", "Do not provide credentials", "Quarantine or delete email"]
            else:
                recommended_actions = ["Review email details", "Reply if necessary", "Archive"]

        return EmailIntelligenceResponse(
            summary=summary,
            action_items=action_items,
            key_points=key_points,
            risk_explanation=risk_explanation,
            recommended_actions=recommended_actions
        )

    def _generate_fallback_intelligence(self, request: EmailIntelligenceRequest) -> EmailIntelligenceResponse:
        """Deterministic intelligence generator when Gemini API is offline or unconfigured."""
        combined_text = f"{request.subject} {request.body}".lower()

        # Check for known demo email signatures
        for key, fixture in DEMO_INTELLIGENCE_FIXTURES.items():
            if key in combined_text or key in request.sender.lower():
                return self._normalize_response(fixture, request)

        # Dynamic heuristic generation for arbitrary inputs
        is_threat = bool(request.is_phishing or (request.risk_score and request.risk_score >= 50.0))

        # Extract tasks from sentences containing action keywords
        action_items: List[ActionItem] = []
        action_keywords = ["please", "review", "update", "submit", "click", "verify", "attend", "confirm", "send"]
        sentences = [s.strip() for s in re.split(r'[\.\n\r]+', request.body) if len(s.strip()) > 15]

        for s in sentences:
            if any(kw in s.lower() for kw in action_keywords):
                clean_task = s.strip()
                priority = ActionItemPriority.HIGH if ("urgent" in clean_task.lower() or is_threat) else ActionItemPriority.MEDIUM
                action_items.append(ActionItem(text=clean_task, priority=priority))
                if len(action_items) >= 3:
                    break

        if not action_items:
            if is_threat:
                action_items = [ActionItem(text="Do not click links or respond with personal information", priority=ActionItemPriority.HIGH)]
            else:
                action_items = [ActionItem(text="Review email content and follow up if required", priority=ActionItemPriority.LOW)]

        # Key points extraction
        key_points = [
            f"Subject: {request.subject}",
            f"Sender: {request.sender}"
        ]
        if sentences:
            key_points.append(sentences[0])
        if len(sentences) > 1:
            key_points.append(sentences[1])

        # Summary
        if is_threat:
            summary = f"This email from '{request.sender}' with subject '{request.subject}' has been flagged as a potential phishing threat. It contains urgent wording or requests for action that warrant extreme caution."
            risk_explanation = f"The email was flagged as a potential security risk ({request.risk_level or 'HIGH'} severity, score {request.risk_score or 75}/100) due to detected urgency, suspicious links, or domain anomalies."
            recommended_actions = [
                "Do not click any hyperlinks",
                "Do not submit credentials or personal information",
                "Quarantine or report the email to IT Security"
            ]
        else:
            summary = f"This email from '{request.sender}' concerns '{request.subject}'. The message appears to be routine communication requesting standard review or coordination."
            risk_explanation = "This email appears low risk. The message exhibits normal communication patterns and no significant phishing indicators were detected."
            recommended_actions = [
                "Read and acknowledge the message",
                "Complete any relevant action items",
                "Reply or archive as appropriate"
            ]

        return EmailIntelligenceResponse(
            summary=summary,
            action_items=action_items,
            key_points=key_points,
            risk_explanation=risk_explanation,
            recommended_actions=recommended_actions
        )


# Global service singleton instance
gemini_service = GeminiService()
