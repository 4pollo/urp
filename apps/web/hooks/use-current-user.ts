'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCurrentUser } from '../lib/auth';
import type { AuthUser } from '../lib/types';

export function useCurrentUser(enabled = true) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const nextUser = await getCurrentUser();
      setUser(nextUser);
      setError(null);
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : '获取用户失败');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { user, setUser, loading, error, reload };
}
