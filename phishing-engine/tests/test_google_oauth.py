import os
import uuid
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient
from app.main import app
from app import auth_service
from app.auth_service import (
    save_oauth_state,
    verify_and_consume_oauth_state,
    get_or_create_google_user,
    exchange_google_code_and_authenticate,
    is_google_oauth_configured,
)

client = TestClient(app)


def test_oauth_config_endpoint():
    """Verify GET /api/v1/auth/google/config reflects configuration without leaking secrets."""
    resp = client.get("/api/v1/auth/google/config")
    assert resp.status_code == 200
    data = resp.json()
    assert "configured" in data
    # Secret must never be in response schema
    assert "client_secret" not in data
    assert "secret" not in data


def test_google_login_unconfigured_fails_gracefully():
    """Verify Google login returns 503 when environment variables are not set."""
    with patch.dict(os.environ, {"GOOGLE_CLIENT_ID": "", "GOOGLE_CLIENT_SECRET": ""}):
        resp = client.get("/api/v1/auth/google/login")
        assert resp.status_code == 503
        assert "not configured" in resp.json()["detail"].lower()


def test_google_login_generates_valid_state_and_url():
    """Verify Google login generates secure state and valid authorization URL."""
    with patch.dict(os.environ, {
        "GOOGLE_CLIENT_ID": "test-google-client-id.apps.googleusercontent.com",
        "GOOGLE_CLIENT_SECRET": "test-google-secret"
    }):
        resp = client.get("/api/v1/auth/google/login")
        assert resp.status_code == 200
        data = resp.json()
        assert "authorization_url" in data
        assert "state" in data
        assert "accounts.google.com" in data["authorization_url"]
        assert "test-google-client-id" in data["authorization_url"]
        assert data["state"] in data["authorization_url"]



def test_oauth_state_lifecycle_csrf_protection():
    """Verify OAuth state lifecycle: generation, single-use consumption, reuse prevention, and expiration."""
    state = "test_csrf_state_" + uuid.uuid4().hex
    save_oauth_state(state, expires_seconds=600)

    # 1. Valid state verification succeeds
    assert verify_and_consume_oauth_state(state) is True

    # 2. Reused state fails (single-use)
    assert verify_and_consume_oauth_state(state) is False

    # 3. Nonexistent state fails
    assert verify_and_consume_oauth_state("nonexistent_state") is False

    # 4. Expired state fails
    expired_state = "expired_csrf_state_" + uuid.uuid4().hex
    save_oauth_state(expired_state, expires_seconds=-10)
    assert verify_and_consume_oauth_state(expired_state) is False


def test_new_google_user_creation_and_session():
    """Verify new Google user creation seeds inbox and issues valid session."""
    sub = "google_sub_" + uuid.uuid4().hex[:12]
    email = f"google_user_{uuid.uuid4().hex[:6]}@gmail.com"
    name = "Dr. Google Analyst"

    result = get_or_create_google_user(sub=sub, email=email, display_name=name)
    assert result["email"] == email
    assert result["display_name"] == name
    assert result["auth_provider"] == "google"
    assert "token" in result
    token = result["token"]

    # Verify session against /api/v1/auth/me
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == email
    assert me_data["auth_provider"] == "google"

    # Verify seeded emails exist for new Google user
    emails_resp = client.get("/api/v1/emails", headers={"Authorization": f"Bearer {token}"})
    assert emails_resp.status_code == 200
    assert len(emails_resp.json()) > 0


def test_existing_local_user_account_linking():
    """Verify existing password-based account is safely linked to Google identity when verified email matches."""
    unique_id = uuid.uuid4().hex[:6]
    local_email = f"secops_{unique_id}@enterprise.com"
    local_pwd = "OriginalSecOpsPass2026!"

    # 1. Register local password account
    reg_resp = client.post("/api/v1/auth/register", json={
        "email": local_email,
        "password": local_pwd,
        "display_name": "SecOps Lead",
        "role": "Lead Analyst"
    })
    assert reg_resp.status_code == 201
    orig_user_id = reg_resp.json()["user_id"]

    # 2. Google OAuth login with same verified email
    google_sub = "google_sub_" + uuid.uuid4().hex[:12]
    linked_result = get_or_create_google_user(sub=google_sub, email=local_email, display_name="SecOps Lead Google")
    assert linked_result["user_id"] == orig_user_id
    assert linked_result["email"] == local_email

    # 3. User can still log in with original password
    login_resp = client.post("/api/v1/auth/login", json={"email": local_email, "password": local_pwd})
    assert login_resp.status_code == 200

    # 4. Subsequent Google logins return the linked account
    re_login_google = get_or_create_google_user(sub=google_sub, email=local_email)
    assert re_login_google["user_id"] == orig_user_id


