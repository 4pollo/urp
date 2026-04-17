import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';

const features = [
  '基于角色的访问控制 (RBAC)',
  'JWT 双令牌认证机制',
  '细粒度权限管理',
  '多角色支持与权限继承',
];

const brandDescription =
  '企业级 RBAC 权限管理解决方案，提供完整的用户、角色和权限控制能力。基于 NestJS 构建，支持 JWT 认证和多角色授权。';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-muted/40 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="auth-dark-panel hidden border-r border-border px-10 py-12 lg:flex lg:items-center lg:px-16 lg:py-16">
        <div className="relative z-10 max-w-xl space-y-8">
          <div className="space-y-4">
            <Badge variant="outline" className="border-white/15 text-white/70">
              权限管理系统
            </Badge>
            <div className="font-['Syne'] text-[72px] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] text-white">
              URP
            </div>
            <p className="max-w-md text-sm leading-7 text-white/70">
              {brandDescription}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/85"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-16 lg:py-16">
        <Card className="w-full max-w-[440px]">
          <CardHeader className="space-y-3 p-10 pb-0">
            <CardTitle className="page-title text-[40px] text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="text-xs uppercase tracking-[0.05em] text-muted-foreground">
              {subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-8">{children}</CardContent>
        </Card>
      </section>
    </main>
  );
}
