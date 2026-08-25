import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status

from app.database import get_db_connection

# Seed fixture data for newly registered users
SEED_EMAILS = [
  {
    "id": "msg-101",
    "senderName": "Bank Security Department",
    "senderEmail": "security-alert@bank-verification-secure.com",
    "recipient": "user@enterprise.com",
    "replyTo": "hacker88@gmail.com",
    "subject": "URGENT: Your Bank Account Has Been Suspended!",
    "preview": "Dear customer, your bank account has been suspended due to suspicious activity. Click here immediately to verify...",
    "body": "Dear Valued Customer,\n\nYour bank account has been temporarily SUSPENDED due to multiple unauthorized login attempts detected from an unrecognized IP location.\n\nImmediate action is REQUIRED to restore your online access and protect your funds. Failure to re-verify your identity within 24 hours will result in permanent account closure and legal review.\n\nPlease click the secure link below to verify your identity, SSN, and debit card PIN immediately:\nhttp://192.168.1.1/login.php\n\nThank you for your prompt cooperation,\nOnline Fraud Prevention Division",
    "links": ["http://192.168.1.1/login.php"],
    "timestamp": "10:42 AM",
    "date": "Aug 24, 2026",
    "isUnread": True,
    "isStarred": True,
    "isImportant": True,
    "folder": "inbox",
    "category": "finance",
    "hasAttachment": False,
    "avatarColor": "bg-rose-600"
  },
  {
    "id": "msg-102",
    "senderName": "PayPal Account Team",
    "senderEmail": "service-update@paypal-account-notice.xyz",
    "recipient": "user@enterprise.com",
    "replyTo": "collector-inbox@yahoo.com",
    "subject": "Action Required: PayPal Security Verification Notice",
    "preview": "We noticed unusual billing activity on your PayPal account. Re-enter your billing credentials to unlock...",
    "body": "Hello Customer,\n\nWe detected an unusual charge of $849.00 USD on your PayPal balance. If you did not authorize this payment, please review and dispute the transaction immediately.\n\nVisit our secure verification center to confirm your account ownership:\nhttp://tinyurl.com/paypal-dispute-id982\n\nIf you do not dispute within 12 hours, the funds will be permanently transferred.\n\nSincerely,\nPayPal Security & Account Review",
    "links": ["http://tinyurl.com/paypal-dispute-id982"],
    "timestamp": "09:15 AM",
    "date": "Aug 24, 2026",
    "isUnread": True,
    "isStarred": False,
    "isImportant": True,
    "folder": "inbox",
    "category": "finance",
    "hasAttachment": True,
    "avatarColor": "bg-amber-600"
  },
  {
    "id": "msg-103",
    "senderName": "Sarah Jenkins",
    "senderEmail": "sarah.jenkins@company.com",
    "recipient": "engineering-team@company.com",
    "replyTo": "sarah.jenkins@company.com",
    "subject": "Sprint Planning Meeting Agenda & Q3 Milestones",
    "preview": "Hi team, please find attached the agenda for our Q3 planning meeting tomorrow at 10 AM. Review the Jira board before the session...",
    "body": "Hi Engineering Team,\n\nPlease find attached the agenda for our Q3 planning session tomorrow, Tuesday at 10:00 AM PST.\n\nKey Agenda Topics:\n1. Review Sprint 14 velocity and retrospective outcomes.\n2. Discuss core deliverables for the new email copilot security dashboard.\n3. Review team capacity and assign milestone leads.\n\nPlease take 10 minutes before the meeting to review your assigned tickets on the Jira board:\nhttps://company.atlassian.net/jira/software-projects/ENG/boards/12\n\nBest regards,\nSarah Jenkins\nLead Technical Product Manager",
    "links": ["https://company.atlassian.net/jira/software-projects/ENG/boards/12"],
    "timestamp": "08:30 AM",
    "date": "Aug 24, 2026",
    "isUnread": False,
    "isStarred": True,
    "isImportant": False,
    "folder": "inbox",
    "category": "work",
    "hasAttachment": True,
    "avatarColor": "bg-indigo-600"
  }
]


