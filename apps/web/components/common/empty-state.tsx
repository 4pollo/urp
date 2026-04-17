import { Inbox } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export function EmptyState({
  label = '暂无数据',
  detail,
  actionLabel,
  onAction,
}: {
  label?: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <div className="flex h-11 w-11 items-center justify-center border border-border bg-muted text-muted-foreground">
          <Inbox className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-[0.05em]">
            {label}
          </p>
          {detail ? (
            <p className="text-xs text-muted-foreground">{detail}</p>
          ) : null}
        </div>
        {actionLabel && onAction ? (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
