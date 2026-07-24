/**
 * Authentication Store — API-backed
 *
 * Replaces the localStorage-only user database with real API calls
 * to /api/auth/login and /api/auth/me. The session token is stored
 * in localStorage, but user data comes from the server.
 */

const TOKEN_KEY = 'monopoly_auth_token_v2';

export class AuthStore {
  constructor() {
    this._token = localStorage.getItem(TOKEN_KEY) || null;
    this._user = null;   // populated after validateSession()
    this._validated = false;
  }

  /**
   * Log in (or auto-register) a player.
   * @returns {{ success: boolean, user?: object, error?: string }}
   */
  async login(username, password = '') {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      this._token = data.token;
      this._user = data.user;
      this._validated = true;
      localStorage.setItem(TOKEN_KEY, data.token);

      return { success: true, user: data.user };
    } catch (err) {
      console.error('[AuthStore] login error:', err);
      return { success: false, error: 'Server unreachable. Is the server running?' };
    }
  }

  /**
   * Validate a stored token and refresh _user.
   * Call this on app startup to restore session.
   * @returns {object|null} user or null
   */
  async validateSession() {
    if (this._validated && this._user) return this._user;
    if (!this._token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${this._token}` }
      });

      if (!res.ok) {
        this.logout();
        return null;
      }

      const data = await res.json();
      this._user = data.user;
      this._validated = true;
      return data.user;
    } catch (err) {
      console.warn('[AuthStore] Session validation failed (server may be offline)');
      return null;
    }
  }

  /** Synchronous — returns cached user (null if not yet validated). */
  getCurrentUser() {
    return this._user;
  }

  getToken() {
    return this._token;
  }

  logout() {
    this._token = null;
    this._user = null;
    this._validated = false;
    localStorage.removeItem(TOKEN_KEY);
  }
}

export const globalAuthStore = new AuthStore();