def seed_mock_emails_if_empty(user_id: int):
    """Populates seed fixture emails for a user if their database inbox is empty."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM emails WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if row and row["count"] > 0:
            return

        now = datetime.now(timezone.utc).isoformat()
        for e in SEED_EMAILS:
            seed_id = f"u{user_id}-{e['id']}"
            cursor.execute(
                """
                INSERT INTO emails (
                    id, user_id, sender_name, sender_email, recipient, reply_to, subject, preview, body,
                    links_json, folder, category, is_unread, is_starred, is_important, has_attachment, avatar_color,
                    timestamp, date, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    seed_id, user_id, e["senderName"], e["senderEmail"], e["recipient"], e["replyTo"],
                    e["subject"], e["preview"], e["body"], json.dumps(e.get("links", [])),
                    e["folder"], e["category"], 1 if e["isUnread"] else 0, 1 if e["isStarred"] else 0,
                    1 if e["isImportant"] else 0, 1 if e["hasAttachment"] else 0, e["avatarColor"],
                    e["timestamp"], e["date"], now, now
                )
            )
        conn.commit()



def get_user_emails(user_id: int, folder: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves all emails for user_id, ensuring strict user isolation."""
    with get_db_connection() as conn:

        cursor = conn.cursor()
        if folder:
            cursor.execute("SELECT * FROM emails WHERE user_id = ? AND folder = ? ORDER BY created_at DESC", (user_id, folder))
        else:
            cursor.execute("SELECT * FROM emails WHERE user_id = ? ORDER BY created_at DESC", (user_id,))

        rows = cursor.fetchall()
        result = []
        for r in rows:
            result.append({
                "id": r["id"],
                "senderName": r["sender_name"],
                "senderEmail": r["sender_email"],
                "recipient": r["recipient"],
                "replyTo": r["reply_to"],
                "subject": r["subject"],
                "preview": r["preview"],
                "body": r["body"],
                "links": json.loads(r["links_json"] or "[]"),
                "folder": r["folder"],
                "category": r["category"],
                "isUnread": bool(r["is_unread"]),
                "isStarred": bool(r["is_starred"]),
                "isImportant": bool(r["is_important"]),
                "hasAttachment": bool(r["has_attachment"]),
                "avatarColor": r["avatar_color"],
                "timestamp": r["timestamp"],
                "date": r["date"],
            })
        return result


def get_email_by_id(user_id: int, email_id: str) -> Dict[str, Any]:
    """Retrieves a single email belonging strictly to user_id."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM emails WHERE id = ? AND user_id = ?", (email_id, user_id))
        r = cursor.fetchone()
        if not r:
            raise HTTPException(status_code=404, detail="Email not found or access unauthorized.")

        return {
            "id": r["id"],
            "senderName": r["sender_name"],
            "senderEmail": r["sender_email"],
            "recipient": r["recipient"],
            "replyTo": r["reply_to"],
            "subject": r["subject"],
            "preview": r["preview"],
            "body": r["body"],
            "links": json.loads(r["links_json"] or "[]"),
            "folder": r["folder"],
            "category": r["category"],
            "isUnread": bool(r["is_unread"]),
            "isStarred": bool(r["is_starred"]),
            "isImportant": bool(r["is_important"]),
            "hasAttachment": bool(r["has_attachment"]),
            "avatarColor": r["avatar_color"],
            "timestamp": r["timestamp"],
            "date": r["date"],
        }


