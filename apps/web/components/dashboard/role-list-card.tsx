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
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>角色信息</CardTitle>
          <Badge variant="outline">{roles.length} 个角色</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <EmptyState label="暂无角色" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <Badge key={role.id} variant="secondary">
                {role.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
