import { Button } from '../ui/button';

export function LoadingState({
  label = '加载中...',
  detail,
}: {
  label?: string;
  detail?: string;
}) {
  return (
    <div className="console-empty border border-[var(--border)] bg-[var(--panel)]">
      <div>{label}</div>
      {detail ? (
        <div className="mt-3 normal-case text-xs text-[var(--foreground-tertiary)]">
          {detail}
        </div>
      ) : null}
    </div>
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
    <div className="space-y-4 border border-[var(--border)] bg-[var(--panel)] p-6 text-xs text-[var(--foreground-secondary)]">
      <div className="space-y-2">
        <div className="uppercase tracking-[0.05em] text-[var(--foreground-tertiary)]">
          {label}
        </div>
        {detail ? (
          <div className="text-xs text-[var(--foreground-tertiary)]">
            {detail}
          </div>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
