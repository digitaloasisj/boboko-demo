import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import * as authSvc from '../services/auth';
import { initializeData } from '../services/storage';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  can: (action: string) => boolean;
}

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const u = await authSvc.getSession();
    setUser(u);
  }, []);

  useEffect(() => {
    (async () => {
      await initializeData();
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    const u = await authSvc.login(username, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authSvc.logout();
    setUser(null);
  }, []);

  const can = useCallback((action: string) => authSvc.can(user, action), [user]);

  return (
    <Ctx.Provider value={{ user, loading, login, logout, refresh, can }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
