'use client';

import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { destroySession } from '../../lib/session';

const links = [
  { href: '/dashboard', label: '用户面板' },
  { href: '/admin', label: '管理面板' },
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
  const activeTheme = mounted ? resolvedTheme || theme || 'light' : 'light';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="app-surface flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="font-['Syne'] text-2xl font-extrabold uppercase tracking-[-0.02em] text-foreground">
              URP
            </div>
            <nav className="flex flex-wrap gap-2">
              {visibleLinks.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant={pathname === item.href ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    pathname !== item.href && 'text-muted-foreground',
                  )}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </nav>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              variant="outline"
              size="icon"
              aria-label={
                activeTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'
              }
              onClick={() => {
                setTheme(activeTheme === 'dark' ? 'light' : 'dark');
              }}
            >
              {activeTheme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
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
      <div className="app-surface px-6 py-10 lg:px-8 lg:py-16">{children}</div>
    </div>
  );
}
