import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import type { RoleListItem } from '../../lib/types';

export function RolesTable({
  roles,
  pendingRoleId,
  onEdit,
  onDelete,
}: {
  roles: RoleListItem[];
  pendingRoleId?: number | null;
  onEdit: (role: RoleListItem) => void;
  onDelete: (role: RoleListItem) => void;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <CardTitle>角色列表</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>权限数</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => {
              const pending = pendingRoleId === role.id;

              return (
                <TableRow key={role.id}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell>{role.permissionCount}</TableCell>
                  <TableCell>
                    {new Date(role.createdAt).toLocaleString('zh-CN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        disabled={pending}
                        onClick={() => onEdit(role)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="danger"
                        disabled={pending}
                        onClick={() => onDelete(role)}
                      >
                        {pending ? '处理中...' : '删除'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
