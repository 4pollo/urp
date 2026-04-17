import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function UserSummaryCard({
  email,
  status,
  lastLoginAt,
}: {
  email: string;
  status: string;
  lastLoginAt?: string | null;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-[var(--border)]">
        <CardTitle>账户信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 text-xs text-[var(--foreground)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] py-4">
          <div className="text-[11px] uppercase tracking-[0.05em] text-[var(--foreground-tertiary)]">
            邮箱
          </div>
          <div>{email}</div>
        </div>
        <div className="flex items-center justify-between border-b border-[var(--border)] py-4">
          <div className="text-[11px] uppercase tracking-[0.05em] text-[var(--foreground-tertiary)]">
            状态
          </div>
          <div>{status === 'active' ? '正常' : '冻结'}</div>
        </div>
        <div className="flex items-center justify-between py-4">
          <div className="text-[11px] uppercase tracking-[0.05em] text-[var(--foreground-tertiary)]">
            最后登录
          </div>
          <div>
            {lastLoginAt
              ? new Date(lastLoginAt).toLocaleString('zh-CN')
              : '首次登录'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
