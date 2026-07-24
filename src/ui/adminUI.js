// Web Admin Panel Interface Renderer & User Management Controller

import { globalAdminStore } from '../store/adminStore.js';
import { globalAuthStore } from '../store/authStore.js';

export class AdminUI {
  constructor(containerEl) {
    this.container = containerEl;
  }

  renderAdminPanel(onResetGame) {
    this.onResetGame = onResetGame;
    const currentUser = globalAuthStore.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.username !== 'GE')) {
      this.container.innerHTML = `
        <div class="glass-panel" style="padding: 30px; text-align: center;">
          <h2 style="color: var(--accent-rose);">🔒 Admin Access Required</h2>
          <p style="color: var(--text-muted); margin-top: 10px;">You must log in with an administrator account to access this panel.</p>
        </div>
      `;
      return;
    }

    const users = globalAdminStore.getAllUsers();

    this.container.innerHTML = `
      <div class="admin-wrapper">
        <!-- Sidebar Navigation -->
        <div class="admin-sidebar glass-panel">
          <div class="admin-nav-item active" data-tab="users">👥 User Accounts</div>
          <div class="admin-nav-item" data-tab="luck">🎲 Player Luck (GE)</div>
          <div class="admin-nav-item" data-tab="server">⚡ Server Status</div>
        </div>

        <!-- Main Body Content -->
        <div class="admin-body glass-panel">
          <div class="admin-header-bar">
            <h2>🛡️ User Management Dashboard</h2>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Logged in as: <strong style="color: var(--accent-warn);">${currentUser.username}</strong></div>
          </div>

          <!-- User Management Tab -->
          <div id="tabUsersContent">
            <!-- Create New User Form -->
            <div style="background: var(--surface-variant); border: 1px solid var(--surface-border); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <h3 style="margin-bottom: 12px; color: var(--accent-primary);">➕ Create New Account</h3>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <input type="text" id="newAdminUsername" placeholder="Username" class="form-input" style="flex: 1; min-width: 140px;">
                <input type="password" id="newAdminPassword" placeholder="Password" class="form-input" style="flex: 1; min-width: 140px;">
                <select id="newAdminRole" class="form-input" style="width: 120px;">
                  <option value="PLAYER">PLAYER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button class="btn btn-primary" id="btnAdminCreateUser" style="padding: 10px 16px;">
                  Create User
                </button>
              </div>
            </div>

            <h3 style="margin-bottom: 12px; color: var(--accent-warn);">Registered User Database (${users.length})</h3>
            <div class="table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="userTableBody">
                  ${users.map(u => `
                    <tr>
                      <td><strong>${u.username}</strong></td>
                      <td><code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; color: var(--accent-warn);">${u.password}</code></td>
                      <td><span class="badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-active'}">${u.role}</span></td>
                      <td><span class="badge ${u.banned ? 'badge-banned' : 'badge-active'}">${u.banned ? 'BANNED' : 'ACTIVE'}</span></td>
                      <td>
                        ${u.username !== 'GE' && u.role !== 'ADMIN' ? `
                          <button class="btn btn-accent btn-sm btn-reset" data-id="${u.id}" style="padding: 4px 8px; font-size: 0.75rem;">Password</button>
                          <button class="btn btn-danger btn-sm btn-ban" data-id="${u.id}" style="padding: 4px 8px; font-size: 0.75rem;">${u.banned ? 'Unban' : 'Ban'}</button>
                          <button class="btn btn-danger btn-sm btn-delete" data-id="${u.id}" style="padding: 4px 8px; font-size: 0.75rem;">Delete</button>
                        ` : '<span style="color: var(--text-muted); font-size: 0.75rem;">Protected</span>'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Secret Player Luck Control Tab -->
          <div id="tabLuckContent" style="display: none;">
            <div class="luck-control-card">
              <div class="luck-title">✨ Player Luck Factor Controls</div>
              <div class="luck-desc">
                Enables subtle dice & tile probabilities for specified usernames (Default: GE).
                Gives GE higher odds to land on high-value empty properties, avoid opponent high rents, and makes players land on GE's properties.
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
                <div class="setting-row">
                  <div>
                    <div class="setting-label">GE Luck Advantage</div>
                    <div class="setting-desc">Subtle advantage algorithm for player 'GE'</div>
                  </div>
                  <label class="switch">
                    <input type="checkbox" id="luckToggleGE" ${globalAdminStore.isPlayerLuckEnabled('GE') ? 'checked' : ''}>
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Server Status Tab -->
          <div id="tabServerContent" style="display: none;">
            <h3 style="color: var(--accent-emerald);">⚡ Server & Database Status</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
              <div class="glass-panel" style="padding: 16px;">
                <h4>Status</h4>
                <p style="color: var(--accent-emerald); font-weight: 800; margin-top: 4px;">🟢 ONLINE (Production Ready)</p>
              </div>
              <div class="glass-panel" style="padding: 16px;">
                <h4>Hosting Cost</h4>
                <p style="color: var(--accent-gold); font-weight: 800; margin-top: 4px;">$0.00 / month (Vercel Free Tier)</p>
              </div>
              <div class="glass-panel" style="padding: 16px; grid-column: span 2;">
                <h4>Game Session Controls</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin: 6px 0 12px 0;">Dismiss current game in progress and return to the Pre-Game Setup Lobby.</p>
                <button class="btn btn-danger" id="adminBtnResetGame" style="padding: 10px 16px;">
                  🔄 Dismiss Game & Start New Session
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Navigation Tabs
    const navItems = this.container.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
      item.onclick = () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const tab = item.dataset.tab;

        document.getElementById('tabUsersContent').style.display = tab === 'users' ? 'block' : 'none';
        document.getElementById('tabLuckContent').style.display = tab === 'luck' ? 'block' : 'none';
        document.getElementById('tabServerContent').style.display = tab === 'server' ? 'block' : 'none';
      };
    });

    // Create New User Handler
    const btnCreate = document.getElementById('btnAdminCreateUser');
    if (btnCreate) {
      btnCreate.onclick = () => {
        const u = document.getElementById('newAdminUsername').value.trim();
        const p = document.getElementById('newAdminPassword').value.trim();
        const r = document.getElementById('newAdminRole').value;

        if (!u || !p) {
          alert('Please enter both username and password!');
          return;
        }

        const res = globalAdminStore.createUser(u, p, r);
        if (res.success) {
          alert(`✅ Account '${u}' created successfully! Password: ${p}`);
          this.renderAdminPanel(this.onResetGame);
        } else {
          alert(`❌ Failed: ${res.error}`);
        }
      };
    }

    // Ban / Unban User
    this.container.querySelectorAll('.btn-ban').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        globalAdminStore.toggleBanUser(id);
        this.renderAdminPanel(this.onResetGame);
      };
    });

    // Reset Password
    this.container.querySelectorAll('.btn-reset').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const newPass = prompt('Enter new password for user:');
        if (newPass) {
          globalAdminStore.resetPassword(id, newPass);
          alert('Password successfully updated!');
          this.renderAdminPanel(this.onResetGame);
        }
      };
    });

    // Delete User
    this.container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this user account?')) {
          const res = globalAdminStore.deleteUser(id);
          if (res.success) {
            alert('User account deleted.');
            this.renderAdminPanel(this.onResetGame);
          } else {
            alert(`❌ ${res.error}`);
          }
        }
      };
    });

    // GE Luck Toggle
    const geToggle = document.getElementById('luckToggleGE');
    if (geToggle) {
      geToggle.onchange = (e) => {
        globalAdminStore.togglePlayerLuck('GE', e.target.checked);
      };
    }

    // Dismiss Game Reset Handler
    const adminReset = document.getElementById('adminBtnResetGame');
    if (adminReset) {
      adminReset.onclick = () => {
        if (confirm('Are you sure you want to dismiss the current game and start a new session?')) {
          if (this.onResetGame) this.onResetGame();
        }
      };
    }
  }
}
