import os
import hmac
import hashlib
import json
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, status, Header, Depends

from app.database import get_db_connection

SECRET_KEY = os.environ.get("SESSION_SECRET_KEY", "ai_email_copilot_secops_secret_key_2026")


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

    token = generate_session_token(user_id, email_clean)
    return {
        "user_id": user_id,
        "email": email_clean,
        "display_name": display_name.strip(),
        "role": role,
        "token": token,
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
        token = generate_session_token(user_id, row["email"])
        return {
            "user_id": user_id,
            "email": row["email"],
            "display_name": row["display_name"],
            "role": row["role"],
            "token": token,
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

        return {
            "id": row["id"],
            "email": row["email"],
            "display_name": row["display_name"],
            "role": row["role"],
        }


def get_optional_current_user(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """FastAPI Dependency that extracts user session if token present, or returns None if unauthenticated."""
    if not authorization:
        return None
    try:
        return get_current_user(authorization=authorization)
    except HTTPException:
        return None
