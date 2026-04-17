'use client';

import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/use-auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function RegisterForm() {
  const router = useRouter();
  const { register, isSubmitting, setError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const emailValue = formData.get('email');
    const passwordValue = formData.get('password');
    const confirmPasswordValue = formData.get('confirmPassword');
    const email = typeof emailValue === 'string' ? emailValue : '';
    const password = typeof passwordValue === 'string' ? passwordValue : '';
    const confirmPassword =
      typeof confirmPasswordValue === 'string' ? confirmPasswordValue : '';

    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      toast.error('密码长度至少为 6 位');
      return;
    }

    try {
      await register(email, password);
      toast.success('注册成功，正在跳转...');
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '注册失败');
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
              placeholder="至少 6 位字符"
              required
              minLength={6}
              autoComplete="new-password"
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
          <div className="text-[11px] text-[var(--auth-form-muted)]">
            密码长度至少为 6 位
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--auth-form-muted)]">
            确认密码
          </label>
          <div className="relative">
            <Input
              className="pr-11"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="再次输入密码"
              required
              autoComplete="new-password"
            />
            <button
              className="absolute right-2 top-1/2 z-10 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center text-[var(--auth-form-muted)] transition-colors hover:text-[var(--auth-form-foreground)]"
              type="button"
              aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setShowConfirmPassword((value) => !value)}
            >
              {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>
      <Button
        className="w-full border-[var(--auth-form-foreground)] bg-[var(--auth-form-foreground)] text-[var(--auth-form-background)] hover:bg-[var(--foreground-secondary)]"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? '注册中...' : '注册'}
      </Button>
      <div className="pt-2 text-center text-xs text-[var(--auth-form-muted)]">
        已有账号？{' '}
        <Link
          className="border-b border-[var(--auth-form-link-border)] text-[var(--auth-form-foreground)]"
          href="/login"
        >
          立即登录
        </Link>
      </div>
    </form>
  );
}
