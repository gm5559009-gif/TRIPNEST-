import { createContext, useContext, useMemo, useState } from 'react';
import {
  authenticate,
  clearSession,
  getSession,
  registerUser,
  saveSession,
} from '../lib/storage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession());

  function login(email, password) {
    const signedInUser = authenticate(email, password);
    saveSession(signedInUser);
    setUser(signedInUser);
    return signedInUser;
  }

  function signup(details) {
    const newUser = registerUser(details);
    saveSession(newUser);
    setUser(newUser);
    return newUser;
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, signup, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
