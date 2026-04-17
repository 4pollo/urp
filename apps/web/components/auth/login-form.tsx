'use client';

import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/use-auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function LoginForm() {
  const router = useRouter();
  const { login, setError, isSubmitting } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const emailValue = formData.get('email');
    const passwordValue = formData.get('password');
    const email = typeof emailValue === 'string' ? emailValue : '';
    const password = typeof passwordValue === 'string' ? passwordValue : '';

    try {
      await login(email, password);
      toast.success('登录成功，正在跳转...');
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '登录失败');
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--auth-form-muted)]">
            邮箱地址
          </label>
          <Input
            name="email"
            type="email"
            placeholder="your@email.com"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--auth-form-muted)]">
            密码
          </label>
          <div className="relative">
            <Input
              className="pr-11"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="输入密码"
              required
              autoComplete="current-password"
            />
            <button
              className="absolute right-2 top-1/2 z-10 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center text-[var(--auth-form-muted)] transition-colors hover:text-[var(--auth-form-foreground)]"
              type="button"
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>
      <Button
        className="w-full border-[var(--auth-form-foreground)] bg-[var(--auth-form-foreground)] text-[var(--auth-form-background)] hover:bg-[var(--foreground-secondary)]"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? '登录中...' : '登录'}
      </Button>
      <div className="pt-2 text-center text-xs text-[var(--auth-form-muted)]">
        还没有账号？{' '}
        <Link
          className="border-b border-[var(--auth-form-link-border)] text-[var(--auth-form-foreground)]"
          href="/register"
        >
          立即注册
        </Link>
      </div>
    </form>
  );
}
