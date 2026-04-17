import * as React from 'react';
import { cn } from '../../lib/utils';

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-none border px-4 py-3 text-[13px] outline-none transition-colors placeholder:text-[var(--input-placeholder)]',
        'border-[var(--input-border)] bg-[var(--input-background)] text-[var(--input-foreground)] hover:border-[var(--border)] focus:border-[var(--input-focus)] focus:shadow-[0_0_0_1px_var(--input-focus)]',
        className,
      )}
      {...props}
    />
  );
}
