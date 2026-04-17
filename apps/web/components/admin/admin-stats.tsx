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
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardTitle>{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-['Syne'] text-[36px] font-extrabold leading-none tracking-[-0.02em] text-[var(--foreground)]">
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
