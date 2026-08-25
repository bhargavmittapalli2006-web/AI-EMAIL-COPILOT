import os
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app import auth_service, email_service
from app.email_service import (
    get_cleaned_emails_csv_path,
    parse_sender_details,
    parse_links_json,
    determine_email_category,
    import_dataset_emails_for_user,
    init_user_mailbox,
)

client = TestClient(app)


def test_dataset_discovery_and_structure():
    """Verify that cleaned_emails.csv is correctly discovered and contains required columns."""
    csv_path = get_cleaned_emails_csv_path()
    assert csv_path is not None
    assert os.path.exists(csv_path)

    import pandas as pd
    df = pd.read_csv(csv_path)
    assert len(df) == 2000
    expected_cols = {"id", "subject", "sender", "reply_to", "body", "links", "label", "classification"}
    assert expected_cols.issubset(set(df.columns))


def test_sender_and_category_parsing():
    """Verify robust sender parsing and deterministic category assignments."""
    # 1. Standard Name <email>
    name, email = parse_sender_details("Sarah Jenkins <sarah@company.com>")
    assert name == "Sarah Jenkins"
    assert email == "sarah@company.com"

    # 2. Angle brackets with no email
    name2, email2 = parse_sender_details('"Security Alert" <>')
    assert name2 == "Security Alert"
    assert "@" in email2

    # 3. Raw email
    name3, email3 = parse_sender_details("support-team@bank.org")
    assert name3 == "Support Team"
    assert email3 == "support-team@bank.org"

    # 4. Empty / None
    name4, email4 = parse_sender_details(None)
    assert name4 == "Unknown Sender"

    # 5. Categories
    assert determine_email_category("Overdue Invoice #902", "Please pay your balance") == "finance"
    assert determine_email_category("URGENT: Password Expired", "Login to re-verify") == "security"
    assert determine_email_category("50% Discount on Shoes", "Exclusive sale for winners") == "promotions"
    assert determine_email_category("Q3 Roadmap Planning", "Sprint review updates") == "work"


def test_first_registration_imports_dataset():
    """Verify that a newly registered user has their mailbox populated with the 2,000 dataset emails."""
    uid = uuid.uuid4().hex[:8]
    reg_resp = client.post("/api/v1/auth/register", json={
        "email": f"analyst_{uid}@enterprise.com",
        "password": "Password12345!",
        "display_name": "Test Dataset Analyst"
    })
    assert reg_resp.status_code == 201
    token = reg_resp.json()["token"]
    user_id = reg_resp.json()["user_id"]

    # Fetch user emails
    emails_resp = client.get("/api/v1/emails", headers={"Authorization": f"Bearer {token}"})
    assert emails_resp.status_code == 200
    emails = emails_resp.json()
    assert len(emails) == 2000

    # Verify fields format
    first = emails[0]
    assert "id" in first
    assert first["id"].startswith(f"u{user_id}-")
    assert "senderName" in first
    assert "senderEmail" in first
    assert "subject" in first
    assert "body" in first
    assert "links" in first
    assert isinstance(first["links"], list)


def test_import_idempotency_no_duplicates():
    """Verify that subsequent imports or login calls do NOT duplicate emails."""
    uid = uuid.uuid4().hex[:8]
    reg_resp = client.post("/api/v1/auth/register", json={
        "email": f"idempotent_{uid}@enterprise.com",
        "password": "Password12345!",
        "display_name": "Idempotent User"
    })
    token = reg_resp.json()["token"]
    user_id = reg_resp.json()["user_id"]

    # Trigger second import via API
    import_resp = client.post("/api/v1/emails/import", headers={"Authorization": f"Bearer {token}"})
    assert import_resp.status_code == 200
    import_data = import_resp.json()
    assert import_data.get("already_initialized") is True or import_data.get("imported_count") == 0

    # Total count remains strictly 2000
    emails_resp = client.get("/api/v1/emails", headers={"Authorization": f"Bearer {token}"})
    assert len(emails_resp.json()) == 2000


