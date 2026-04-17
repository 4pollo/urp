import { AlertCircle, CircleCheck, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { cn } from '../../lib/utils';

export function AlertMessage({
  type,
  message,
  detail,
  actionLabel,
  onAction,
}: {
  type: 'error' | 'success' | 'info';
  message: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const Icon =
    type === 'error' ? AlertCircle : type === 'success' ? CircleCheck : Info;

  return (
    <Alert
      className={cn(
        'mb-4 rounded-none border',
        type === 'error' &&
          'border-destructive/50 bg-destructive/10 text-destructive [&>svg]:text-destructive',
        type === 'success' &&
          'border-primary/20 bg-primary/10 text-foreground [&>svg]:text-primary',
        type === 'info' &&
          'border-border bg-muted/50 text-foreground [&>svg]:text-muted-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      <AlertTitle className="uppercase tracking-[0.05em]">{message}</AlertTitle>
      <AlertDescription className="space-y-3 text-xs text-current/80">
        {detail ? <p>{detail}</p> : null}
        {actionLabel && onAction ? (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
