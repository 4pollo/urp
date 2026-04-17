'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../lib/fetcher';
import type {
  PermissionItem,
  RoleListItem,
  UserListResponse,
} from '../lib/types';

export function useAdminData(
  enabled = true,
  sections: {
    users?: boolean;
    roles?: boolean;
    permissions?: boolean;
  } = {
    users: true,
    roles: true,
    permissions: true,
  },
) {
  const {
    users: includeUsers = true,
    roles: includeRoles = true,
    permissions: includePermissions = true,
  } = sections;
  const [users, setUsers] = useState<UserListResponse | null>(null);
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
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
        const requests: Promise<void>[] = [];

        if (includeUsers) {
          requests.push(
            apiRequest<UserListResponse>(
              `/api/users?page=${page}&limit=${limit}`,
            ).then((result) => {
              setUsers(result.data);
            }),
          );
        } else {
          setUsers(null);
        }

        if (includeRoles) {
          requests.push(
            apiRequest<RoleListItem[]>('/api/roles').then((result) => {
              setRoles(result.data);
            }),
          );
        } else {
          setRoles([]);
        }

        if (includePermissions) {
          requests.push(
            apiRequest<PermissionItem[]>('/api/permissions').then((result) => {
              setPermissions(result.data);
            }),
          );
        } else {
          setPermissions([]);
        }

        await Promise.all(requests);
      } catch (err) {
        setUsers(null);
        setRoles([]);
        setPermissions([]);
        setError(err instanceof Error ? err.message : '加载管理数据失败');
      } finally {
        setLoading(false);
      }
    },
    [enabled, includePermissions, includeRoles, includeUsers],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    users,
    roles,
    permissions,
    loading,
    error,
    reload,
  };
}
