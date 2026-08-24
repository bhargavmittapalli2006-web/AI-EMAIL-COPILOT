import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.auth_service import hash_password, verify_password
from app.database import init_db, get_db_connection
from app.email_service import (
    save_security_scan, get_security_scans,
    save_intelligence_result, get_intelligence_results,
    save_reply_suggestion, get_reply_suggestions,
)

client = TestClient(app)


def test_password_hashing_security():
    """Verify PBKDF2 HMAC SHA-256 password hashing with random salt and verification."""
    pwd = "MySecretPass2026!"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert "$" in hashed
    salt, key = hashed.split("$")
    assert len(salt) == 32  # 16 bytes hex
    assert len(key) == 64   # 32 bytes hex
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_auth_registration_and_login_flow():
    """Test full registration, duplicate rejection, login, profile fetch, and logout."""
    unique_id = uuid.uuid4().hex[:8]
    test_email = f"secops_{unique_id}@enterprise.com"
    test_pwd = "SecOpsPass2026!"

    # 1. Register User A
    reg_resp = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": test_pwd,
        "display_name": "SecOps Analyst",
        "role": "Lead Analyst"
    })
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert reg_data["email"] == test_email
    assert "token" in reg_data
    token_a = reg_data["token"]

    # 2. Login User A
    login_resp = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": test_pwd
    })
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "token" in login_data
    assert len(login_data["token"]) > 20

    # 3. Fetch User Profile (/auth/me)
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_a}"})
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == test_email
    assert me_data["role"] == "Lead Analyst"

    # 4. Duplicate Registration should fail with 400
    dup_resp = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": test_pwd,
        "display_name": "Duplicate User"
    })
    assert dup_resp.status_code == 400
    assert "already exists" in dup_resp.json()["detail"]

    # 5. Invalid Login Password should fail with 401
    bad_login = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

    # 6. Logout endpoint
    logout_resp = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token_a}"})
    assert logout_resp.status_code == 200


def test_unauthenticated_protected_endpoints_denied():
    """Verify protected endpoints reject requests without valid Bearer token."""
    assert client.get("/api/v1/emails").status_code == 401
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.post("/api/v1/emails", json={"subject": "Test", "body": "Test"}).status_code == 401
    assert client.patch("/api/v1/emails/msg-101", json={"isStarred": True}).status_code == 401
    assert client.delete("/api/v1/emails/msg-101").status_code == 401