def create_email(user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
    """Persists a new email for user_id."""
    email_id = data.get("id") or f"msg-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
    now = datetime.now(timezone.utc).isoformat()

    sender_input = data.get("sender") or data.get("senderEmail") or "unknown@domain.com"
    sender_name = data.get("senderName") or (sender_input.split("@")[0] if "@" in sender_input else sender_input)
    sender_email = data.get("senderEmail") or sender_input
    recipient = data.get("recipient") or "user@enterprise.com"
    reply_to = data.get("replyTo") or data.get("reply_to") or sender_email
    subject = data.get("subject") or "(No Subject)"
    body = data.get("body") or ""
    preview = data.get("preview") or (body[:90] + "..." if len(body) > 90 else body)
    links = data.get("links") or []
    folder = data.get("folder") or "inbox"
    category = data.get("category") or "work"
    is_unread = 1 if data.get("isUnread", True) else 0
    is_starred = 1 if data.get("isStarred", False) else 0
    is_important = 1 if data.get("isImportant", False) else 0
    has_attachment = 1 if data.get("hasAttachment", False) else 0
    avatar_color = data.get("avatarColor") or "bg-indigo-600"
    timestamp = data.get("timestamp") or "Just Now"
    date_str = data.get("date") or datetime.now(timezone.utc).strftime("%b %d, %Y")


    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO emails (
                id, user_id, sender_name, sender_email, recipient, reply_to, subject, preview, body,
                links_json, folder, category, is_unread, is_starred, is_important, has_attachment, avatar_color,
                timestamp, date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                email_id, user_id, sender_name, sender_email, recipient, reply_to, subject, preview, body,
                json.dumps(links), folder, category, is_unread, is_starred, is_important, has_attachment,
                avatar_color, timestamp, date_str, now, now
            )
        )
        conn.commit()

    return get_email_by_id(user_id, email_id)


def update_email(user_id: int, email_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Updates folder, isUnread, isStarred, or isImportant for an email owned by user_id."""
    existing = get_email_by_id(user_id, email_id)
    now = datetime.now(timezone.utc).isoformat()

    folder = updates.get("folder", existing["folder"])
    is_unread = 1 if updates.get("isUnread", existing["isUnread"]) else 0
    is_starred = 1 if updates.get("isStarred", existing["isStarred"]) else 0
    is_important = 1 if updates.get("isImportant", existing["isImportant"]) else 0

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE emails
            SET folder = ?, is_unread = ?, is_starred = ?, is_important = ?, updated_at = ?
            WHERE id = ? AND user_id = ?
            """,
            (folder, is_unread, is_starred, is_important, now, email_id, user_id)
        )
        conn.commit()

    return get_email_by_id(user_id, email_id)


def delete_email(user_id: int, email_id: str) -> bool:
    """Deletes an email owned by user_id."""
    get_email_by_id(user_id, email_id)
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM emails WHERE id = ? AND user_id = ?", (email_id, user_id))
        conn.commit()
    return True


# ─────────────────────────────────────────────────────────────────────────────
# ML Security Scans, Intelligence & Reply Audit Persistence
# ─────────────────────────────────────────────────────────────────────────────

def save_security_scan(user_id: int, email_id: str, scan_data: Dict[str, Any]) -> int:
    """Persists a security scan record strictly linked to user_id and email_id."""
    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO security_scans (
                email_id, user_id, is_phishing, classification, risk_score, risk_level,
                confidence, flagged_reasons_json, feature_metrics_json, scanned_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                email_id,
                user_id,
                1 if scan_data.get("is_phishing") else 0,
                scan_data.get("classification", "UNKNOWN"),
                float(scan_data.get("risk_score", 0.0)),
                scan_data.get("risk_level", "LOW"),
                float(scan_data.get("confidence", 0.0)),
                json.dumps(scan_data.get("flagged_reasons", [])),
                json.dumps(scan_data.get("features", {})),
                now
            )
        )
        conn.commit()
        return cursor.lastrowid


