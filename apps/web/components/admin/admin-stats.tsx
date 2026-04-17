import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function AdminStats({
  totalUsers,
  totalRoles,
  totalPermissions,
}: {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
}) {
  const items = [
    { label: '总用户数', value: totalUsers, index: '01' },
    { label: '总角色数', value: totalRoles, index: '02' },
    { label: '总权限数', value: totalPermissions, index: '03' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-border pb-4">
            <div className="space-y-1">
              <CardTitle>{item.label}</CardTitle>
              <p className="text-xs text-muted-foreground">当前系统统计</p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {item.index}
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="font-['Syne'] text-[40px] font-extrabold leading-none tracking-[-0.02em] text-foreground">
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
