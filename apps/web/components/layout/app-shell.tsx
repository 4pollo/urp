'use client';

import Link from 'next/link';
import {
  Gauge,
  KeyRound,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Sun,
  Users,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'app-shell:sidebar-collapsed';
import type { AuthNavItem } from '../../lib/types';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { destroySession } from '../../lib/session';
import { ScrollArea } from '../ui/scroll-area';

export function AppShell({
  children,
  navItems = [],
}: {
  children: ReactNode;
  navItems?: AuthNavItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedValue = window.localStorage.getItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
    );
    setSidebarCollapsed(storedValue === 'true');
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
      String(sidebarCollapsed),
    );
  }, [mounted, sidebarCollapsed]);

  const activeTheme = mounted ? resolvedTheme || theme || 'light' : 'light';

  const navIcons: Record<AuthNavItem['href'], ReactNode> = {
    '/dashboard': <Gauge className="h-4 w-4 shrink-0" />,
    '/admin/users': <Users className="h-4 w-4 shrink-0" />,
    '/admin/roles': <Shield className="h-4 w-4 shrink-0" />,
    '/admin/permissions': <KeyRound className="h-4 w-4 shrink-0" />,
  };

  return (
    <div
      className={cn(
        'h-screen overflow-hidden bg-background text-foreground lg:grid',
        sidebarCollapsed
          ? 'lg:grid-cols-[77px_minmax(0,1fr)]'
          : 'lg:grid-cols-[220px_minmax(0,1fr)]',
      )}
    >
      <aside className="flex h-screen flex-col overflow-hidden border-r border-border bg-card">
        <div
          className={cn(
            'flex h-[77px] shrink-0 items-center border-b border-border py-5',
            sidebarCollapsed ? 'justify-center px-3' : 'justify-between px-6',
          )}
        >
          {sidebarCollapsed ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="展开侧边栏"
              onClick={() => {
                setSidebarCollapsed(false);
              }}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <div className="font-['Syne'] text-2xl font-extrabold uppercase tracking-[-0.02em] text-foreground">
                URP
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="折叠侧边栏"
                onClick={() => {
                  setSidebarCollapsed(true);
                }}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? 'default' : 'ghost'}
                  className={cn(
                    'rounded-none',
                    sidebarCollapsed ? 'w-full px-0' : 'w-full justify-start',
                    !active && 'text-muted-foreground',
                  )}
                >
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className={cn(
                      'flex w-full items-center',
                      sidebarCollapsed
                        ? 'justify-center'
                        : 'justify-start gap-3',
                    )}
                  >
                    {navIcons[item.href]}
                    {sidebarCollapsed ? null : (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
      <div className="flex h-screen min-w-0 flex-col overflow-hidden">
        <header className="flex h-[77px] shrink-0 items-center justify-end border-b border-border bg-background/95 px-6 py-5 backdrop-blur-sm lg:px-8">
          <div className="flex items-center gap-3">
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
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-6 py-8 lg:px-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
