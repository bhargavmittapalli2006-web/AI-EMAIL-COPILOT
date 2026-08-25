import os
import sqlite3
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

logger = logging.getLogger("phishing-engine.database")

DB_PATH = os.path.join(os.path.dirname(__file__), "copilot.db")
_initialized = False


def get_db_connection() -> sqlite3.Connection:
    """Returns a row-factory configured SQLite database connection."""
    global _initialized
    if not _initialized:
        init_db()

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Initializes the database schema for users, settings, emails, scans, intelligence, and replies."""
    global _initialized
    logger.info("Initializing SQLite database at: %s", DB_PATH)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        cursor = conn.cursor()

        # 1. Users Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                display_name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'User',
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)

        # 2. User Settings Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                theme TEXT DEFAULT 'dark',
                density TEXT DEFAULT 'comfortable',
                notify_threats INTEGER DEFAULT 1,
                notify_daily_report INTEGER DEFAULT 0,
                sensitivity_threshold TEXT DEFAULT 'standard',
                mailbox_initialized INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Migration helper for existing databases: ensure mailbox_initialized exists
        cursor.execute("PRAGMA table_info(user_settings)")
        setting_cols = [c[1] for c in cursor.fetchall()]
        if "mailbox_initialized" not in setting_cols:
            try:
                cursor.execute("ALTER TABLE user_settings ADD COLUMN mailbox_initialized INTEGER DEFAULT 0")
            except Exception:
                pass

        # 3. Emails Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS emails (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                sender_name TEXT NOT NULL,
                sender_email TEXT NOT NULL,
                recipient TEXT NOT NULL,
                reply_to TEXT,
                subject TEXT NOT NULL,
                preview TEXT,
                body TEXT NOT NULL,
                links_json TEXT DEFAULT '[]',
                folder TEXT DEFAULT 'inbox',
                category TEXT DEFAULT 'work',
                is_unread INTEGER DEFAULT 1,
                is_starred INTEGER DEFAULT 0,
                is_important INTEGER DEFAULT 0,
                has_attachment INTEGER DEFAULT 0,
                avatar_color TEXT DEFAULT 'bg-blue-600',
                timestamp TEXT NOT NULL,
                date TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_emails_user_folder ON emails(user_id, folder)")


        # 4. Security Scans Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS security_scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email_id TEXT,
                user_id INTEGER NOT NULL,
                is_phishing INTEGER NOT NULL,
                classification TEXT NOT NULL,
                risk_score REAL NOT NULL,
                risk_level TEXT NOT NULL,
                confidence REAL NOT NULL,
                flagged_reasons_json TEXT DEFAULT '[]',
                feature_metrics_json TEXT DEFAULT '{}',
                scanned_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # 5. Intelligence Results Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS intelligence_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email_id TEXT,
                user_id INTEGER NOT NULL,
                summary TEXT,
                action_items_json TEXT DEFAULT '[]',
                key_points_json TEXT DEFAULT '[]',
                risk_explanation TEXT,
                recommended_actions_json TEXT DEFAULT '[]',
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # 6. Reply Suggestions Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reply_suggestions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email_id TEXT,
                user_id INTEGER NOT NULL,
                reply_allowed INTEGER NOT NULL,
                reason TEXT,
                professional_reply TEXT,
                friendly_reply TEXT,
                concise_reply TEXT,
                source TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # 7. User Reminders Table (Phase 20)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reminders (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                email_id TEXT,
                action_item_id TEXT,
                title TEXT NOT NULL,
                description TEXT,
                due_at TEXT,
                priority TEXT DEFAULT 'medium',
                completed INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id)")

        # 8. OAuth Accounts Table (Phase 22 - Google OAuth 2.0)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS oauth_accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                provider TEXT NOT NULL,
                provider_subject TEXT NOT NULL,
                email TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(provider, provider_subject)
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user ON oauth_accounts(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider_sub ON oauth_accounts(provider, provider_subject)")

        # 9. OAuth States Table for CSRF Protection (Phase 22)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS oauth_states (
                state TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL
            )
        """)

        conn.commit()
    _initialized = True
    logger.info("Database schema initialized successfully.")


# Auto-initialize on import
init_db()

