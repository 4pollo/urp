'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Minus } from 'lucide-react';
import type { PermissionItem, RoleDetail, RoleListItem } from '../../lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';

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
  const [expandedPermissionGroups, setExpandedPermissionGroups] = useState<
    string[]
  >([]);

  useEffect(() => {
    setName(role?.name || '');
    setDescription(role?.description || '');
  }, [role]);

  useEffect(() => {
    setSelectedPermissionIds(
      roleDetail?.permissions.map((permission) => permission.id) || [],
    );
    setExpandedPermissionGroups(
      Array.from(new Set(permissions.map((permission) => permission.group))),
    );
  }, [permissions, roleDetail]);

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

  function handleGroupSelectionToggle(permissionIds: number[]) {
    if (permissionPending || detailLoading || roleLocked) {
      return;
    }

    setSelectedPermissionIds((current) => {
      const allSelected = permissionIds.every((id) => current.includes(id));

      if (allSelected) {
        return current.filter((id) => !permissionIds.includes(id));
      }

      const currentSet = new Set(current);
      for (const permissionId of permissionIds) {
        currentSet.add(permissionId);
      }
      return Array.from(currentSet);
    });
  }

  function togglePermissionGroupExpanded(group: string) {
    setExpandedPermissionGroups((current) =>
      current.includes(group)
        ? current.filter((item) => item !== group)
        : [...current, group],
    );
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
      <DialogContent className="max-w-5xl sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>编辑角色</DialogTitle>
          <DialogDescription>修改角色名称、描述与分配权限。</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">基础信息</TabsTrigger>
            <TabsTrigger value="permissions">角色权限</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>角色信息</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {roleLocked ? (
                    <Alert>
                      <AlertTitle>系统角色</AlertTitle>
                      <AlertDescription>
                        系统角色的名称和描述不能修改。
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  <div className="space-y-2">
                    <Label htmlFor="role-name">角色名称</Label>
                    <Input
                      id="role-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      disabled={pending || roleLocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-description">角色描述</Label>
                    <Textarea
                      id="role-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      disabled={pending || roleLocked}
                      rows={5}
                    />
                  </div>
                  <DialogFooter>
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
                  </DialogFooter>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>角色权限</CardTitle>
                  {roleDetail ? (
                    <Badge variant="secondary">
                      {selectedPermissionIds.length} / {permissions.length}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  为当前角色勾选需要的权限。
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {detailLoading ? (
                  <Alert>
                    <AlertTitle>加载中</AlertTitle>
                    <AlertDescription>正在加载角色权限...</AlertDescription>
                  </Alert>
                ) : roleDetail ? (
                  <>
                    {roleLocked ? (
                      <Alert>
                        <AlertTitle>系统角色</AlertTitle>
                        <AlertDescription>
                          系统角色的权限不能修改。
                        </AlertDescription>
                      </Alert>
                    ) : null}

                    <ScrollArea className="h-[420px] pr-3">
                      <div className="space-y-4">
                        {permissionsByGroup.map(([group, items]) => {
                          const groupPermissionIds = items.map(
                            (permission) => permission.id,
                          );
                          const selectedCount = groupPermissionIds.filter(
                            (id) => selectedPermissionIds.includes(id),
                          ).length;
                          const allSelected =
                            groupPermissionIds.length > 0 &&
                            selectedCount === groupPermissionIds.length;
                          const partiallySelected =
                            selectedCount > 0 && !allSelected;
                          const groupExpanded =
                            expandedPermissionGroups.includes(group);

                          return (
                            <Card key={group}>
                              <CardHeader className="gap-0 p-0">
                                <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                                  <button
                                    type="button"
                                    className="flex h-5 w-5 shrink-0 items-center justify-center border border-input bg-background text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={
                                      permissionPending ||
                                      detailLoading ||
                                      roleLocked
                                    }
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleGroupSelectionToggle(
                                        groupPermissionIds,
                                      );
                                    }}
                                    aria-label={`${group}权限组全选切换`}
                                    aria-checked={
                                      allSelected
                                        ? 'true'
                                        : partiallySelected
                                          ? 'mixed'
                                          : 'false'
                                    }
                                  >
                                    {allSelected ? (
                                      <div className="h-2.5 w-2.5 bg-foreground" />
                                    ) : partiallySelected ? (
                                      <Minus className="h-3.5 w-3.5" />
                                    ) : null}
                                  </button>
                                  <button
                                    type="button"
                                    className="flex flex-1 items-center justify-between gap-3 text-left"
                                    onClick={() =>
                                      togglePermissionGroupExpanded(group)
                                    }
                                    aria-label={
                                      groupExpanded
                                        ? `折叠${group}权限组`
                                        : `展开${group}权限组`
                                    }
                                  >
                                    <div className="flex items-center gap-3">
                                      <CardTitle className="text-xs">
                                        {group}
                                      </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline">
                                        {selectedCount} / {items.length}
                                      </Badge>
                                      {groupExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </button>
                                </div>
                              </CardHeader>
                              {groupExpanded ? (
                                <CardContent>
                                  <div className="grid gap-3 md:grid-cols-3">
                                    {items.map((permission) => {
                                      const checked =
                                        selectedPermissionIds.includes(
                                          permission.id,
                                        );
                                      const primaryLabel =
                                        permission.description ||
                                        permission.key;

                                      return (
                                        <div
                                          key={permission.id}
                                          className="border border-border bg-background"
                                        >
                                          <div className="flex items-start gap-3 p-3">
                                            <div className="pt-0.5">
                                              <Checkbox
                                                id={`permission-${permission.id}`}
                                                checked={checked}
                                                disabled={
                                                  permissionPending ||
                                                  detailLoading ||
                                                  roleLocked
                                                }
                                                onCheckedChange={(value) =>
                                                  handlePermissionToggle(
                                                    permission.id,
                                                    value === true,
                                                  )
                                                }
                                              />
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-1">
                                              <Label
                                                htmlFor={`permission-${permission.id}`}
                                                className="block space-y-1 text-sm"
                                              >
                                                <span className="block font-medium text-foreground">
                                                  {primaryLabel}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                  {permission.key}
                                                </span>
                                              </Label>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </CardContent>
                              ) : null}
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>

                    <DialogFooter>
                      <Button
                        type="button"
                        disabled={
                          detailLoading ||
                          permissionPending ||
                          roleLocked ||
                          !permissionSelectionChanged
                        }
                        onClick={() =>
                          onPermissionsSubmit(selectedPermissionIds)
                        }
                      >
                        {permissionPending ? '保存中...' : '保存权限'}
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <Alert variant="destructive">
                    <AlertTitle>加载失败</AlertTitle>
                    <AlertDescription>未获取到角色详情。</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
