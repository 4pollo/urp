import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
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
  page,
  total,
  limit,
  pendingRoleId,
  onPageChange,
  onEdit,
  onDelete,
}: {
  roles: RoleListItem[];
  page: number;
  total: number;
  limit: number;
  pendingRoleId?: number | null;
  onPageChange: (page: number) => void;
  onEdit: (role: RoleListItem) => void;
  onDelete: (role: RoleListItem) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = total === 0 ? 0 : Math.min(page * limit, total);
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (pageNumber) =>
      Math.abs(pageNumber - page) <= 1 ||
      pageNumber === 1 ||
      pageNumber === totalPages,
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>角色列表</CardTitle>
        <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
          当前显示 {start}-{end} / {total}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-0">
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

        <div className="flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
            第 {page} / {totalPages} 页
          </div>
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                />
              </PaginationItem>
              {pageNumbers.map((pageNumber, index) => {
                const previous = pageNumbers[index - 1];
                const needsGap = previous && pageNumber - previous > 1;

                return [
                  needsGap ? (
                    <PaginationItem key={`ellipsis-${pageNumber}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : null,
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      isActive={pageNumber === page}
                      onClick={() => onPageChange(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>,
                ];
              })}
              <PaginationItem>
                <PaginationNext
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
