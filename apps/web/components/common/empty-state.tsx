import { Button } from '../ui/button';

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
    <div className="console-empty border border-[var(--border)] bg-[var(--panel)]">
      <div>{label}</div>
      {detail ? (
        <div className="mt-3 normal-case text-xs text-[var(--foreground-tertiary)]">
          {detail}
        </div>
      ) : null}
      {actionLabel && onAction ? (
        <div className="mt-4">
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
