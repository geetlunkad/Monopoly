// Admin Dashboard Store & User Account Management System

import { globalAuthStore } from './authStore.js';
import { globalLuckEngine } from '../game/luckEngine.js';

export class AdminStore {
  getAllUsers() {
    return globalAuthStore.getUsers();
  }

  createUser(username, password, role = 'PLAYER', avatar = '🎲') {
    return globalAuthStore.register(username, password, avatar, role);
  }

  updateUserCredentials(userId, newUsername, newPassword) {
    const users = globalAuthStore.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      if (newUsername) user.username = newUsername;
      if (newPassword) user.password = newPassword;
      globalAuthStore.saveUsers(users);
      return { success: true };
    }
    return { success: false, error: 'User not found' };
  }

  deleteUser(userId) {
    let users = globalAuthStore.getUsers();
    const target = users.find(u => u.id === userId);
    if (target && target.username === 'GE') {
      return { success: false, error: 'Cannot delete Master GE account' };
    }
    users = users.filter(u => u.id !== userId);
    globalAuthStore.saveUsers(users);
    return { success: true };
  }

  toggleBanUser(userId) {
    const users = globalAuthStore.getUsers();
    const user = users.find(u => u.id === userId);
    if (user && user.username !== 'GE' && user.role !== 'ADMIN') {
      user.banned = !user.banned;
      globalAuthStore.saveUsers(users);
      return true;
    }
    return false;
  }

  resetPassword(userId, newPassword) {
    const users = globalAuthStore.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.password = newPassword;
      globalAuthStore.saveUsers(users);
      return true;
    }
    return false;
  }

  togglePlayerLuck(username, enabled) {
    globalLuckEngine.setPlayerLuck(username, enabled);
  }

  isPlayerLuckEnabled(username) {
    return globalLuckEngine.isLuckEnabled(username);
  }
}

export const globalAdminStore = new AdminStore();
