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
import { PermissionEditDialog } from '../../../components/admin/permission-edit-dialog';
import { PermissionsTable } from '../../../components/admin/permissions-table';
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
import type { PermissionItem } from '../../../lib/types';

export default function AdminPermissionsPage() {
  const router = useRouter();
  const authenticated = hasSession();
  const {
    roles,
    permissions: currentPermissions,
    loading: permissionLoading,
    error: permissionError,
    reload: reloadPermissions,
  } = useMyPermissions(authenticated);
  const adminItems = getAccessibleAdminSections(currentPermissions, roles);
  const navItems = getAuthenticatedNavItems(currentPermissions, roles);
  const canAccess = adminItems.some(
    (item) => item.href === '/admin/permissions',
  );
  const { permissions, loading, error, reload } = useAdminData(
    authenticated && canAccess && !permissionLoading,
    { permissions: true },
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [createPending, setCreatePending] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionItem | null>(null);
  const [pendingPermissionId, setPendingPermissionId] = useState<number | null>(
    null,
  );
  const [deletePending, setDeletePending] = useState(false);
  const [permissionSubmitPending, setPermissionSubmitPending] = useState(false);
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

  const currentPage = permissions?.page || 1;
  const currentLimit = permissions?.limit || 10;
  const totals = useMemo(
    () => ({
      totalUsers: 0,
      totalRoles: 0,
      totalPermissions: permissions?.total || 0,
    }),
    [permissions?.total],
  );

  async function handleDeleteConfirmed() {
    if (!selectedPermission || deletePending) {
      return;
    }

    setDeletePending(true);
    setPendingPermissionId(selectedPermission.id);
    try {
      await apiRequest<{ message: string }>(
        `/api/permissions/${selectedPermission.id}`,
        { method: 'DELETE' },
      );
      toast.success('权限删除成功');
      setConfirmOpen(false);
      setSelectedPermission(null);
      const nextPage =
        permissions && permissions.items.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;
      await reload(nextPage, currentLimit);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletePending(false);
      setPendingPermissionId(null);
    }
  }

  async function handleCreatePermission(payload: {
    key: string;
    group: string;
    description: string;
  }) {
    if (createPending) return;

    setCreatePending(true);
    try {
      await apiRequest('/api/permissions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      toast.success('权限创建成功');
      setCreateOpen(false);
      await reload(currentPage, currentLimit);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建失败');
    } finally {
      setCreatePending(false);
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
      toast.success('权限更新成功');
      await reload(currentPage, currentLimit);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失败');
    } finally {
      setPermissionSubmitPending(false);
      setPendingPermissionId(null);
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
          label="当前账号没有权限管理权限"
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
        <LoadingState label="正在加载权限数据..." />
      </AppShell>
    );
  }

  return (
    <AppShell navItems={navItems}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="page-title">权限管理</h1>
            <p className="mt-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
              管理权限标识、分组与描述
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新增权限
            </Button>
          </div>
        </div>

        {error ? (
          <AlertMessage
            type="error"
            message="加载权限管理数据失败"
            detail={error}
            actionLabel="重试"
            onAction={() => {
              void reload(currentPage, currentLimit);
            }}
          />
        ) : null}

        <AdminStats {...totals} />

        {permissions?.items.length ? (
          <PermissionsTable
            permissions={permissions.items}
            page={permissions.page}
            total={permissions.total}
            limit={permissions.limit}
            pendingPermissionId={pendingPermissionId}
            onPageChange={(page) => {
              void reload(page, currentLimit);
            }}
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
              setConfirmOpen(true);
            }}
          />
        ) : (
          <EmptyState label="暂无权限" />
        )}

        <ConfirmDialog
          open={confirmOpen}
          pending={deletePending}
          onOpenChange={(open) => {
            setConfirmOpen(open);
            if (!open) {
              setSelectedPermission(null);
            }
          }}
          title="确认操作"
          description={
            selectedPermission
              ? `确定要删除权限 “${selectedPermission.key}” 吗？此操作不可恢复。`
              : '确定要继续吗？'
          }
          confirmLabel="确认"
          onConfirm={() => {
            void handleDeleteConfirmed();
          }}
        />

        <PermissionEditDialog
          permission={null}
          open={createOpen}
          mode="create"
          pending={createPending}
          onOpenChange={setCreateOpen}
          onSubmit={(payload) => {
            void handleCreatePermission(payload);
          }}
        />

        <PermissionEditDialog
          permission={selectedPermission}
          open={Boolean(selectedPermission) && !confirmOpen}
          mode="edit"
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
      </div>
    </AppShell>
  );
}
