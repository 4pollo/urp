'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ActionState,
  LoadingState,
} from '../../components/common/loading-state';
import { AppShell } from '../../components/layout/app-shell';
import { useMyPermissions } from '../../hooks/use-my-permissions';
import { destroySession, hasSession } from '../../lib/session';
import {
  getAccessibleAdminSections,
  getAuthenticatedNavItems,
} from '../../lib/guards';

export default function AdminPage() {
  const router = useRouter();
  const authenticated = hasSession();
  const { roles, permissions, loading, error, reload } =
    useMyPermissions(authenticated);
  const adminItems = getAccessibleAdminSections(permissions, roles);
  const navItems = getAuthenticatedNavItems(permissions, roles);

  useEffect(() => {
    if (!authenticated) {
      router.replace('/login');
    }
  }, [authenticated, router]);

  useEffect(() => {
    if (!loading && authenticated && !error) {
      if (adminItems.length > 0) {
        router.replace(adminItems[0].href);
        return;
      }

      router.replace('/dashboard');
    }
  }, [adminItems, authenticated, error, loading, router]);

  if (!authenticated) {
    return (
      <AppShell navItems={[]}>
        <LoadingState label="正在跳转到登录页..." />
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell navItems={[]}>
        <LoadingState label="正在确认管理权限..." />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell navItems={[]}>
        <ActionState
          label="无法确认当前权限"
          detail={error}
          actionLabel="重试"
          onAction={() => {
            void reload();
          }}
        />
      </AppShell>
    );
  }

  if (adminItems.length === 0) {
    return (
      <AppShell navItems={[]}>
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

  return (
    <AppShell navItems={navItems}>
      <LoadingState label="正在进入管理后台..." />
    </AppShell>
  );
}
