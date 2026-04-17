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
import type { PermissionItem } from '../../lib/types';

export function PermissionsTable({
  permissions,
  pendingPermissionId,
  onEdit,
  onDelete,
}: {
  permissions: PermissionItem[];
  pendingPermissionId?: number | null;
  onEdit: (permission: PermissionItem) => void;
  onDelete: (permission: PermissionItem) => void;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <CardTitle>权限列表</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标识</TableHead>
              <TableHead>分组</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission) => {
              const pending = pendingPermissionId === permission.id;

              return (
                <TableRow key={permission.id}>
                  <TableCell>{permission.key}</TableCell>
                  <TableCell>{permission.group}</TableCell>
                  <TableCell>{permission.description || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        disabled={pending}
                        onClick={() => onEdit(permission)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="danger"
                        disabled={pending}
                        onClick={() => onDelete(permission)}
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
