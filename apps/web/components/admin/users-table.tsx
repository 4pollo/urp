import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import type { UserListItem } from '../../lib/types';

export function UsersTable({
  users,
  page,
  total,
  limit,
  pendingUserId,
  onPageChange,
  onToggleStatus,
  onDelete,
}: {
  users: UserListItem[];
  page: number;
  total: number;
  limit: number;
  pendingUserId?: number | null;
  onPageChange: (page: number) => void;
  onToggleStatus: (user: UserListItem) => void;
  onDelete: (user: UserListItem) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = total === 0 ? 0 : Math.min(page * limit, total);

  return (
    <div className="space-y-4">
      <div className="panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>邮箱</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>最后登录</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const pending = pendingUserId === user.id;

              return (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge>{user.status === 'active' ? '正常' : '冻结'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles.map((role) => (
                        <Badge key={role.id}>{role.name}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString('zh-CN')
                      : '首次登录'}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleString('zh-CN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        disabled={pending}
                        onClick={() => onToggleStatus(user)}
                      >
                        {pending
                          ? '处理中...'
                          : user.status === 'active'
                            ? '冻结'
                            : '激活'}
                      </Button>
                      <Button
                        variant="danger"
                        disabled={pending}
                        onClick={() => onDelete(user)}
                      >
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[var(--foreground-tertiary)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          当前显示 {start}-{end} / {total}
        </div>
        <div className="flex gap-2 self-end lg:self-auto">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}
