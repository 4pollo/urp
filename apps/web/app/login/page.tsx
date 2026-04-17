'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '../../components/auth/login-form';
import { AuthShell } from '../../components/layout/auth-shell';
import { LoadingState } from '../../components/common/loading-state';
import { hasSession } from '../../lib/session';

export default function LoginPage() {
  const router = useRouter();
  const authenticated = hasSession();

  useEffect(() => {
    if (authenticated) {
      router.replace('/dashboard');
    }
  }, [authenticated, router]);

  return (
    <AuthShell title="登录" subtitle="访问您的账户">
      {authenticated ? (
        <LoadingState label="正在跳转到用户面板..." />
      ) : (
        <LoginForm />
      )}
    </AuthShell>
  );
}
