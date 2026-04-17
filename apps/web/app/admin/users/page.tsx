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
import { UsersTable } from '../../../components/admin/users-table';
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
import type { UserListItem } from '../../../lib/types';

export default function AdminUsersPage() {
  const router = useRouter();
  const authenticated = hasSession();
  const {
    roles,
    permissions,
    loading: permissionLoading,
    error: permissionError,
    reload: reloadPermissions,
  } = useMyPermissions(authenticated);
  const adminItems = getAccessibleAdminSections(permissions, roles);
  const navItems = getAuthenticatedNavItems(permissions, roles);
  const canAccess = adminItems.some((item) => item.href === '/admin/users');
  const { users, loading, error, reload } = useAdminData(
    authenticated && canAccess && !permissionLoading,
    { users: true },
  );
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [deletePending, setDeletePending] = useState(false);

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

  const currentPage = users?.page || 1;
  const currentLimit = users?.limit || 10;
  const totals = useMemo(
    () => ({
      totalUsers: users?.total || 0,
      totalRoles: 0,
      totalPermissions: 0,
    }),
    [users?.total],
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
      toast.success('用户状态更新成功');
      await reload(currentPage, currentLimit);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败');
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleDeleteConfirmed() {
    if (!selectedUser || deletePending) {
      return;
    }

    setDeletePending(true);
    setPendingUserId(selectedUser.id);

    try {
      await apiRequest<{ message: string }>(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      toast.success('用户删除成功');
      setSelectedUser(null);
      await reload(currentPage, currentLimit);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletePending(false);
      setPendingUserId(null);
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
          label="当前账号没有用户管理权限"
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
        <LoadingState label="正在加载用户数据..." />
      </AppShell>
    );
  }

  return (
    <AppShell navItems={navItems}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="page-title">用户管理</h1>
            <p className="mt-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
              管理系统用户、状态与分页列表
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 px-3 py-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            {totals.totalUsers} 用户
          </Badge>
        </div>

        {error ? (
          <AlertMessage
            type="error"
            message="加载用户管理数据失败"
            detail={error}
            actionLabel="重试"
            onAction={() => {
              void reload(currentPage, currentLimit);
            }}
          />
        ) : null}

        <AdminStats {...totals} />

        {users?.items.length ? (
          <UsersTable
            users={users.items}
            page={users.page}
            total={users.total}
            limit={users.limit}
            pendingUserId={pendingUserId}
            onPageChange={(page) => {
              void reload(page, currentLimit);
            }}
            onToggleStatus={(user) => {
              void handleToggleUserStatus(user);
            }}
            onDelete={(user) => {
              if (pendingUserId !== null) {
                return;
              }
              setSelectedUser(user);
            }}
          />
        ) : (
          <EmptyState label="暂无用户" />
        )}

        <ConfirmDialog
          open={Boolean(selectedUser)}
          pending={deletePending}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedUser(null);
            }
          }}
          title="确认操作"
          description={
            selectedUser
              ? `确定要删除用户 “${selectedUser.email}” 吗？此操作不可恢复。`
              : '确定要继续吗？'
          }
          confirmLabel="确认"
          onConfirm={() => {
            void handleDeleteConfirmed();
          }}
        />
      </div>
    </AppShell>
  );
}
