'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../lib/fetcher';
import type {
  PermissionItem,
  PermissionListResponse,
  RoleListItem,
  RoleListResponse,
  UserListResponse,
} from '../lib/types';

function normalizeRolesResponse(
  data: RoleListResponse | RoleListItem[],
  page: number,
  limit: number,
): RoleListResponse {
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page,
      limit,
    };
  }

  return data;
}

function normalizePermissionsResponse(
  data: PermissionListResponse | PermissionItem[],
  page: number,
  limit: number,
): PermissionListResponse {
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page,
      limit,
    };
  }

  return data;
}

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
  const [roles, setRoles] = useState<RoleListResponse | null>(null);
  const [permissions, setPermissions] = useState<PermissionListResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
    async (page = 1, limit = 10) => {
      if (!enabled) {
        setUsers(null);
        setRoles(null);
        setPermissions(null);
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
            apiRequest<RoleListResponse | RoleListItem[]>(
              `/api/roles?page=${page}&limit=${limit}`,
            ).then((result) => {
              setRoles(normalizeRolesResponse(result.data, page, limit));
            }),
          );
        } else {
          setRoles(null);
        }

        if (includePermissions) {
          requests.push(
            apiRequest<PermissionListResponse | PermissionItem[]>(
              `/api/permissions?page=${page}&limit=${limit}`,
            ).then((result) => {
              setPermissions(
                normalizePermissionsResponse(result.data, page, limit),
              );
            }),
          );
        } else {
          setPermissions(null);
        }

        await Promise.all(requests);
      } catch (err) {
        setUsers(null);
        setRoles(null);
        setPermissions(null);
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
