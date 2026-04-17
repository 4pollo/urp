import { Button } from '../ui/button';
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
  return (
    <div
      className={cn(
        'mb-4 border px-4 py-3 text-xs',
        type === 'error' &&
          'border-[var(--status-error-border)] bg-[var(--status-error-background)] text-[var(--status-error-foreground)]',
        type === 'success' &&
          'border-[var(--status-success-border)] bg-[var(--status-success-background)] text-[var(--status-success-foreground)]',
        type === 'info' &&
          'border-[var(--status-info-border)] bg-[var(--status-info-background)] text-[var(--status-info-foreground)]',
      )}
    >
      <div className="uppercase tracking-[0.05em]">{message}</div>
      {detail ? (
        <div className="mt-2 normal-case text-xs opacity-80">{detail}</div>
      ) : null}
      {actionLabel && onAction ? (
        <div className="mt-3">
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
