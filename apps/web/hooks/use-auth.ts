'use client';

import { useCallback, useEffect, useState } from 'react';
import { login, register } from '../lib/auth';
import {
  destroySession,
  getInitialUser,
  hasSession,
  hydrateSession,
} from '../lib/session';
import type { AuthUser } from '../lib/types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser());
  const [isAuthenticated, setIsAuthenticated] = useState(hasSession());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(hasSession());
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
      const session = await hydrateSession();
      setUser(session.user);
      setIsAuthenticated(true);
      return session;
    } catch (err) {
      destroySession();
      setUser(null);
      setIsAuthenticated(false);
      const message = err instanceof Error ? err.message : '登录失败';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleRegister = useCallback(
    async (email: string, password: string) => {
      setIsSubmitting(true);
      setError(null);
      try {
        await register(email.trim(), password);
        const session = await hydrateSession();
        setUser(session.user);
        setIsAuthenticated(true);
        return session;
      } catch (err) {
        destroySession();
        setUser(null);
        setIsAuthenticated(false);
        const message = err instanceof Error ? err.message : '注册失败';
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    destroySession();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    isAuthenticated,
    isSubmitting,
    error,
    setError,
    setUser,
    login: handleLogin,
    register: handleRegister,
    logout,
  };
}
