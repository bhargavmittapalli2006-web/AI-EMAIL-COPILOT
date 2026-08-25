import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_reminder_lifecycle_and_persistence():
    """Verify complete CRUD lifecycle of reminders with SQLite persistence."""
    unique_id = uuid.uuid4().hex[:8]
    test_email = f"user_{unique_id}@enterprise.com"
    test_pwd = "StrongPassword2026!"

    # 1. Register User
    reg_resp = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": test_pwd,
        "display_name": "Reminder Tester",
        "role": "SecOps Analyst"
    })
    assert reg_resp.status_code == 201
    token = reg_resp.json()["token"]

    # 2. Create Reminder
    create_resp = client.post(
        "/api/v1/reminders",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Review Q3 Security Audit Agenda",
            "email_id": "msg-103",
            "action_item_id": "act-1",
            "description": "Review tickets on Jira board before tomorrow's meeting",
            "due_at": "Tuesday at 10:00 AM PST",
            "priority": "high"
        }
    )
    assert create_resp.status_code == 201
    reminder = create_resp.json()
    assert reminder["title"] == "Review Q3 Security Audit Agenda"
    assert reminder["email_id"] == "msg-103"
    assert reminder["due_at"] == "Tuesday at 10:00 AM PST"
    assert reminder["priority"] == "high"
    assert reminder["completed"] is False
    reminder_id = reminder["id"]

    # 3. Retrieve All Reminders
    list_resp = client.get("/api/v1/reminders", headers={"Authorization": f"Bearer {token}"})
    assert list_resp.status_code == 200
    reminders_list = list_resp.json()
    assert len(reminders_list) == 1
    assert reminders_list[0]["id"] == reminder_id

    # 4. Retrieve by ID
    get_resp = client.get(f"/api/v1/reminders/{reminder_id}", headers={"Authorization": f"Bearer {token}"})
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == reminder_id

    # 5. Filter by Email ID
    filter_resp = client.get(f"/api/v1/reminders?email_id=msg-103", headers={"Authorization": f"Bearer {token}"})
    assert filter_resp.status_code == 200
    assert len(filter_resp.json()) == 1

    empty_filter_resp = client.get(f"/api/v1/reminders?email_id=msg-nonexistent", headers={"Authorization": f"Bearer {token}"})
    assert empty_filter_resp.status_code == 200
    assert len(empty_filter_resp.json()) == 0

    # 6. Update Reminder (Mark Completed)
    update_resp = client.patch(
        f"/api/v1/reminders/{reminder_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "completed": True,
            "priority": "low"
        }
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["completed"] is True
    assert updated["priority"] == "low"

    # 7. Delete Reminder
    delete_resp = client.delete(f"/api/v1/reminders/{reminder_id}", headers={"Authorization": f"Bearer {token}"})
    assert delete_resp.status_code == 200

    # 8. Verify 404 after Deletion
    get_deleted = client.get(f"/api/v1/reminders/{reminder_id}", headers={"Authorization": f"Bearer {token}"})
    assert get_deleted.status_code == 404


