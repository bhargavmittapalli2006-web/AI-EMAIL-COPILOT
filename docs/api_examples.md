# Phishing Engine API Reference & Integration Guide

This guide provides complete instructions, cURL commands, Python snippets, and a ready-to-import Postman Collection for the **Security & Phishing Engine Service**.

---

## 1. Quick Start Commands

### 1.1 Start the FastAPI Service
Run the service using Uvicorn with auto-reload:
```bash
# Navigate to phishing-engine directory
cd phishing-engine

# Start server on http://localhost:8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 1.2 Interactive API Documentation (Swagger & ReDoc)
Once the server is running, visit:
- **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON Spec**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

### 1.3 Run Automated Test Suite
```bash
# From workspace root
python -m pytest phishing-engine/tests -v
```

---

## 2. API Endpoints

### 2.1 Health & Readiness Check
**`GET /health`**

Verifies system operational status, model readiness, active model artifact location, and API version.

#### cURL Request:
```bash
curl -X GET "http://localhost:8000/health" \
     -H "Accept: application/json"
```

#### Example Response (`200 OK`):
```json
{
  "status": "healthy",
  "service": "phishing-engine",
  "model_loaded": true,
  "model_path": "C:\\Users\\ManivarshithB\\Desktop\\AI-EMAIL-COPILOT\\AI-EMAIL-COPILOT\\saved_models\\phishing_pipeline.joblib",
  "version": "1.0.0"
}
```

---

### 2.2 Phishing Threat Analysis
**`POST /api/v1/analyze`**

Performs ML inference combined with heuristic rule evaluation on the provided email payload.

---

#### Example 1: Critical Phishing Attack (Credential & IP Scam)

##### cURL Request:
```bash
curl -X POST "http://localhost:8000/api/v1/analyze" \
     -H "Content-Type: application/json" \
     -d '{
       "subject": "URGENT: Verify your bank account immediately to prevent suspension!",
       "sender": "security-alert@bank-verification-update.xyz",
       "reply_to": "attacker-collector@gmail.com",
       "body": "Dear Customer, suspicious activity was detected on your account. Immediate action required. Re-enter your banking credentials and password now: http://192.168.1.1/login or your account will be locked.",
       "links": ["http://192.168.1.1/login", "http://bit.ly/bank-security"]
     }'
```

##### Example Response (`200 OK`):
```json
{
  "is_phishing": true,
  "classification": "phishing",
  "risk_score": 93.8,
  "risk_level": "CRITICAL",
  "confidence": 0.942,
  "flagged_reasons": [
    "Email contains links pointing directly to raw IP addresses instead of verified domain names.",
    "Email contains URL shorteners (e.g. bit.ly, tinyurl) commonly used to conceal malicious destinations.",
    "Email links contain high-risk top-level domains frequently associated with phishing campaigns.",
    "Sender domain ('bank-verification-update.xyz') does not match Reply-To domain ('gmail.com'), indicating potential header spoofing.",
    "Email claims an official institution or executive identity but originates from an unverified, generic, or high-risk domain.",
    "Email utilizes high-urgency psychological triggers or threats of negative consequences to force immediate user action.",
    "Email requests sensitive personal, banking, or account credential information.",
    "Email solicits immediate account re-verification, credential updates, or identity confirmation.",
    "Sender address uses a high-risk TLD commonly linked to disposable phishing infrastructure ('bank-verification-update.xyz')."
  ],
  "features": {
    "url_count": 2,
    "has_ip_url": 1,
    "has_shortener": 1,
    "suspicious_tld_count": 1,
    "urgent_word_count": 3,
    "sensitive_word_count": 2,
    "uppercase_ratio": 0.082,
    "exclamation_mark_count": 1,
    "currency_symbol_count": 0,
    "sender_replyto_mismatch": 1,
    "has_suspicious_sender_tld": 1,
    "has_freemail_sender": 0,
    "suspicious_brand_impersonation": 1
  }
}
```

---

#### Example 2: Legitimate Business Communication

##### cURL Request:
```bash
curl -X POST "http://localhost:8000/api/v1/analyze" \
     -H "Content-Type: application/json" \
     -d '{
       "subject": "Sprint Retrospective Notes & Action Items",
       "sender": "sarah.jenkins@company.com",
       "reply_to": "sarah.jenkins@company.com",
       "body": "Hi team, thank you for participating in today'\''s sprint retrospective. Please review the updated Jira board for assigned tasks.",
       "links": ["https://company.atlassian.net/jira/software-projects/ENG/boards/12"]
     }'
