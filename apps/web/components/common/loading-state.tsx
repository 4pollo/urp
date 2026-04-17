import { LoaderCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function LoadingState({
  label = '加载中...',
  detail,
}: {
  label?: string;
  detail?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6 px-6 py-8">
        <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.05em] text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span>{label}</span>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        {detail ? (
          <p className="text-xs text-muted-foreground">{detail}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ActionState({
  label,
  detail,
  actionLabel,
  onAction,
}: {
  label: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 px-6 py-8">
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-[0.05em]">
            {label}
          </p>
          {detail ? (
            <p className="text-xs text-muted-foreground">{detail}</p>
          ) : null}
        </div>
        {actionLabel && onAction ? (
          <div>
            <Button variant="outline" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
