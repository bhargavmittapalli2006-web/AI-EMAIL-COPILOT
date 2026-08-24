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
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

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

        conn.commit()
    _initialized = True
    logger.info("Database schema initialized successfully.")

# Auto-initialize on import
init_db()
