'use client';

import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/use-auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../ui/input-group';
import { Label } from '../ui/label';

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
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-email">邮箱地址</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="your@email.com"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">密码</Label>
          <InputGroup>
            <InputGroupInput
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="输入密码"
              required
              autoComplete="current-password"
            />
            <InputGroupAddon>
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                type="button"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? '登录中...' : '登录'}
      </Button>
      <div className="pt-2 text-center text-xs text-muted-foreground">
        还没有账号？{' '}
        <Link
          className="border-b border-border text-foreground"
          href="/register"
        >
          立即注册
        </Link>
      </div>
    </form>
  );
}