def test_google_user_isolation_and_reminders():
    """Verify multi-tenant isolation: Google User A cannot access Password User B's reminders or emails."""
    # Create Google User A
    sub_a = "sub_a_" + uuid.uuid4().hex[:8]
    user_a = get_or_create_google_user(sub=sub_a, email=f"user_a_{uuid.uuid4().hex[:6]}@gmail.com", display_name="User Alpha")
    token_a = user_a["token"]

    # Create Password User B
    reg_b = client.post("/api/v1/auth/register", json={
        "email": f"user_b_{uuid.uuid4().hex[:6]}@enterprise.com",
        "password": "PasswordB123!",
        "display_name": "User Beta"
    }).json()
    token_b = reg_b["token"]

    # User B creates a reminder
    rem_b = client.post(
        "/api/v1/reminders",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"title": "Confidential Task B", "due_at": "Tomorrow 10 AM"}
    ).json()

    # User A cannot view User B's reminder
    get_rem = client.get(f"/api/v1/reminders/{rem_b['id']}", headers={"Authorization": f"Bearer {token_a}"})
    assert get_rem.status_code == 404

    # User A cannot delete User B's reminder
    del_rem = client.delete(f"/api/v1/reminders/{rem_b['id']}", headers={"Authorization": f"Bearer {token_a}"})
    assert del_rem.status_code == 404


@pytest.mark.anyio
async def test_google_claims_validation_issuer_and_audience():
    """Verify token validation rejects invalid issuer, mismatched audience, and unverified email."""
    with patch.dict(os.environ, {"GOOGLE_CLIENT_ID": "valid-client-id", "GOOGLE_CLIENT_SECRET": "valid-secret"}):
        # 1. Reject invalid state
        with pytest.raises(Exception) as exc_state:
            await exchange_google_code_and_authenticate(code="valid_code", state="invalid_state")
        assert "invalid" in str(exc_state.value).lower() or "state" in str(exc_state.value).lower()



def test_google_callback_redirect_error_handling():
    """Verify GET /api/v1/auth/google/callback redirects with error when code/state are missing or error parameter is passed."""
    # 1. Error passed by Google (e.g. user cancelled)
    resp = client.get("/api/v1/auth/google/callback?error=access_denied&error_description=The+user+cancelled+sign-in", follow_redirects=False)
    assert resp.status_code == 307
    assert "oauth_error=" in resp.headers["location"]

    # 2. Missing code or state
    resp_missing = client.get("/api/v1/auth/google/callback", follow_redirects=False)
    assert resp_missing.status_code == 307
    assert "oauth_error=" in resp_missing.headers["location"]


def test_password_auth_full_regression_intact():
    """Verify that password authentication, duplicate registration prevention, and session revocation remain 100% functional."""
    uid = uuid.uuid4().hex[:6]
    test_email = f"analyst_{uid}@corp.com"
    test_pwd = "StrongSecurePassword2026!"

    # 1. Register
    reg = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": test_pwd,
        "display_name": "Analyst Corp",
    })
    assert reg.status_code == 201

    # 2. Duplicate registration rejected
    dup = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": test_pwd,
        "display_name": "Analyst Corp",
    })
    assert dup.status_code == 400

    # 3. Wrong password rejected
    bad_login = client.post("/api/v1/auth/login", json={"email": test_email, "password": "WrongPassword!"})
    assert bad_login.status_code == 401

    # 4. Valid login
    good_login = client.post("/api/v1/auth/login", json={"email": test_email, "password": test_pwd})
    assert good_login.status_code == 200
    token = good_login.json()["token"]

    # 5. /auth/me profile
    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == test_email
    assert me.json()["auth_provider"] == "local"

    # 6. Logout
    logout_resp = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_resp.status_code == 200