def test_user_isolation_and_crud():
    """Verify strict user isolation: User B cannot GET, PATCH, or DELETE User A's data."""
    uid1 = uuid.uuid4().hex[:8]
    uid2 = uuid.uuid4().hex[:8]

    # Register User 1
    u1_resp = client.post("/api/v1/auth/register", json={
        "email": f"user1_{uid1}@company.com",
        "password": "Password123!",
        "display_name": "User One"
    })
    assert u1_resp.status_code == 201
    token1 = u1_resp.json()["token"]
    user1_id = u1_resp.json()["user_id"]

    # Register User 2
    u2_resp = client.post("/api/v1/auth/register", json={
        "email": f"user2_{uid2}@company.com",
        "password": "Password123!",
        "display_name": "User Two"
    })
    assert u2_resp.status_code == 201
    token2 = u2_resp.json()["token"]
    user2_id = u2_resp.json()["user_id"]

    # User 1 creates an email
    created = client.post(
        "/api/v1/emails",
        json={
            "subject": "User 1 Confidential Strategy",
            "body": "Top secret project plans.",
            "sender": "boss@company.com",
            "folder": "inbox"
        },
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert created.status_code == 201
    email_data = created.json()
    email_id = email_data["id"]

    # User 1 can retrieve it
    u1_get = client.get(f"/api/v1/emails/{email_id}", headers={"Authorization": f"Bearer {token1}"})
    assert u1_get.status_code == 200
    assert u1_get.json()["subject"] == "User 1 Confidential Strategy"

    # User 2 CANNOT access User 1's email (GET denied 404)
    u2_get = client.get(f"/api/v1/emails/{email_id}", headers={"Authorization": f"Bearer {token2}"})
    assert u2_get.status_code == 404

    # User 2 CANNOT modify User 1's email (PATCH denied 404)
    u2_patch = client.patch(
        f"/api/v1/emails/{email_id}",
        json={"isStarred": True, "folder": "trash"},
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert u2_patch.status_code == 404

    # User 2 CANNOT delete User 1's email (DELETE denied 404)
    u2_del = client.delete(f"/api/v1/emails/{email_id}", headers={"Authorization": f"Bearer {token2}"})
    assert u2_del.status_code == 404

    # User 2 list results DO NOT contain User 1's custom email
    u2_list = client.get("/api/v1/emails", headers={"Authorization": f"Bearer {token2}"})
    assert u2_list.status_code == 200
    u2_email_ids = [e["id"] for e in u2_list.json()]
    assert email_id not in u2_email_ids

    # User 1 can modify their own email (star, unread, folder)
    u1_patch = client.patch(
        f"/api/v1/emails/{email_id}",
        json={"isStarred": True, "isUnread": False, "folder": "archive"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert u1_patch.status_code == 200
    patched_data = u1_patch.json()
    assert patched_data["isStarred"] is True
    assert patched_data["isUnread"] is False
    assert patched_data["folder"] == "archive"

    # User 1 can delete their own email
    u1_del = client.delete(f"/api/v1/emails/{email_id}", headers={"Authorization": f"Bearer {token1}"})
    assert u1_del.status_code == 200

    # After deletion, it cannot be retrieved
    assert client.get(f"/api/v1/emails/{email_id}", headers={"Authorization": f"Bearer {token1}"}).status_code == 404


def test_email_folder_persistence():
    """Verify persistence across all folders: sent, drafts, spam, trash, archive."""
    uid = uuid.uuid4().hex[:8]
    u_resp = client.post("/api/v1/auth/register", json={
        "email": f"persist_{uid}@company.com",
        "password": "Password123!",
        "display_name": "Persist User"
    })
    token = u_resp.json()["token"]

    # Create emails in different folders
    folders = ["sent", "drafts", "spam", "trash", "archive"]
    created_ids = {}
    for f in folders:
        res = client.post(
            "/api/v1/emails",
            json={
                "subject": f"Email in {f}",
                "body": f"Testing folder {f} persistence",
                "folder": f,
                "isStarred": (f == "sent"),
                "isImportant": (f == "drafts"),
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 201
        created_ids[f] = res.json()["id"]

    # Verify folder queries
    for f in folders:
        res = client.get(f"/api/v1/emails?folder={f}", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        items = res.json()
        assert any(item["id"] == created_ids[f] for item in items)


def test_ml_and_intelligence_user_isolation():
    """Verify security scans, intelligence results, and reply suggestions are strictly isolated per user."""
    uid1 = uuid.uuid4().hex[:8]
    uid2 = uuid.uuid4().hex[:8]

    u1_resp = client.post("/api/v1/auth/register", json={
        "email": f"ml_u1_{uid1}@company.com", "password": "Password123!", "display_name": "ML User 1"
    })
    user1_id = u1_resp.json()["user_id"]

    u2_resp = client.post("/api/v1/auth/register", json={
        "email": f"ml_u2_{uid2}@company.com", "password": "Password123!", "display_name": "ML User 2"
    })
    user2_id = u2_resp.json()["user_id"]

    # Save User 1 ML scan
    scan_id = save_security_scan(
        user_id=user1_id,
        email_id="msg-u1-scan",
        scan_data={
            "is_phishing": True,
            "classification": "PHISHING",
            "risk_score": 88.5,
            "risk_level": "HIGH",
            "confidence": 0.94,
            "flagged_reasons": ["Urgent coercion", "Suspicious IP"],
            "features": {"has_ip_url": True}
        }
    )
    assert scan_id > 0

    # User 1 can retrieve their scan
    u1_scans = get_security_scans(user_id=user1_id, email_id="msg-u1-scan")
    assert len(u1_scans) == 1
    assert u1_scans[0]["risk_level"] == "HIGH"

    # User 2 CANNOT see User 1's scan
    u2_scans = get_security_scans(user_id=user2_id, email_id="msg-u1-scan")
    assert len(u2_scans) == 0

    # Save User 1 Intelligence result
    intel_id = save_intelligence_result(
        user_id=user1_id,
        email_id="msg-u1-intel",
        intel_data={
            "summary": "Confidential budget discussion",
            "action_items": [{"task": "Approve Q3 spend", "priority": "HIGH"}],
            "key_points": ["Budget up 10%"],
            "risk_explanation": "Legitimate internal communication",
            "recommended_actions": ["Review spreadsheets"]
        }
    )
    assert intel_id > 0

    # User 1 can retrieve their intelligence
    u1_intel = get_intelligence_results(user_id=user1_id, email_id="msg-u1-intel")
    assert len(u1_intel) == 1
    assert u1_intel[0]["summary"] == "Confidential budget discussion"

    # User 2 CANNOT see User 1's intelligence
    u2_intel = get_intelligence_results(user_id=user2_id, email_id="msg-u1-intel")
    assert len(u2_intel) == 0

    # Save User 1 Reply suggestions
    reply_id = save_reply_suggestion(
        user_id=user1_id,
        email_id="msg-u1-reply",
        reply_data={
            "reply_allowed": True,
            "reason": "Safe message",
            "reply_drafts": {
                "professional": "Thank you for the update.",
                "friendly": "Thanks, looks great!",
                "concise": "Acknowledged."
            },
            "source": "gemini"
        }
    )
    assert reply_id > 0

    # User 1 can retrieve reply suggestions
    u1_replies = get_reply_suggestions(user_id=user1_id, email_id="msg-u1-reply")
    assert len(u1_replies) == 1
    assert u1_replies[0]["reply_allowed"] is True

    # User 2 CANNOT see User 1's reply suggestions
    u2_replies = get_reply_suggestions(user_id=user2_id, email_id="msg-u1-reply")
    assert len(u2_replies) == 0


def test_database_idempotent_initialization():
    """Verify init_db is idempotent and does not destroy existing tables or data."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM users")
        initial_user_count = cursor.fetchone()["count"]

    # Re-run init_db multiple times
    init_db()
    init_db()

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM users")
        after_user_count = cursor.fetchone()["count"]
        assert after_user_count == initial_user_count

