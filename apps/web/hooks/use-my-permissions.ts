'use client';

import { useCallback, useEffect, useState } from 'react';
import { getMyPermissions } from '../lib/auth';

export function useMyPermissions(enabled = true) {
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await getMyPermissions();
      setRoles(result.roles || []);
      setPermissions(result.permissions || []);
      setError(null);
    } catch (err) {
      setRoles([]);
      setPermissions([]);
      setError(err instanceof Error ? err.message : '获取权限失败');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { roles, permissions, loading, error, reload };
}
