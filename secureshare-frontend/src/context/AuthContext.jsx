import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { clearAuthSession, getAccessToken, getCurrentUserFromStorage, saveAuthSession } from '../utils/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUserFromStorage());
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()));
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    if (!getAccessToken()) { setIsAuthLoading(false); return; }
    try {
      const response = await authApi.me();
      setUser(response.user);
      setIsAuthenticated(true);
      saveAuthSession({ user: response.user });
    } catch {
      clearAuthSession(); setUser(null); setIsAuthenticated(false);
    } finally { setIsAuthLoading(false); }
  }, []);

  useEffect(() => { loadCurrentUser(); }, [loadCurrentUser]);

  const login = async (payload) => {
    const response = await authApi.login(payload);
    saveAuthSession(response);
    setUser(response.user);
    setIsAuthenticated(true);
    toast.success('Logged in successfully');
    return response;
  };
  const register = async (payload) => {
    const response = await authApi.register(payload);
    toast.success('Registration successful. Please verify your email.');
    return response;
  };
  const logout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuthSession(); setUser(null); setIsAuthenticated(false); toast.success('Logged out');
  };

  const value = useMemo(() => ({ user, setUser, isAuthenticated, isAuthLoading, login, register, logout, loadCurrentUser }), [user, isAuthenticated, isAuthLoading, loadCurrentUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