```

##### Example Response (`200 OK`):
```json
{
  "is_phishing": false,
  "classification": "legitimate",
  "risk_score": 12.4,
  "risk_level": "LOW",
  "confidence": 0.725,
  "flagged_reasons": [],
  "features": {
    "url_count": 1,
    "has_ip_url": 0,
    "has_shortener": 0,
    "suspicious_tld_count": 0,
    "urgent_word_count": 0,
    "sensitive_word_count": 0,
    "uppercase_ratio": 0.062,
    "exclamation_mark_count": 0,
    "currency_symbol_count": 0,
    "sender_replyto_mismatch": 0,
    "has_suspicious_sender_tld": 0,
    "has_freemail_sender": 0,
    "suspicious_brand_impersonation": 0
  }
}
```

---

### 2.3 AI Reply Suggestions (with Security Gate)
**`POST /api/v1/reply-suggestions`**

Generates three optional, human-reviewed reply drafts (`Professional`, `Friendly`, `Concise`) for verified safe emails.
Automatically blocks generation and returns a security warning if the email is classified as phishing or has HIGH/CRITICAL threat risk.

#### Example 1: Safe Email (Replies Generated)

##### cURL Request:
```bash
curl -X POST "http://localhost:8000/api/v1/reply-suggestions" \
     -H "Content-Type: application/json" \
     -d '{
       "subject": "Sprint Planning Tomorrow",
       "sender": "sarah.jenkins@company.com",
       "body": "Hi team, please review the sprint agenda before tomorrow'\''s 10 AM meeting.",
       "is_phishing": false,
       "risk_score": 8.0,
       "risk_level": "LOW"
     }'
```

##### Example Response (`200 OK`):
```json
{
  "reply_allowed": true,
  "reason": null,
  "professional_reply": "Thank you for sharing the agenda. I will review it before tomorrow's meeting.",
  "friendly_reply": "Thanks for sending this over! I'll review the agenda before tomorrow.",
  "concise_reply": "Thanks, I'll review it before the meeting.",
  "source": "gemini"
}
```

---

#### Example 2: Phishing Email (Security Blocked)

##### cURL Request:
```bash
curl -X POST "http://localhost:8000/api/v1/reply-suggestions" \
     -H "Content-Type: application/json" \
     -d '{
       "subject": "URGENT: Bank Account Suspended",
       "sender": "security@fake-bank.xyz",
       "body": "Your bank account has been locked. Verify PIN here: http://192.168.1.1/login",
       "is_phishing": true,
       "risk_score": 95.0,
       "risk_level": "CRITICAL"
     }'
```

##### Example Response (`200 OK`):
```json
{
  "reply_allowed": false,
  "reason": "Reply generation disabled because this email may be malicious.",
  "professional_reply": null,
  "friendly_reply": null,
  "concise_reply": null,
  "source": "blocked"
}
```


```python
import httpx

BASE_URL = "http://localhost:8000"

def analyze_email_threat(subject: str, sender: str, body: str, reply_to: str = "", links: list = None):
    payload = {
        "subject": subject,
        "sender": sender,
        "body": body,
        "reply_to": reply_to,
        "links": links or []
    }
    
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # Check health
        health = client.get("/health").json()
        print(f"Service status: {health['status']} (Model ready: {health['model_loaded']})")
        
        # Run analysis
        response = client.post("/api/v1/analyze", json=payload)
        response.raise_for_status()
        return response.json()

if __name__ == "__main__":
    result = analyze_email_threat(
        subject="Action Required: Verify Account Access",
        sender="service-security@bank-alert.xyz",
        reply_to="attacker@gmail.com",
        body="Dear User, update your login password now at http://192.168.1.1/reset to avoid lockout.",
        links=["http://192.168.1.1/reset"]
    )
    print("Risk Level:", result["risk_level"])
    print("Risk Score:", result["risk_score"])
    print("Threat Flags:", result["flagged_reasons"])
```

---

## 4. Postman Collection JSON (v2.1)

Save the block below as `phishing_engine_postman_collection.json` and import directly into Postman:

```json
{
  "info": {
    "name": "AI Email Copilot - Phishing Engine API",
    "_postman_id": "8f39b1a0-5c62-4f1e-9273-df2c6c0e81c1",
    "description": "Production API Collection for the Security & Phishing Engine Service",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [
          { "key": "Accept", "value": "application/json" }
        ],
        "url": {
          "raw": "{{base_url}}/health",
          "host": ["{{base_url}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Analyze Email - Phishing Attack",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Accept", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"subject\": \"URGENT: Verify your bank account immediately!\",\n  \"sender\": \"security-alert@bank-verification-update.xyz\",\n  \"reply_to\": \"attacker-collector@gmail.com\",\n  \"body\": \"Dear Customer, suspicious activity detected. Immediate action required. Re-enter your banking credentials now: http://192.168.1.1/login or your account will be locked.\",\n  \"links\": [\n    \"http://192.168.1.1/login\",\n    \"http://bit.ly/bank-security\"\n  ]\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/v1/analyze",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "analyze"]
        }
      }
    },
    {
      "name": "Analyze Email - Legitimate Email",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Accept", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"subject\": \"Sprint Retrospective Notes & Action Items\",\n  \"sender\": \"sarah.jenkins@company.com\",\n  \"reply_to\": \"sarah.jenkins@company.com\",\n  \"body\": \"Hi team, thank you for participating in today's sprint retrospective. Please review the updated Jira board for assigned tasks.\",\n  \"links\": [\n    \"https://company.atlassian.net/jira/software-projects/ENG/boards/12\"\n  ]\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/v1/analyze",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "analyze"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000",
      "type": "string"
    }
  ]
}
```
