'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { destroySession } from '../../lib/session';
import { setThemePreference, type ThemePreference } from '../../lib/storage';

const links = [
  { href: '/dashboard', label: '用户面板' },
  { href: '/admin', label: '管理面板' },
];

const themeOptions: Array<{ value: ThemePreference; label: string }> = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '系统' },
];

export function AppShell({
  children,
  showAdmin,
}: {
  children: ReactNode;
  showAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visibleLinks = showAdmin
    ? links
    : links.filter((item) => item.href !== '/admin');

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--header-background)] backdrop-blur-sm">
        <div className="app-surface flex items-center justify-between gap-6 px-8 py-6">
          <div className="font-['Syne'] text-2xl font-extrabold uppercase tracking-[-0.02em] text-[var(--foreground)]">
            URP
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-8">
              {visibleLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--foreground-tertiary)] transition-colors hover:text-[var(--foreground)]',
                    pathname === item.href && 'text-[var(--foreground)]',
                  )}
                >
                  <span className="border-b border-transparent pb-1">
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
            <div
              className="theme-toggle-group"
              role="group"
              aria-label="主题切换"
            >
              {themeOptions.map((option) => {
                const activeTheme = mounted
                  ? theme || resolvedTheme || 'system'
                  : 'system';
                return (
                  <button
                    key={option.value}
                    className="theme-toggle-button"
                    data-active={String(activeTheme === option.value)}
                    type="button"
                    onClick={() => {
                      setTheme(option.value);
                      setThemePreference(option.value);
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                destroySession();
                router.replace('/login');
              }}
            >
              退出登录
            </Button>
          </div>
        </div>
      </header>
      <div className="app-surface px-8 py-16">{children}</div>
    </div>
  );
}
