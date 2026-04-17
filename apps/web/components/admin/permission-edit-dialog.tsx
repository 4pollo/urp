'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { PermissionItem } from '../../lib/types';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';

export function PermissionEditDialog({
  permission,
  open,
  pending = false,
  onOpenChange,
  onSubmit,
}: {
  permission: PermissionItem | null;
  open: boolean;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    key: string;
    group: string;
    description: string;
  }) => void;
}) {
  const [key, setKey] = useState('');
  const [group, setGroup] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setKey(permission?.key || '');
    setGroup(permission?.group || '');
    setDescription(permission?.description || '');
  }, [permission]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }
    onSubmit({
      key: key.trim(),
      group: group.trim(),
      description: description.trim(),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑权限</DialogTitle>
          <DialogDescription>修改权限标识、分组与描述。</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-tertiary)]">
              权限标识
            </label>
            <Input
              value={key}
              onChange={(event) => setKey(event.target.value)}
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-tertiary)]">
              权限分组
            </label>
            <Input
              value={group}
              onChange={(event) => setGroup(event.target.value)}
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-tertiary)]">
              权限描述
            </label>
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={pending}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={pending || !key.trim() || !group.trim()}
            >
              {pending ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
