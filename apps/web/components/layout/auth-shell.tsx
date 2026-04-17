import type { ReactNode } from 'react';

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
    <main className="grid min-h-screen bg-[var(--background-secondary)] lg:grid-cols-[1.2fr_0.8fr]">
      <section className="auth-dark-panel hidden border-r border-[#333333] px-16 py-16 lg:flex lg:flex-col lg:justify-center">
        <div className="relative z-10 max-w-xl">
          <div className="mb-16">
            <div className="font-['Syne'] text-[72px] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] text-white">
              URP
            </div>
            <div className="mt-4 text-sm uppercase tracking-[0.1em] text-[#737373]">
              权限管理系统
            </div>
            <p className="mt-8 max-w-md text-[13px] leading-8 text-[#a3a3a3]">
              {brandDescription}
            </p>
          </div>

          <div className="space-y-4 text-xs text-[#a3a3a3]">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <span className="text-[#737373]">—</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center bg-[var(--background-secondary)] px-6 py-10 sm:px-8 lg:px-16 lg:py-16">
        <div className="auth-form-card">
          <div className="mb-12">
            <h1 className="page-title text-[40px] text-[var(--auth-form-foreground)]">
              {title}
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.05em] text-[var(--auth-form-muted)]">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