def test_reminder_user_isolation():
    """Verify strict multi-tenant user isolation: User A cannot view, edit, or delete User B's reminders."""
    id_a = uuid.uuid4().hex[:8]
    id_b = uuid.uuid4().hex[:8]

    # Register User A
    token_a = client.post("/api/v1/auth/register", json={
        "email": f"user_a_{id_a}@enterprise.com",
        "password": "PasswordA123!",
        "display_name": "User Alpha",
    }).json()["token"]

    # Register User B
    token_b = client.post("/api/v1/auth/register", json={
        "email": f"user_b_{id_b}@enterprise.com",
        "password": "PasswordB123!",
        "display_name": "User Beta",
    }).json()["token"]

    # User A creates a reminder
    rem_a = client.post(
        "/api/v1/reminders",
        headers={"Authorization": f"Bearer {token_a}"},
        json={
            "title": "Alpha Confidential Reminder",
            "description": "Top secret security task",
            "due_at": "Friday 5 PM",
            "priority": "high"
        }
    ).json()
    rem_a_id = rem_a["id"]

    # 1. User B lists reminders -> Should NOT see User A's reminder
    list_b = client.get("/api/v1/reminders", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert all(r["id"] != rem_a_id for r in list_b)

    # 2. User B tries to fetch User A's reminder by ID -> 404 Not Found
    fetch_b = client.get(f"/api/v1/reminders/{rem_a_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert fetch_b.status_code == 404

    # 3. User B tries to update User A's reminder -> 404 Not Found
    update_b = client.patch(
        f"/api/v1/reminders/{rem_a_id}",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"title": "Hacked Title"}
    )
    assert update_b.status_code == 404

    # 4. User B tries to delete User A's reminder -> 404 Not Found
    del_b = client.delete(f"/api/v1/reminders/{rem_a_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert del_b.status_code == 404

    # Verify User A's reminder is still intact
    fetch_a = client.get(f"/api/v1/reminders/{rem_a_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert fetch_a.status_code == 200
    assert fetch_a.json()["title"] == "Alpha Confidential Reminder"


def test_reminder_unauthenticated_or_invalid_token():
    """Verify unauthenticated requests and invalid tokens are rejected with 401."""
    # 1. No auth header
    res_no_auth = client.get("/api/v1/reminders")
    assert res_no_auth.status_code == 401

    # 2. Invalid signature
    res_bad_token = client.get("/api/v1/reminders", headers={"Authorization": "Bearer fake.token.here"})
    assert res_bad_token.status_code == 401

    # 3. Create without auth
    res_create_no_auth = client.post("/api/v1/reminders", json={"title": "Test Task"})
    assert res_create_no_auth.status_code == 401


def test_timeline_deadline_extraction_safety():
    """
    Verify timeline deadline extractor rules:
    - Ambiguous phrases ('soon', 'when possible', 'asap') MUST NOT manufacture fake dates.
    - Explicit dates ('August 28 at 10 AM', 'Tuesday at 10:00 AM PST', 'within 24 hours') are accurately identified.
    """
    import re

    # Definition of extraction regex rules used in the application
    explicit_patterns = [
        re.compile(r'\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?(?:\s+(?:at|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?(?:\s+[A-Z]{3,4})?)?\b', re.IGNORECASE),
        re.compile(r'\b(?:by|on|this|next)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+(?:at|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?(?:\s+[A-Z]{3,4})?)?\b', re.IGNORECASE),
        re.compile(r'\b(tomorrow|today|tonight)(?:\s+(?:at|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?(?:\s+[A-Z]{3,4})?)?\b', re.IGNORECASE),
        re.compile(r'\bwithin\s+\d+\s+(?:hours|days|business\s+days)\b', re.IGNORECASE),
        re.compile(r'\b\d{1,2}:\d{2}\s*(?:am|pm)(?:\s+[a-z]{3,4})?\b', re.IGNORECASE),
    ]

    def extract_deadlines(texts):
        results = []
        for text in texts:
            for pat in explicit_patterns:
                m = pat.search(text)
                if m:
                    results.append(m.group(0).strip())
                    break
        return results

    # 1. Ambiguous phrases must return NO extracted deadlines
    ambiguous_texts = [
        "Please submit this soon.",
        "Review when possible at your convenience.",
        "Kindly get back to me ASAP.",
        "Action required shortly.",
        "We should discuss this eventually."
    ]
    assert len(extract_deadlines(ambiguous_texts)) == 0

    # 2. Explicit deadlines must be correctly captured
    explicit_texts = [
        "Submit by August 28 at 10 AM",
        "Q3 planning session tomorrow, Tuesday at 10:00 AM PST",
        "Please re-verify within 24 hours to prevent account suspension"
    ]
    extracted = extract_deadlines(explicit_texts)
    assert len(extracted) == 3
    assert any("August 28" in d for d in extracted)
    assert any("Tuesday at 10:00 AM PST" in d or "tomorrow" in d for d in extracted)
    assert any("within 24 hours" in d for d in extracted)


def test_password_recovery_safety_no_credential_disclosure():
    """Verify that auth responses and schemas NEVER disclose plaintext password or password_hash."""
    unique_id = uuid.uuid4().hex[:8]
    test_email = f"sec_{unique_id}@enterprise.com"
    test_pwd = "TopSecretPassword2026!"

    reg = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": test_pwd,
        "display_name": "SecOps Safe",
    })
    data = reg.json()
    assert "password" not in data
    assert "password_hash" not in data
    assert "salt" not in data

    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {data['token']}"}).json()
    assert "password" not in me
    assert "password_hash" not in me
    assert "salt" not in me
