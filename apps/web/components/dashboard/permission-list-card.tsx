import { EmptyState } from '../common/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function PermissionListCard({ permissions }: { permissions: string[] }) {
  return (
    <Card>
      <CardHeader className="border-b border-[var(--border)]">
        <CardTitle>我的权限</CardTitle>
      </CardHeader>
      <CardContent>
        {permissions.length === 0 ? (
          <EmptyState label="暂无权限" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {permissions.map((permission) => (
              <div
                key={permission}
                className="border border-[var(--border)] bg-[var(--background-tertiary)] px-3 py-2 text-[11px] text-[var(--foreground-secondary)]"
              >
                {permission}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
