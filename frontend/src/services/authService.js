const API_BASE = 'http://127.0.0.1:8000';

/**
 * Real Backend Authentication Service calling FastAPI endpoints:
 * - POST /api/v1/auth/register
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/logout
 * - GET  /api/v1/auth/me
 */
export const authService = {
  /**
   * Registers a new user account on the backend database
   */
  async register({ email, password, displayName, role }) {
    const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password: password.trim(),
        display_name: displayName || email.split('@')[0],
        role: role || 'SecOps Analyst',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }

    const data = await res.json();
    return data;
  },

  /**
   * Authenticates user against backend and returns session token
   */
  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password: password.trim(),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
      throw new Error(err.detail || 'Authentication failed');
    }

    const data = await res.json();
    return data;
  },

  /**
   * Restores session user profile using session token
   */
  async getCurrentUser(token) {
    if (!token) return null;

    const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  },

  /**
   * Logout user session
   */
  async logout(token) {
    try {
      await fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (_) {}
  },

  /**
   * Retrieves Google OAuth configuration status from backend
   */
  async getGoogleAuthConfig() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/google/config`);
      if (res.ok) {
        return await res.json();
      }
      return { configured: false };
    } catch {
      return { configured: false };
    }
  },

  /**
   * Generates Google OAuth 2.0 authorization URL from backend
   */
  async getGoogleAuthUrl() {
    const res = await fetch(`${API_BASE}/api/v1/auth/google/login`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Google OAuth is not configured.' }));
      throw new Error(err.detail || 'Failed to initiate Google Sign-In');
    }
    return await res.json();
  },


  /**
   * Retrieves persistent emails for user from backend
   */
  async getEmails(token, folder = null) {
    if (!token) return null;
    const url = folder ? `${API_BASE}/api/v1/emails?folder=${encodeURIComponent(folder)}` : `${API_BASE}/api/v1/emails`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch emails');
    }

    return await res.json();
  },

  /**
   * Imports authoritative dataset emails into user's mailbox on demand
   */
  async importDatasetEmails(token, force = false) {
    if (!token) return null;
    const res = await fetch(`${API_BASE}/api/v1/emails/import?force=${force}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to import dataset emails');
    }

    return await res.json();
  },


  /**
   * Persists a newly created or composed email to backend database
   */
  async createEmail(token, emailData) {
    if (!token) return null;
    const res = await fetch(`${API_BASE}/api/v1/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!res.ok) {
      throw new Error('Failed to save email');
    }

    return await res.json();
  },

  /**
   * Updates folder, read, star, or important status for an email
   */
  async updateEmail(token, emailId, updates) {
    if (!token) return null;
    const res = await fetch(`${API_BASE}/api/v1/emails/${emailId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error('Failed to update email');
    }

    return await res.json();
  },

  /**
   * Deletes an email on the backend database
   */
  async deleteEmail(token, emailId) {
    if (!token) return null;
    const res = await fetch(`${API_BASE}/api/v1/emails/${emailId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to delete email');
    }

    return await res.json();
  },

  /**
   * Retrieves user-scoped reminders from backend database (Phase 20)
   */
  async getReminders(token, emailId = null) {
    if (!token) return [];
    const url = emailId
      ? `${API_BASE}/api/v1/reminders?email_id=${encodeURIComponent(emailId)}`
      : `${API_BASE}/api/v1/reminders`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  },

  /**
   * Creates a user-scoped reminder on backend database
   */
  async createReminder(token, reminderData) {
    if (!token) return null;
    const res = await fetch(`${API_BASE}/api/v1/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reminderData),
    });

    if (!res.ok) {
      throw new Error('Failed to save reminder');
    }

    return await res.json();
  },

  /**
   * Updates a user-scoped reminder on backend database
   */
  async updateReminder(token, reminderId, updates) {
    if (!token) return null;
    const res = await fetch(`${API_BASE}/api/v1/reminders/${reminderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error('Failed to update reminder');
    }

    return await res.json();
  },

  /**
   * Deletes a user-scoped reminder on backend database
   */
  async deleteReminder(token, reminderId) {
    if (!token) return false;
    const res = await fetch(`${API_BASE}/api/v1/reminders/${reminderId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to delete reminder');
    }

    return true;
  },
};


