'use client';

import { ShieldCheck } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AlertMessage } from '../../components/common/alert-message';
import {
  ActionState,
  LoadingState,
} from '../../components/common/loading-state';
import { PermissionListCard } from '../../components/dashboard/permission-list-card';
import { RoleListCard } from '../../components/dashboard/role-list-card';
import { UserSummaryCard } from '../../components/dashboard/user-summary-card';
import { AppShell } from '../../components/layout/app-shell';
import { Badge } from '../../components/ui/badge';
import { useCurrentUser } from '../../hooks/use-current-user';
import { useMyPermissions } from '../../hooks/use-my-permissions';
import { getAuthenticatedNavItems } from '../../lib/guards';
import { destroySession, hasSession } from '../../lib/session';

export default function DashboardPage() {
  const router = useRouter();
  const authenticated = hasSession();
  const {
    user,
    loading: userLoading,
    error: userError,
    reload: reloadUser,
  } = useCurrentUser(authenticated);
  const {
    roles,
    permissions,
    loading: permissionsLoading,
    error: permissionsError,
    reload: reloadPermissions,
  } = useMyPermissions(authenticated);

  useEffect(() => {
    if (!authenticated) {
      router.replace('/login');
    }
  }, [authenticated, router]);

  const loading = userLoading || permissionsLoading;
  const error = userError || permissionsError;
  const navItems = getAuthenticatedNavItems(permissions, roles);

  const retry = useMemo(
    () => () => {
      void reloadUser();
      void reloadPermissions();
    },
    [reloadPermissions, reloadUser],
  );

  if (!authenticated) {
    return (
      <AppShell navItems={[]}>
        <LoadingState label="正在跳转到登录页..." />
      </AppShell>
    );
  }

  return (
    <AppShell navItems={navItems}>
      <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title">用户面板</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
            查看您的账户信息和权限
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 px-3 py-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            {permissions.length} 项权限
          </Badge>
        </div>
      </div>

      {error ? (
        <AlertMessage
          type="error"
          message="加载用户面板失败"
          detail={error}
          actionLabel="重试"
          onAction={retry}
        />
      ) : null}

      {loading ? (
        <LoadingState label="正在加载用户信息..." />
      ) : !user ? (
        <ActionState
          label="无法读取当前会话"
          detail="当前登录状态已失效，请重新登录后再试。"
          actionLabel="返回登录"
          onAction={() => {
            destroySession();
            router.replace('/login');
          }}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <UserSummaryCard
              email={user.email}
              status={user.status}
              lastLoginAt={user.lastLoginAt}
            />
            <RoleListCard roles={user.roles || []} />
          </div>
          <PermissionListCard permissions={permissions} />
        </div>
      )}
    </AppShell>
  );
}
