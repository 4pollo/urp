import { EmptyState } from '../common/empty-state';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function RoleListCard({
  roles,
}: {
  roles: Array<{ id: number; name: string }>;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-[var(--border)]">
        <CardTitle>角色信息</CardTitle>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <EmptyState label="暂无角色" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <Badge key={role.id}>{role.name}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
