/**
 * auth.js — Session management (login, logout, route protection).
 */
const NxgoAuth = (function () {
  'use strict';

  const SESSION_KEY = 'nxgo_session';

  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    }));
  }

  function refreshSession() {
    const session = getSession();
    if (!session) return;
    const user = NxgoDB.getUserById(session.user_id);
    if (user) setSession(user);
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function login(email, password) {
    const user = NxgoDB.getUserByEmail(email);
    if (!user) return { error: 'No account found with that email.' };
    if (user.password !== password) return { error: 'Incorrect password.' };
    setSession(user);
    return { user };
  }

  function register({ username, email, password }) {
    if (!username || !email || !password) {
      return { error: 'All fields are required.' };
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }
    const result = NxgoDB.createUser({ username, email, password, role: 'traveler' });
    if (result.error) return result;
    setSession(result.user);
    return { user: result.user };
  }

  function logout() {
    clearSession();
    window.location.href = 'index.html';
  }

  function isLoggedIn() {
    return getSession() !== null;
  }

  function isAdmin() {
    const s = getSession();
    return s && s.role === 'admin';
  }

  function getCurrentUser() {
    const session = getSession();
    if (!session) return null;
    return NxgoDB.getUserById(session.user_id);
  }

  /** Redirect to login if not authenticated */
  function requireAuth(redirectTo) {
    if (!isLoggedIn()) {
      window.location.href = redirectTo || 'login.html';
      return false;
    }
    return true;
  }

  /** Redirect to login if not admin */
  function requireAdmin() {
    if (!isLoggedIn() || !isAdmin()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  return {
    getSession,
    login,
    register,
    logout,
    isLoggedIn,
    isAdmin,
    getCurrentUser,
    requireAuth,
    requireAdmin,
    refreshSession
  };
})();
