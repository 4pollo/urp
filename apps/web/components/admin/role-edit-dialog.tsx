'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { PermissionItem, RoleDetail, RoleListItem } from '../../lib/types';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';

export function RoleEditDialog({
  role,
  roleDetail,
  permissions,
  open,
  detailLoading = false,
  pending = false,
  permissionPending = false,
  onOpenChange,
  onSubmit,
  onPermissionsSubmit,
}: {
  role: RoleListItem | null;
  roleDetail: RoleDetail | null;
  permissions: PermissionItem[];
  open: boolean;
  detailLoading?: boolean;
  pending?: boolean;
  permissionPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { name: string; description: string }) => void;
  onPermissionsSubmit: (permissionIds: number[]) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    [],
  );

  useEffect(() => {
    setName(role?.name || '');
    setDescription(role?.description || '');
  }, [role]);

  useEffect(() => {
    setSelectedPermissionIds(
      roleDetail?.permissions.map((permission) => permission.id) || [],
    );
  }, [roleDetail]);

  const permissionsByGroup = useMemo(() => {
    const groups = new Map<string, PermissionItem[]>();

    for (const permission of permissions) {
      const list = groups.get(permission.group) || [];
      list.push(permission);
      groups.set(permission.group, list);
    }

    return Array.from(groups.entries()).sort(([groupA], [groupB]) =>
      groupA.localeCompare(groupB, 'zh-CN'),
    );
  }, [permissions]);

  const roleLocked = role?.name === 'SuperAdmin' || role?.name === 'Guest';
  const permissionSelectionChanged = useMemo(() => {
    if (!roleDetail) {
      return false;
    }

    const initialIds = roleDetail.permissions
      .map((permission) => permission.id)
      .sort();
    const currentIds = [...selectedPermissionIds].sort((a, b) => a - b);

    if (initialIds.length !== currentIds.length) {
      return true;
    }

    return initialIds.some((id, index) => id !== currentIds[index]);
  }, [roleDetail, selectedPermissionIds]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }
    onSubmit({ name: name.trim(), description: description.trim() });
  }

  function handlePermissionToggle(permissionId: number, checked: boolean) {
    if (permissionPending || detailLoading || roleLocked) {
      return;
    }

    setSelectedPermissionIds((current) => {
      if (checked) {
        return current.includes(permissionId)
          ? current
          : [...current, permissionId];
      }

      return current.filter((id) => id !== permissionId);
    });
  }

  const disableClose = pending || permissionPending || detailLoading;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!disableClose) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>编辑角色</DialogTitle>
          <DialogDescription>修改角色名称、描述与分配权限。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {roleLocked ? (
              <div className="rounded-md border border-[var(--border)] bg-[var(--background-secondary)] px-4 py-3 text-xs text-[var(--foreground-secondary)]">
                系统角色的名称和描述不能修改。
              </div>
            ) : null}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-tertiary)]">
                角色名称
              </label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                disabled={pending || roleLocked}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-tertiary)]">
                角色描述
              </label>
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={pending || roleLocked}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={disableClose}
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={pending || roleLocked || !name.trim()}
              >
                {pending ? '保存中...' : '保存角色'}
              </Button>
            </div>
          </form>

          <div className="space-y-4 border-t border-[var(--border)] pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                角色权限
              </h3>
              <p className="mt-1 text-xs text-[var(--foreground-tertiary)]">
                为当前角色勾选需要的权限。
              </p>
            </div>

            {detailLoading ? (
              <div className="rounded-md border border-[var(--border)] bg-[var(--background-secondary)] px-4 py-6 text-sm text-[var(--foreground-secondary)]">
                正在加载角色权限...
              </div>
            ) : roleDetail ? (
              <>
                {roleLocked ? (
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background-secondary)] px-4 py-3 text-xs text-[var(--foreground-secondary)]">
                    系统角色的权限不能修改。
                  </div>
                ) : null}

                <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
                  {permissionsByGroup.map(([group, items]) => (
                    <div
                      key={group}
                      className="space-y-3 rounded-md border border-[var(--border)] p-4"
                    >
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground)]">
                          {group}
                        </h4>
                        <p className="mt-1 text-[11px] text-[var(--foreground-tertiary)]">
                          {items.length} 项权限
                        </p>
                      </div>
                      <div className="space-y-3">
                        {items.map((permission) => {
                          const checked = selectedPermissionIds.includes(
                            permission.id,
                          );

                          return (
                            <label
                              key={permission.id}
                              className="flex items-start gap-3 text-sm text-[var(--foreground)]"
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5 h-4 w-4 border border-[var(--input-border)] bg-[var(--input-background)]"
                                checked={checked}
                                disabled={
                                  permissionPending ||
                                  detailLoading ||
                                  roleLocked
                                }
                                onChange={(event) =>
                                  handlePermissionToggle(
                                    permission.id,
                                    event.target.checked,
                                  )
                                }
                              />
                              <span className="space-y-1">
                                <span className="block font-medium">
                                  {permission.key}
                                </span>
                                <span className="block text-xs text-[var(--foreground-tertiary)]">
                                  {permission.description || '暂无描述'}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    disabled={
                      detailLoading ||
                      permissionPending ||
                      roleLocked ||
                      !permissionSelectionChanged
                    }
                    onClick={() => onPermissionsSubmit(selectedPermissionIds)}
                  >
                    {permissionPending ? '保存中...' : '保存权限'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-md border border-[var(--border)] bg-[var(--background-secondary)] px-4 py-6 text-sm text-[var(--foreground-secondary)]">
                未获取到角色详情。
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
