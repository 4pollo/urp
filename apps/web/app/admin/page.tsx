'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertMessage } from '../../components/common/alert-message';
import { EmptyState } from '../../components/common/empty-state';
import {
  ActionState,
  LoadingState,
} from '../../components/common/loading-state';
import { AdminStats } from '../../components/admin/admin-stats';
import { ConfirmDialog } from '../../components/admin/confirm-dialog';
import { PermissionEditDialog } from '../../components/admin/permission-edit-dialog';
import { PermissionsTable } from '../../components/admin/permissions-table';
import { RoleEditDialog } from '../../components/admin/role-edit-dialog';
import { RolesTable } from '../../components/admin/roles-table';
import { UsersTable } from '../../components/admin/users-table';
import { AppShell } from '../../components/layout/app-shell';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { useAdminData } from '../../hooks/use-admin-data';
import { useMyPermissions } from '../../hooks/use-my-permissions';
import { apiRequest } from '../../lib/fetcher';
import { isSuperAdmin } from '../../lib/guards';
import { destroySession, hasSession } from '../../lib/session';
import type {
  PermissionItem,
  RoleListItem,
  UserListItem,
} from '../../lib/types';

export default function AdminPage() {
  const router = useRouter();
  const authenticated = hasSession();
  const {
    roles: currentRoles,
    loading: permissionsLoading,
    error: permissionsError,
    reload: reloadPermissions,
  } = useMyPermissions(authenticated);
  const superAdmin = isSuperAdmin(currentRoles);
  const { users, roles, permissions, loading, error, reload } = useAdminData(
    authenticated && superAdmin && !permissionsLoading,
  );
  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleListItem | null>(null);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionItem | null>(null);
  const [confirmMode, setConfirmMode] = useState<
    'delete-user' | 'delete-role' | 'delete-permission' | null
  >(null);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [pendingRoleId, setPendingRoleId] = useState<number | null>(null);
  const [pendingPermissionId, setPendingPermissionId] = useState<number | null>(
    null,
  );
  const [deletePending, setDeletePending] = useState(false);
  const [roleSubmitPending, setRoleSubmitPending] = useState(false);
  const [permissionSubmitPending, setPermissionSubmitPending] = useState(false);

  useEffect(() => {
    if (!authenticated) {
      router.replace('/login');
    }
  }, [authenticated, router]);

  useEffect(() => {
    if (
      !permissionsLoading &&
      authenticated &&
      !permissionsError &&
      !superAdmin
    ) {
      router.replace('/dashboard');
    }
  }, [authenticated, permissionsError, permissionsLoading, router, superAdmin]);

  const currentPage = users?.page || 1;
  const currentLimit = users?.limit || 10;

  const totals = useMemo(
    () => ({
      totalUsers: users?.total || 0,
      totalRoles: roles.length,
      totalPermissions: permissions.length,
    }),
    [permissions.length, roles.length, users?.total],
  );

  async function handleToggleUserStatus(user: UserListItem) {
    if (pendingUserId !== null) {
      return;
    }

    const nextStatus = user.status === 'active' ? 'frozen' : 'active';
    setPendingUserId(user.id);
    try {
      await apiRequest<{ message: string }>(`/api/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      setStatusMessage({ type: 'success', message: '用户状态更新成功' });
      await reload(currentPage, currentLimit);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        message: err instanceof Error ? err.message : '操作失败',
      });
    } finally {
      setPendingUserId(null);
    }
  }

  async function handlePageChange(page: number) {
    if (page === currentPage || page < 1) {
      return;
    }

    await reload(page, currentLimit);
  }

  async function handleDeleteConfirmed() {
    if (deletePending) {
      return;
    }

    setDeletePending(true);
    try {
      if (confirmMode === 'delete-user' && selectedUser) {
        setPendingUserId(selectedUser.id);
        await apiRequest<{ message: string }>(`/api/users/${selectedUser.id}`, {
          method: 'DELETE',
        });
        setStatusMessage({ type: 'success', message: '用户删除成功' });
      }

      if (confirmMode === 'delete-role' && selectedRole) {
        setPendingRoleId(selectedRole.id);
        await apiRequest<{ message: string }>(`/api/roles/${selectedRole.id}`, {
          method: 'DELETE',
        });
        setStatusMessage({ type: 'success', message: '角色删除成功' });
      }

      if (confirmMode === 'delete-permission' && selectedPermission) {
        setPendingPermissionId(selectedPermission.id);
        await apiRequest<{ message: string }>(
          `/api/permissions/${selectedPermission.id}`,
          { method: 'DELETE' },
        );
        setStatusMessage({ type: 'success', message: '权限删除成功' });
      }

      setConfirmMode(null);
      setSelectedUser(null);
      setSelectedRole(null);
      setSelectedPermission(null);
      await reload(currentPage, currentLimit);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        message: err instanceof Error ? err.message : '删除失败',
      });
    } finally {
      setDeletePending(false);
      setPendingUserId(null);
      setPendingRoleId(null);
      setPendingPermissionId(null);
    }
  }

  async function handleRoleSubmit(payload: {
    name: string;
    description: string;
  }) {
    if (!selectedRole || roleSubmitPending) return;

    setRoleSubmitPending(true);
    setPendingRoleId(selectedRole.id);
    try {
      await apiRequest(`/api/roles/${selectedRole.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setSelectedRole(null);
      setStatusMessage({ type: 'success', message: '角色更新成功' });
      await reload(currentPage, currentLimit);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        message: err instanceof Error ? err.message : '更新失败',
      });
    } finally {
      setRoleSubmitPending(false);
      setPendingRoleId(null);
    }
  }

  async function handlePermissionSubmit(payload: {
    key: string;
    group: string;
    description: string;
  }) {
    if (!selectedPermission || permissionSubmitPending) return;

    setPermissionSubmitPending(true);
    setPendingPermissionId(selectedPermission.id);
    try {
      await apiRequest(`/api/permissions/${selectedPermission.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setSelectedPermission(null);
      setStatusMessage({ type: 'success', message: '权限更新成功' });
      await reload(currentPage, currentLimit);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        message: err instanceof Error ? err.message : '更新失败',
      });
    } finally {
      setPermissionSubmitPending(false);
      setPendingPermissionId(null);
    }
  }

  if (!authenticated) {
    return (
      <AppShell showAdmin={false}>
        <LoadingState label="正在跳转到登录页..." />
      </AppShell>
    );
  }

  if (permissionsLoading) {
    return (
      <AppShell showAdmin={false}>
        <LoadingState label="正在确认管理权限..." />
      </AppShell>
    );
  }

  if (permissionsError) {
    return (
      <AppShell showAdmin={false}>
        <ActionState
          label="无法确认当前权限"
          detail={permissionsError}
          actionLabel="重试"
          onAction={() => {
            void reloadPermissions();
          }}
        />
      </AppShell>
    );
  }

  if (!superAdmin) {
    return (
      <AppShell showAdmin={false}>
        <ActionState
          label="当前账号没有管理权限"
          detail="系统将返回用户面板。"
          actionLabel="返回登录"
          onAction={() => {
            destroySession();
            router.replace('/login');
          }}
        />
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell showAdmin>
        <LoadingState label="正在加载管理数据..." />
      </AppShell>
    );
  }

  return (
    <AppShell showAdmin>
      <div className="mb-12">
        <h1 className="page-title">管理面板</h1>
        <p className="mt-2 text-xs uppercase tracking-[0.05em] text-[var(--foreground-tertiary)]">
          管理用户、角色和权限
        </p>
      </div>

      {statusMessage ? (
        <AlertMessage
          type={statusMessage.type}
          message={statusMessage.message}
        />
      ) : null}
      {error ? (
        <AlertMessage
          type="error"
          message="加载管理数据失败"
          detail={error}
          actionLabel="重试"
          onAction={() => {
            void reload(currentPage, currentLimit);
          }}
        />
      ) : null}

      <div className="space-y-6">
        <AdminStats {...totals} />

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="roles">角色管理</TabsTrigger>
            <TabsTrigger value="permissions">权限管理</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {users?.items.length ? (
              <UsersTable
                users={users.items}
                page={users.page}
                total={users.total}
                limit={users.limit}
                pendingUserId={pendingUserId}
                onPageChange={(page) => {
                  void handlePageChange(page);
                }}
                onToggleStatus={(user) => {
                  void handleToggleUserStatus(user);
                }}
                onDelete={(user) => {
                  if (pendingUserId !== null) {
                    return;
                  }
                  setSelectedUser(user);
                  setConfirmMode('delete-user');
                }}
              />
            ) : (
              <EmptyState label="暂无用户" />
            )}
          </TabsContent>

          <TabsContent value="roles">
            {roles.length ? (
              <RolesTable
                roles={roles}
                pendingRoleId={pendingRoleId}
                onEdit={(role) => {
                  if (pendingRoleId !== null) {
                    return;
                  }
                  setSelectedRole(role);
                }}
                onDelete={(role) => {
                  if (pendingRoleId !== null) {
                    return;
                  }
                  setSelectedRole(role);
                  setConfirmMode('delete-role');
                }}
              />
            ) : (
              <EmptyState label="暂无角色" />
            )}
          </TabsContent>

          <TabsContent value="permissions">
            {permissions.length ? (
              <PermissionsTable
                permissions={permissions}
                pendingPermissionId={pendingPermissionId}
                onEdit={(permission) => {
                  if (pendingPermissionId !== null) {
                    return;
                  }
                  setSelectedPermission(permission);
                }}
                onDelete={(permission) => {
                  if (pendingPermissionId !== null) {
                    return;
                  }
                  setSelectedPermission(permission);
                  setConfirmMode('delete-permission');
                }}
              />
            ) : (
              <EmptyState label="暂无权限" />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={confirmMode !== null}
        pending={deletePending}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmMode(null);
            setSelectedUser(null);
            setSelectedRole(null);
            setSelectedPermission(null);
          }
        }}
        title="确认操作"
        description={
          confirmMode === 'delete-user' && selectedUser
            ? `确定要删除用户 “${selectedUser.email}” 吗？此操作不可恢复。`
            : confirmMode === 'delete-role' && selectedRole
              ? `确定要删除角色 “${selectedRole.name}” 吗？此操作不可恢复。`
              : confirmMode === 'delete-permission' && selectedPermission
                ? `确定要删除权限 “${selectedPermission.key}” 吗？此操作不可恢复。`
                : '确定要继续吗？'
        }
        confirmLabel="确认"
        onConfirm={() => {
          void handleDeleteConfirmed();
        }}
      />

      <RoleEditDialog
        role={selectedRole}
        open={Boolean(selectedRole) && confirmMode !== 'delete-role'}
        pending={roleSubmitPending}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRole(null);
          }
        }}
        onSubmit={(payload) => {
          void handleRoleSubmit(payload);
        }}
      />

      <PermissionEditDialog
        permission={selectedPermission}
        open={
          Boolean(selectedPermission) && confirmMode !== 'delete-permission'
        }
        pending={permissionSubmitPending}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPermission(null);
          }
        }}
        onSubmit={(payload) => {
          void handlePermissionSubmit(payload);
        }}
      />
    </AppShell>
  );
}