def get_security_scans(user_id: int, email_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves security scans for user_id, ensuring strict user isolation."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if email_id:
            cursor.execute(
                "SELECT * FROM security_scans WHERE user_id = ? AND email_id = ? ORDER BY id DESC",
                (user_id, email_id)
            )
        else:
            cursor.execute(
                "SELECT * FROM security_scans WHERE user_id = ? ORDER BY id DESC",
                (user_id,)
            )
        rows = cursor.fetchall()
        return [
            {
                "id": r["id"],
                "email_id": r["email_id"],
                "user_id": r["user_id"],
                "is_phishing": bool(r["is_phishing"]),
                "classification": r["classification"],
                "risk_score": r["risk_score"],
                "risk_level": r["risk_level"],
                "confidence": r["confidence"],
                "flagged_reasons": json.loads(r["flagged_reasons_json"] or "[]"),
                "feature_metrics": json.loads(r["feature_metrics_json"] or "{}"),
                "scanned_at": r["scanned_at"],
            }
            for r in rows
        ]


def save_intelligence_result(user_id: int, email_id: str, intel_data: Dict[str, Any]) -> int:
    """Persists an email intelligence result strictly linked to user_id and email_id."""
    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO intelligence_results (
                email_id, user_id, summary, action_items_json, key_points_json,
                risk_explanation, recommended_actions_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                email_id,
                user_id,
                intel_data.get("summary", ""),
                json.dumps(intel_data.get("action_items", [])),
                json.dumps(intel_data.get("key_points", [])),
                intel_data.get("risk_explanation", ""),
                json.dumps(intel_data.get("recommended_actions", [])),
                now
            )
        )
        conn.commit()
        return cursor.lastrowid


def get_intelligence_results(user_id: int, email_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves intelligence results for user_id with strict user isolation."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if email_id:
            cursor.execute(
                "SELECT * FROM intelligence_results WHERE user_id = ? AND email_id = ? ORDER BY id DESC",
                (user_id, email_id)
            )
        else:
            cursor.execute(
                "SELECT * FROM intelligence_results WHERE user_id = ? ORDER BY id DESC",
                (user_id,)
            )
        rows = cursor.fetchall()
        return [
            {
                "id": r["id"],
                "email_id": r["email_id"],
                "user_id": r["user_id"],
                "summary": r["summary"],
                "action_items": json.loads(r["action_items_json"] or "[]"),
                "key_points": json.loads(r["key_points_json"] or "[]"),
                "risk_explanation": r["risk_explanation"],
                "recommended_actions": json.loads(r["recommended_actions_json"] or "[]"),
                "created_at": r["created_at"],
            }
            for r in rows
        ]


def save_reply_suggestion(user_id: int, email_id: str, reply_data: Dict[str, Any]) -> int:
    """Persists a reply suggestion record strictly linked to user_id and email_id."""
    now = datetime.now(timezone.utc).isoformat()
    drafts = reply_data.get("reply_drafts") or {}
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO reply_suggestions (
                email_id, user_id, reply_allowed, reason, professional_reply,
                friendly_reply, concise_reply, source, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                email_id,
                user_id,
                1 if reply_data.get("reply_allowed") else 0,
                reply_data.get("reason", ""),
                drafts.get("professional"),
                drafts.get("friendly"),
                drafts.get("concise"),
                reply_data.get("source", "gemini"),
                now
            )
        )
        conn.commit()
        return cursor.lastrowid


