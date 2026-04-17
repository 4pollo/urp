'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '../../components/auth/register-form';
import { AuthShell } from '../../components/layout/auth-shell';
import { LoadingState } from '../../components/common/loading-state';
import { hasSession } from '../../lib/session';

export default function RegisterPage() {
  const router = useRouter();
  const authenticated = hasSession();

  useEffect(() => {
    if (authenticated) {
      router.replace('/dashboard');
    }
  }, [authenticated, router]);

  return (
    <AuthShell title="注册" subtitle="创建新账号">
      {authenticated ? (
        <LoadingState label="正在跳转到用户面板..." />
      ) : (
        <RegisterForm />
      )}
    </AuthShell>
  );
}