def test_user_isolation_on_imported_dataset():
    """Verify that User A cannot read, modify, or delete User B's imported dataset emails."""
    # User A
    uid_a = uuid.uuid4().hex[:8]
    reg_a = client.post("/api/v1/auth/register", json={
        "email": f"user_a_{uid_a}@corp.com",
        "password": "PasswordA123!",
        "display_name": "User Alpha"
    }).json()
    token_a = reg_a["token"]

    # User B
    uid_b = uuid.uuid4().hex[:8]
    reg_b = client.post("/api/v1/auth/register", json={
        "email": f"user_b_{uid_b}@corp.com",
        "password": "PasswordB123!",
        "display_name": "User Beta"
    }).json()
    token_b = reg_b["token"]

    emails_a = client.get("/api/v1/emails", headers={"Authorization": f"Bearer {token_a}"}).json()
    email_a_id = emails_a[0]["id"]

    # User B attempts to read User A's email
    get_unauth = client.get(f"/api/v1/emails/{email_a_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert get_unauth.status_code == 404

    # User B attempts to delete User A's email
    del_unauth = client.delete(f"/api/v1/emails/{email_a_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert del_unauth.status_code == 404

    # User B attempts to update User A's email
    update_unauth = client.patch(
        f"/api/v1/emails/{email_a_id}",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"isStarred": True}
    )
    assert update_unauth.status_code == 404


def test_deleted_emails_not_resurrected():
    """Verify that deleting an email persists and is NOT resurrected on mailbox re-initialization."""
    uid = uuid.uuid4().hex[:8]
    reg = client.post("/api/v1/auth/register", json={
        "email": f"delete_test_{uid}@corp.com",
        "password": "Password123!",
        "display_name": "Delete Test"
    }).json()
    token = reg["token"]
    user_id = reg["user_id"]

    emails = client.get("/api/v1/emails", headers={"Authorization": f"Bearer {token}"}).json()
    target_id = emails[0]["id"]

    # Delete email
    del_resp = client.delete(f"/api/v1/emails/{target_id}", headers={"Authorization": f"Bearer {token}"})
    assert del_resp.status_code == 200

    # Verify it is gone (1999 remaining)
    emails_after = client.get("/api/v1/emails", headers={"Authorization": f"Bearer {token}"}).json()
    assert len(emails_after) == 1999
    assert all(e["id"] != target_id for e in emails_after)

    # Calling init_user_mailbox again must NOT re-insert target_id
    init_user_mailbox(user_id)
    emails_reinit = client.get("/api/v1/emails", headers={"Authorization": f"Bearer {token}"}).json()
    assert len(emails_reinit) == 1999
    assert all(e["id"] != target_id for e in emails_reinit)


def test_dataset_emails_work_with_ml10_inference():
    """Verify that imported dataset emails can be analyzed via POST /api/v1/analyze using authoritative ML-10."""
    uid = uuid.uuid4().hex[:8]
    reg = client.post("/api/v1/auth/register", json={
        "email": f"ml_test_{uid}@corp.com",
        "password": "Password123!",
        "display_name": "ML Tester"
    }).json()
    token = reg["token"]

    emails = client.get("/api/v1/emails", headers={"Authorization": f"Bearer {token}"}).json()
    sample = emails[0]

    # Analyze email
    scan_resp = client.post(
        "/api/v1/analyze",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "email_id": sample["id"],
            "sender": sample["senderEmail"],
            "subject": sample["subject"],
            "body": sample["body"],
            "links": sample["links"]
        }
    )
    assert scan_resp.status_code == 200
    scan_data = scan_resp.json()
    assert "is_phishing" in scan_data
    assert "risk_score" in scan_data
    assert "risk_level" in scan_data
    assert "confidence" in scan_data
    assert "features" in scan_data



def test_google_oauth_user_receives_dataset_emails():
    """Verify that a user created via Google OAuth also has their mailbox populated with dataset emails."""
    sub = "g_sub_" + uuid.uuid4().hex[:10]
    g_email = f"google_dataset_{uuid.uuid4().hex[:6]}@gmail.com"

    g_user = auth_service.get_or_create_google_user(sub=sub, email=g_email, display_name="Google Dataset User")
    token = g_user["token"]

    emails_resp = client.get("/api/v1/emails", headers={"Authorization": f"Bearer {token}"})
    assert emails_resp.status_code == 200
    assert len(emails_resp.json()) == 2000
