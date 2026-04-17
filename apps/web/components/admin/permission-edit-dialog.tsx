'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { PermissionItem } from '../../lib/types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
import { Textarea } from '../ui/textarea';

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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑权限</DialogTitle>
          <DialogDescription>修改权限标识、分组与描述。</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>权限信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="permission-key">权限标识</Label>
                  <Input
                    id="permission-key"
                    value={key}
                    onChange={(event) => setKey(event.target.value)}
                    required
                    disabled={pending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permission-group">权限分组</Label>
                  <Input
                    id="permission-group"
                    value={group}
                    onChange={(event) => setGroup(event.target.value)}
                    required
                    disabled={pending}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="permission-description">权限描述</Label>
                <Textarea
                  id="permission-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={pending}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
          <DialogFooter className="mt-6">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
