import * as React from 'react';
import { cn } from '../../lib/utils';

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-none border border-[var(--border)] bg-[var(--background-tertiary)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--foreground)]',
        className,
      )}
      {...props}
    />
  );
}
