import os
import hmac
import hashlib
import json
import secrets
import logging
import urllib.parse
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
import httpx
from fastapi import Request, HTTPException, status, Header, Depends

from app.database import get_db_connection

logger = logging.getLogger("phishing-engine.auth")

SECRET_KEY = os.environ.get("SESSION_SECRET_KEY", "ai_email_copilot_secops_secret_key_2026")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/auth/google/callback")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")


def is_google_oauth_configured() -> bool:
    """Returns True if Google OAuth 2.0 client ID and client secret are configured."""
    return bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)


def hash_password(password: str, salt: Optional[bytes] = None) -> str:
    """Hashes password using PBKDF2 HMAC SHA-256 with a cryptographically secure 16-byte salt."""
    if salt is None:
        salt = secrets.token_bytes(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"{salt.hex()}${key.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verifies a plaintext password against a stored PBKDF2 hash."""
    try:
        salt_hex, key_hex = stored_hash.split("$")
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
        computed_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
        return hmac.compare_digest(computed_key, expected_key)
    except Exception:
        return False


def generate_session_token(user_id: int, email: str) -> str:
    """Generates an HMAC-SHA256 signed session token containing user_id and expiration."""
    exp = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    payload = json.dumps({"user_id": user_id, "email": email, "exp": exp})
    signature = hmac.new(SECRET_KEY.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    raw_token = f"{payload}.{signature}"
    return raw_token.encode("utf-8").hex()


def decode_session_token(token_hex: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates HMAC signature and expiration for a session token."""
    try:
        raw_token = bytes.fromhex(token_hex).decode("utf-8")
        payload_str, signature = raw_token.rsplit(".", 1)
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), payload_str.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None

        payload = json.loads(payload_str)
        exp = datetime.fromisoformat(payload["exp"])
        if datetime.now(timezone.utc) > exp:
            return None
        return payload
    except Exception:
        return None


def save_oauth_state(state: str, expires_seconds: int = 600) -> None:
    """Saves cryptographically random OAuth state with TTL in SQLite."""
    now = datetime.now(timezone.utc)
    exp = (now + timedelta(seconds=expires_seconds)).isoformat()
    now_str = now.isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM oauth_states WHERE expires_at < ?", (now_str,))
        cursor.execute(
            "INSERT INTO oauth_states (state, created_at, expires_at) VALUES (?, ?, ?)",
            (state, now_str, exp)
        )
        conn.commit()


def verify_and_consume_oauth_state(state: str) -> bool:
    """Validates and immediately consumes (deletes) the single-use OAuth state."""
    if not state:
        return False
    now_str = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT state, expires_at FROM oauth_states WHERE state = ?", (state,))
        row = cursor.fetchone()
        if not row:
            return False
        cursor.execute("DELETE FROM oauth_states WHERE state = ?", (state,))
        conn.commit()
        if row["expires_at"] < now_str:
            return False
        return True


def get_google_auth_url() -> Dict[str, Any]:
    """Generates a secure Google authorization URL with CSRF protection state."""
    if not is_google_oauth_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth 2.0 is not configured for this environment."
        )

    state = secrets.token_urlsafe(32)
    save_oauth_state(state, expires_seconds=600)

    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "select_account",
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return {
        "authorization_url": auth_url,
        "state": state,
    }


def get_or_create_google_user(sub: str, email: str, display_name: Optional[str] = None) -> Dict[str, Any]:
    """
    Safely finds or creates a user account linked with verified Google OpenID Connect identity.
    Multi-tenant isolation & account linking:
    1. If user already linked via (provider='google', provider_subject=sub), return user session.
    2. If user already exists with verified email, link Google identity to existing user account.
    3. If no user exists, create new user account and link Google identity.
    """
    email_clean = email.strip().lower()
    now = datetime.now(timezone.utc).isoformat()

    with get_db_connection() as conn:
        cursor = conn.cursor()

        # 1. Check existing OAuth account linking
        cursor.execute(
            "SELECT user_id FROM oauth_accounts WHERE provider = 'google' AND provider_subject = ?",
            (sub,)
        )
        oauth_row = cursor.fetchone()
        if oauth_row:
            user_id = oauth_row["user_id"]
            cursor.execute("SELECT id, email, display_name, role, is_active FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            if not user or not user["is_active"]:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated.")

            cursor.execute(
                "UPDATE oauth_accounts SET updated_at = ? WHERE provider = 'google' AND provider_subject = ?",
                (now, sub)
            )
            conn.commit()

            token = generate_session_token(user_id, user["email"])
            return {
                "user_id": user_id,
                "email": user["email"],
                "display_name": user["display_name"],
                "role": user["role"],
                "token": token,
                "auth_provider": "google",
            }

        # 2. Check if local user already exists with matching verified email
        cursor.execute("SELECT id, email, display_name, role, is_active FROM users WHERE email = ?", (email_clean,))
        user = cursor.fetchone()
        if user:
            user_id = user["id"]
            if not user["is_active"]:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated.")

            cursor.execute(
                """
                INSERT INTO oauth_accounts (user_id, provider, provider_subject, email, created_at, updated_at)
                VALUES (?, 'google', ?, ?, ?, ?)
                """,
                (user_id, sub, email_clean, now, now)
            )
            conn.commit()

            token = generate_session_token(user_id, user["email"])
            return {
                "user_id": user_id,
                "email": user["email"],
                "display_name": user["display_name"],
                "role": user["role"],
                "token": token,
                "auth_provider": "google",
            }

        # 3. Create new user for Google Sign-In
        name = (display_name or email_clean.split("@")[0]).strip()
        dummy_hash = hash_password(secrets.token_urlsafe(32))

        cursor.execute(
            """
            INSERT INTO users (email, password_hash, display_name, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, 'User', 1, ?, ?)
            """,
            (email_clean, dummy_hash, name, now, now)
        )
        user_id = cursor.lastrowid

        # Insert default settings
        cursor.execute(
            """
            INSERT INTO user_settings (user_id, theme, density, notify_threats, notify_daily_report, sensitivity_threshold, created_at, updated_at)
            VALUES (?, 'dark', 'comfortable', 1, 0, 'standard', ?, ?)
            """,
            (user_id, now, now)
        )

        # Link Google identity in oauth_accounts
        cursor.execute(
            """
            INSERT INTO oauth_accounts (user_id, provider, provider_subject, email, created_at, updated_at)
            VALUES (?, 'google', ?, ?, ?, ?)
            """,
            (user_id, sub, email_clean, now, now)
        )
        conn.commit()

    # Seed initial inbox for new Google user
    from app.email_service import seed_mock_emails_if_empty
    seed_mock_emails_if_empty(user_id)

    token = generate_session_token(user_id, email_clean)
    return {
        "user_id": user_id,
        "email": email_clean,
        "display_name": name,
        "role": "User",
        "token": token,
        "auth_provider": "google",
    }


async def exchange_google_code_and_authenticate(code: str, state: str) -> Dict[str, Any]:
    """
    Exchanges Google OAuth authorization code, verifies ID token / OpenID Connect claims,
    and returns an authenticated application session.
    """
    if not is_google_oauth_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth 2.0 is not configured for this environment."
        )

    # 1. CSRF State validation
    if not verify_and_consume_oauth_state(state):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid, expired, or reused OAuth state."
        )

    # 2. Exchange code with Google
    token_url = "https://oauth2.googleapis.com/token"
    payload = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": GOOGLE_REDIRECT_URI,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            token_resp = await client.post(token_url, data=payload)
        except Exception as exc:
            logger.error("Google OAuth token exchange network error: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to communicate with Google authentication server."
            )

        if token_resp.status_code != 200:
            logger.warning("Google OAuth token exchange rejected: %s", token_resp.text)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google authorization code exchange failed or expired."
            )

        token_data = token_resp.json()
        id_token_str = token_data.get("id_token")
        access_token_str = token_data.get("access_token")

        # 3. Validate Google Identity & Claims
        userinfo: Dict[str, Any] = {}
        if id_token_str:
            try:
                tokeninfo_resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token_str}")
                if tokeninfo_resp.status_code == 200:
                    userinfo = tokeninfo_resp.json()
            except Exception as exc:
                logger.warning("Tokeninfo fetch failed, falling back to userinfo: %s", exc)

        if not userinfo and access_token_str:
            try:
                userinfo_resp = await client.get(
                    "https://openidconnect.googleapis.com/v1/userinfo",
                    headers={"Authorization": f"Bearer {access_token_str}"}
                )
                if userinfo_resp.status_code == 200:
                    userinfo = userinfo_resp.json()
            except Exception as exc:
                logger.error("Userinfo endpoint fetch failed: %s", exc)

        if not userinfo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to retrieve verified Google identity."
            )

        # 4. Rigorous claim verification
        iss = userinfo.get("iss", "")
        if iss and iss not in ["https://accounts.google.com", "accounts.google.com"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token issuer.")

        aud = userinfo.get("aud")
        if aud and aud != GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token audience mismatch.")

        email_verified = userinfo.get("email_verified")
        if isinstance(email_verified, str):
            email_verified = email_verified.lower() == "true"
        if not email_verified:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google email address is not verified.")

        sub = userinfo.get("sub")
        email = userinfo.get("email")
        if not sub or not email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google identity missing sub or email.")

        display_name = userinfo.get("name") or email.split("@")[0]

        return get_or_create_google_user(sub=sub, email=email, display_name=display_name)


def register_user(email: str, password: str, display_name: str, role: str = "User") -> Dict[str, Any]:
    """Registers a new user in SQLite database."""
    email_clean = email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="Invalid email address format.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    pwd_hash = hash_password(password)
    now = datetime.now(timezone.utc).isoformat()

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email_clean,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="An account with this email address already exists.")

        cursor.execute(
            """
            INSERT INTO users (email, password_hash, display_name, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, 1, ?, ?)
            """,
            (email_clean, pwd_hash, display_name.strip(), role, now, now)
        )
        user_id = cursor.lastrowid

        # Insert default settings
        cursor.execute(
            """
            INSERT INTO user_settings (user_id, theme, density, notify_threats, notify_daily_report, sensitivity_threshold, created_at, updated_at)
            VALUES (?, 'dark', 'comfortable', 1, 0, 'standard', ?, ?)
            """,
            (user_id, now, now)
        )
        conn.commit()

    # Seed initial inbox for new user once
    from app.email_service import seed_mock_emails_if_empty
    seed_mock_emails_if_empty(user_id)

    token = generate_session_token(user_id, email_clean)
    return {
        "user_id": user_id,
        "email": email_clean,
        "display_name": display_name.strip(),
        "role": role,
        "token": token,
        "auth_provider": "local",
    }


def authenticate_user(email: str, password: str) -> Dict[str, Any]:
    """Authenticates a user email and password against SQLite store."""
    email_clean = email.strip().lower()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, email, password_hash, display_name, role, is_active FROM users WHERE email = ?",
            (email_clean,)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        if not row["is_active"]:
            raise HTTPException(status_code=403, detail="User account is deactivated.")

        if not verify_password(password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        user_id = row["id"]

        cursor.execute("SELECT provider FROM oauth_accounts WHERE user_id = ?", (user_id,))
        oauth_row = cursor.fetchone()
        auth_provider = oauth_row["provider"] if oauth_row else "local"

        token = generate_session_token(user_id, row["email"])
        return {
            "user_id": user_id,
            "email": row["email"],
            "display_name": row["display_name"],
            "role": row["role"],
            "token": token,
            "auth_provider": auth_provider,
        }


def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """FastAPI Dependency enforcing authenticated session via Bearer authorization header."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Authorization header."
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization token header format. Expected 'Bearer <token>'."
        )

    token_hex = parts[1]
    payload = decode_session_token(token_hex)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication session token."
        )

    user_id = payload["user_id"]
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, display_name, role, is_active FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if not row or not row["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User session is invalid or account deactivated."
            )

        cursor.execute("SELECT provider FROM oauth_accounts WHERE user_id = ?", (user_id,))
        oauth_row = cursor.fetchone()
        auth_provider = oauth_row["provider"] if oauth_row else "local"

        return {
            "id": row["id"],
            "email": row["email"],
            "display_name": row["display_name"],
            "role": row["role"],
            "auth_provider": auth_provider,
        }


def get_optional_current_user(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """FastAPI Dependency that extracts user session if token present, or returns None if unauthenticated."""
    if not authorization:
        return None
    try:
        return get_current_user(authorization=authorization)
    except HTTPException:
        return None

