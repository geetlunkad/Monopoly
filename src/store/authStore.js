// Authentication Store & User Account Storage (Zero-cost Local Storage DB)

const DB_KEY = 'monopoly_user_db';
const SESSION_KEY = 'monopoly_active_session';

export class AuthStore {
  constructor() {
    this.initDB();
  }

  initDB() {
    let users = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    if (users.length === 0) {
      users = [
        { id: 'usr_admin', username: 'admin', password: 'adminpassword', role: 'ADMIN', avatar: '👑', banned: false, createdAt: Date.now() },
        { id: 'usr_ge', username: 'GE', password: 'geetelectric', role: 'PLAYER', avatar: '🚀', banned: false, createdAt: Date.now() },
        { id: 'usr_player1', username: 'PlayerOne', password: '123', role: 'PLAYER', avatar: '🎩', banned: false, createdAt: Date.now() }
      ];
      localStorage.setItem(DB_KEY, JSON.stringify(users));
    } else {
      // Ensure GE account password is updated to 'geetelectric'
      const geUser = users.find(u => u.username.toLowerCase() === 'ge');
      if (geUser && geUser.password !== 'geetelectric') {
        geUser.password = 'geetelectric';
        localStorage.setItem(DB_KEY, JSON.stringify(users));
      }
    }
  }

  getUsers() {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  }

  saveUsers(users) {
    localStorage.setItem(DB_KEY, JSON.stringify(users));
  }

  login(username, password) {
    const users = this.getUsers();
    let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      // Auto-create new user account if not existing (except protected GE)
      if (username.toLowerCase() === 'ge') {
        return { success: false, error: 'Incorrect password for Master GE' };
      }
      const reg = this.register(username, password || '123456');
      if (!reg.success) return reg;
      user = reg.user;
    } else {
      // For GE account, strictly enforce password 'geetelectric'
      if (user.username.toLowerCase() === 'ge' && password !== 'geetelectric') {
        return { success: false, error: 'Incorrect password for Master GE (Password is: geetelectric)' };
      }
    }

    if (user.banned) return { success: false, error: 'This account has been banned by the admin.' };

    const session = { id: user.id, username: user.username, role: user.role, avatar: user.avatar };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  register(username, password, avatar = '🎲', role = 'PLAYER') {
    const users = this.getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      return { success: true, user: existing };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      username,
      password: password || '123456',
      role: role || 'PLAYER',
      avatar,
      banned: false,
      createdAt: Date.now()
    };

    users.push(newUser);
    this.saveUsers(users);
    return { success: true, user: newUser };
  }

  getCurrentUser() {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
  }
}

export const globalAuthStore = new AuthStore();
