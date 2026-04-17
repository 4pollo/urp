'use client';

import { ShieldCheck } from 'lucide-react';
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
import { Badge } from '../../../components/ui/badge';
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

  const totals = useMemo(
    () => ({
      totalUsers: 0,
      totalRoles: 0,
      totalPermissions: permissions.length,
    }),
    [permissions.length],
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
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletePending(false);
      setPendingPermissionId(null);
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
      await reload();
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
          <Badge variant="outline" className="gap-1.5 px-3 py-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            {totals.totalPermissions} 权限
          </Badge>
        </div>

        {error ? (
          <AlertMessage
            type="error"
            message="加载权限管理数据失败"
            detail={error}
            actionLabel="重试"
            onAction={() => {
              void reload();
            }}
          />
        ) : null}

        <AdminStats {...totals} />

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
          permission={selectedPermission}
          open={Boolean(selectedPermission) && !confirmOpen}
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
