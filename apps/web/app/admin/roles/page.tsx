'use client';

import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertMessage } from '../../../components/common/alert-message';
import { EmptyState } from '../../../components/common/empty-state';
import {
  ActionState,
  LoadingState,
} from '../../../components/common/loading-state';
import { AdminStats } from '../../../components/admin/admin-stats';
import { ConfirmDialog } from '../../../components/admin/confirm-dialog';
import { RoleEditDialog } from '../../../components/admin/role-edit-dialog';
import { RolesTable } from '../../../components/admin/roles-table';
import { AppShell } from '../../../components/layout/app-shell';
import { Button } from '../../../components/ui/button';
import { useAdminData } from '../../../hooks/use-admin-data';
import { useMyPermissions } from '../../../hooks/use-my-permissions';
import { apiRequest } from '../../../lib/fetcher';
import {
  getAccessibleAdminSections,
  getAuthenticatedNavItems,
} from '../../../lib/guards';
import { destroySession, hasSession } from '../../../lib/session';
import type { RoleDetail, RoleListItem } from '../../../lib/types';

export default function AdminRolesPage() {
  const router = useRouter();
  const authenticated = hasSession();
  const {
    roles: currentRoles,
    permissions: currentPermissions,
    loading: permissionLoading,
    error: permissionError,
    reload: reloadPermissions,
  } = useMyPermissions(authenticated);
  const adminItems = getAccessibleAdminSections(
    currentPermissions,
    currentRoles,
  );
  const navItems = getAuthenticatedNavItems(currentPermissions, currentRoles);
  const canAccess = adminItems.some((item) => item.href === '/admin/roles');
  const { roles, permissions, loading, error, reload } = useAdminData(
    authenticated && canAccess && !permissionLoading,
    { roles: true, permissions: true },
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [createPending, setCreatePending] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleListItem | null>(null);
  const [selectedRoleDetail, setSelectedRoleDetail] =
    useState<RoleDetail | null>(null);
  const [pendingRoleId, setPendingRoleId] = useState<number | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [roleDetailLoading, setRoleDetailLoading] = useState(false);
  const [roleSubmitPending, setRoleSubmitPending] = useState(false);
  const [rolePermissionsSubmitPending, setRolePermissionsSubmitPending] =
    useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!authenticated) {
      router.replace('/login');
    }
  }, [authenticated, router]);

  useEffect(() => {
    if (!permissionLoading && authenticated && !permissionError && !canAccess) {
      if (adminItems.length > 0) {
        router.replace(adminItems[0].href);
        return;
      }

      router.replace('/dashboard');
    }
  }, [
    adminItems,
    authenticated,
    canAccess,
    permissionError,
    permissionLoading,
    router,
  ]);

  const currentPage = roles?.page || 1;
  const currentLimit = roles?.limit || 10;
  const totals = useMemo(
    () => ({
      totalUsers: 0,
      totalRoles: roles?.total || 0,
      totalPermissions: permissions?.total || 0,
    }),
    [permissions?.total, roles?.total],
  );

  async function handleRoleEdit(role: RoleListItem) {
    if (pendingRoleId !== null || roleDetailLoading) {
      return;
    }

    setPendingRoleId(role.id);
    setRoleDetailLoading(true);
    setSelectedRole(role);
    setSelectedRoleDetail(null);
    try {
      const result = await apiRequest<RoleDetail>(`/api/roles/${role.id}`);
      setSelectedRoleDetail(result.data);
    } catch (err) {
      setSelectedRole(null);
      setSelectedRoleDetail(null);
      toast.error(err instanceof Error ? err.message : '加载角色详情失败');
    } finally {
      setRoleDetailLoading(false);
      setPendingRoleId(null);
    }
  }

  async function handleDeleteConfirmed() {
    if (!selectedRole || deletePending) {
      return;
    }

    setDeletePending(true);
    setPendingRoleId(selectedRole.id);
    try {
      await apiRequest<{ message: string }>(`/api/roles/${selectedRole.id}`, {
        method: 'DELETE',
      });
      toast.success('角色删除成功');
      setConfirmOpen(false);
      setSelectedRole(null);
      setSelectedRoleDetail(null);
      const nextPage =
        roles && roles.items.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;
      await reload(nextPage, currentLimit);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletePending(false);
      setPendingRoleId(null);
    }
  }

  async function handleCreateRole(payload: {
    name: string;
    description: string;
  }) {
    if (createPending) return;

    setCreatePending(true);
    try {
      await apiRequest('/api/roles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      toast.success('角色创建成功');
      setCreateOpen(false);
      await reload(currentPage, currentLimit);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建失败');
    } finally {
      setCreatePending(false);
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
      if (selectedRoleDetail) {
        setSelectedRoleDetail({
          ...selectedRoleDetail,
          name: payload.name,
          description: payload.description,
        });
      }
      toast.success('角色更新成功');
      setSelectedRole(null);
      setSelectedRoleDetail(null);
      await reload(currentPage, currentLimit);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失败');
    } finally {
      setRoleSubmitPending(false);
      setPendingRoleId(null);
    }
  }

  async function handleRolePermissionsSubmit(permissionIds: number[]) {
    if (!selectedRole || rolePermissionsSubmitPending) return;

    setRolePermissionsSubmitPending(true);
    setPendingRoleId(selectedRole.id);
    try {
      await apiRequest(`/api/roles/${selectedRole.id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissionIds }),
      });
      setSelectedRoleDetail((current) =>
        current
          ? {
              ...current,
              permissions: (permissions?.items || []).filter((permission) =>
                permissionIds.includes(permission.id),
              ),
            }
          : current,
      );
      toast.success('角色权限更新成功');
      setSelectedRole(null);
      setSelectedRoleDetail(null);
      await reload(currentPage, currentLimit);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失败');
    } finally {
      setRolePermissionsSubmitPending(false);
      setPendingRoleId(null);
    }
  }

  if (!authenticated) {
    return (
      <AppShell navItems={[]}>
        <LoadingState label="正在跳转到登录页..." />
      </AppShell>
    );
  }

  if (permissionLoading) {
    return (
      <AppShell navItems={navItems}>
        <LoadingState label="正在确认管理权限..." />
      </AppShell>
    );
  }

  if (permissionError) {
    return (
      <AppShell navItems={[]}>
        <ActionState
          label="无法确认当前权限"
          detail={permissionError}
          actionLabel="重试"
          onAction={() => {
            void reloadPermissions();
          }}
        />
      </AppShell>
    );
  }

  if (!canAccess) {
    return (
      <AppShell navItems={[]}>
        <ActionState
          label="当前账号没有角色管理权限"
          detail="系统将返回可访问的管理页面。"
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
      <AppShell navItems={navItems}>
        <LoadingState label="正在加载角色数据..." />
      </AppShell>
    );
  }

  return (
    <AppShell navItems={navItems}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="page-title">角色管理</h1>
            <p className="mt-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
              管理角色定义与角色权限分配
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新增角色
            </Button>
          </div>
        </div>

        {error ? (
          <AlertMessage
            type="error"
            message="加载角色管理数据失败"
            detail={error}
            actionLabel="重试"
            onAction={() => {
              void reload(currentPage, currentLimit);
            }}
          />
        ) : null}

        <AdminStats {...totals} />

        {roles?.items.length ? (
          <RolesTable
            roles={roles.items}
            page={roles.page}
            total={roles.total}
            limit={roles.limit}
            pendingRoleId={pendingRoleId}
            onPageChange={(page) => {
              void reload(page, currentLimit);
            }}
            onEdit={(role) => {
              void handleRoleEdit(role);
            }}
            onDelete={(role) => {
              if (pendingRoleId !== null) {
                return;
              }
              setSelectedRole(role);
              setSelectedRoleDetail(null);
              setConfirmOpen(true);
            }}
          />
        ) : (
          <EmptyState label="暂无角色" />
        )}

        <ConfirmDialog
          open={confirmOpen}
          pending={deletePending}
          onOpenChange={(open) => {
            setConfirmOpen(open);
            if (!open) {
              setSelectedRole(null);
              setSelectedRoleDetail(null);
            }
          }}
          title="确认操作"
          description={
            selectedRole
              ? `确定要删除角色 “${selectedRole.name}” 吗？此操作不可恢复。`
              : '确定要继续吗？'
          }
          confirmLabel="确认"
          onConfirm={() => {
            void handleDeleteConfirmed();
          }}
        />

        <RoleEditDialog
          role={null}
          roleDetail={null}
          permissions={permissions?.items || []}
          open={createOpen}
          mode="create"
          pending={createPending}
          onOpenChange={setCreateOpen}
          onSubmit={(payload) => {
            void handleCreateRole(payload);
          }}
          onPermissionsSubmit={() => undefined}
        />

        <RoleEditDialog
          role={selectedRole}
          roleDetail={selectedRoleDetail}
          permissions={permissions?.items || []}
          open={Boolean(selectedRole) && !confirmOpen}
          mode="edit"
          detailLoading={roleDetailLoading}
          pending={roleSubmitPending}
          permissionPending={rolePermissionsSubmitPending}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedRole(null);
              setSelectedRoleDetail(null);
            }
          }}
          onSubmit={(payload) => {
            void handleRoleSubmit(payload);
          }}
          onPermissionsSubmit={(permissionIds) => {
            void handleRolePermissionsSubmit(permissionIds);
          }}
        />
      </div>
    </AppShell>
  );
}
