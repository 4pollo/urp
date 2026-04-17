'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../lib/fetcher';
import type {
  PermissionItem,
  RoleListItem,
  UserListResponse,
} from '../lib/types';

export function useAdminData(enabled = true) {
  const [users, setUsers] = useState<UserListResponse | null>(null);
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(
    async (page = 1, limit = 10) => {
      if (!enabled) {
        setUsers(null);
        setRoles([]);
        setPermissions([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [usersResult, rolesResult, permissionsResult] = await Promise.all([
          apiRequest<UserListResponse>(`/api/users?page=${page}&limit=${limit}`),
          apiRequest<RoleListItem[]>('/api/roles'),
          apiRequest<PermissionItem[]>('/api/permissions'),
        ]);

        setUsers(usersResult.data);
        setRoles(rolesResult.data);
        setPermissions(permissionsResult.data);
      } catch (err) {
        setUsers(null);
        setRoles([]);
        setPermissions([]);
        setError(err instanceof Error ? err.message : '加载管理数据失败');
      } finally {
        setLoading(false);
      }
    },
    [enabled],
  );

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  return {
    users,
    roles,
    permissions,
    loading,
    error,
    reload: loadAll,
  };
}
