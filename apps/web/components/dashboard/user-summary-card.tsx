import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

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
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>账户信息</CardTitle>
          <Badge variant={status === 'active' ? 'secondary' : 'destructive'}>
            {status === 'active' ? '正常' : '冻结'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-foreground">
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
            邮箱
          </div>
          <div>{email}</div>
        </div>
        <Separator />
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
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