def get_reply_suggestions(user_id: int, email_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves reply suggestions for user_id with strict user isolation."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if email_id:
            cursor.execute(
                "SELECT * FROM reply_suggestions WHERE user_id = ? AND email_id = ? ORDER BY id DESC",
                (user_id, email_id)
            )
        else:
            cursor.execute(
                "SELECT * FROM reply_suggestions WHERE user_id = ? ORDER BY id DESC",
                (user_id,)
            )
        rows = cursor.fetchall()
        return [
            {
                "id": r["id"],
                "email_id": r["email_id"],
                "user_id": r["user_id"],
                "reply_allowed": bool(r["reply_allowed"]),
                "reason": r["reason"],
                "professional_reply": r["professional_reply"],
                "friendly_reply": r["friendly_reply"],
                "concise_reply": r["concise_reply"],
                "source": r["source"],
                "created_at": r["created_at"],
            }
            for r in rows
        ]


# ─────────────────────────────────────────────────────────────────────────────
# Reminder Persistence Operations (Phase 20)
# ─────────────────────────────────────────────────────────────────────────────

def create_reminder(user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
    """Creates a user-scoped reminder with database persistence."""
    import uuid
    reminder_id = f"rem-{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO reminders (
                id, user_id, email_id, action_item_id, title, description,
                due_at, priority, completed, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                reminder_id,
                user_id,
                data.get("email_id"),
                data.get("action_item_id"),
                data.get("title", "Follow-up Reminder"),
                data.get("description", ""),
                data.get("due_at"),
                data.get("priority", "medium"),
                1 if data.get("completed") else 0,
                now,
                now
            )
        )
        conn.commit()
    
    return get_reminder_by_id(user_id, reminder_id)


def get_reminders(user_id: int, email_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves all reminders for user_id, optionally filtered by email_id."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if email_id:
            cursor.execute(
                "SELECT * FROM reminders WHERE user_id = ? AND email_id = ? ORDER BY created_at DESC",
                (user_id, email_id)
            )
        else:
            cursor.execute(
                "SELECT * FROM reminders WHERE user_id = ? ORDER BY created_at DESC",
                (user_id,)
            )
        rows = cursor.fetchall()
        return [
            {
                "id": r["id"],
                "user_id": r["user_id"],
                "email_id": r["email_id"],
                "action_item_id": r["action_item_id"],
                "title": r["title"],
                "description": r["description"] or "",
                "due_at": r["due_at"],
                "priority": r["priority"] or "medium",
                "completed": bool(r["completed"]),
                "created_at": r["created_at"],
                "updated_at": r["updated_at"],
            }
            for r in rows
        ]


def get_reminder_by_id(user_id: int, reminder_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single reminder strictly scoped to user_id."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM reminders WHERE id = ? AND user_id = ?",
            (reminder_id, user_id)
        )
        r = cursor.fetchone()
        if not r:
            return None
        return {
            "id": r["id"],
            "user_id": r["user_id"],
            "email_id": r["email_id"],
            "action_item_id": r["action_item_id"],
            "title": r["title"],
            "description": r["description"] or "",
            "due_at": r["due_at"],
            "priority": r["priority"] or "medium",
            "completed": bool(r["completed"]),
            "created_at": r["created_at"],
            "updated_at": r["updated_at"],
        }


def update_reminder(user_id: int, reminder_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Updates a reminder strictly scoped to user_id."""
    existing = get_reminder_by_id(user_id, reminder_id)
    if not existing:
        return None

    fields = []
    values = []
    
    if "title" in updates and updates["title"] is not None:
        fields.append("title = ?")
        values.append(updates["title"])
    if "description" in updates and updates["description"] is not None:
        fields.append("description = ?")
        values.append(updates["description"])
    if "due_at" in updates:
        fields.append("due_at = ?")
        values.append(updates["due_at"])
    if "priority" in updates and updates["priority"] is not None:
        fields.append("priority = ?")
        values.append(updates["priority"])
    if "completed" in updates and updates["completed"] is not None:
        fields.append("completed = ?")
        values.append(1 if updates["completed"] else 0)

    if not fields:
        return existing

    fields.append("updated_at = ?")
    values.append(datetime.now(timezone.utc).isoformat())

    values.extend([reminder_id, user_id])

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            f"UPDATE reminders SET {', '.join(fields)} WHERE id = ? AND user_id = ?",
            values
        )
        conn.commit()

    return get_reminder_by_id(user_id, reminder_id)


def delete_reminder(user_id: int, reminder_id: str) -> bool:
    """Deletes a reminder strictly scoped to user_id."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM reminders WHERE id = ? AND user_id = ?",
            (reminder_id, user_id)
        )
        conn.commit()
        return cursor.rowcount > 0


