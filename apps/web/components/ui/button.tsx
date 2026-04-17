import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'danger';
};

export function Button({
  className,
  asChild = false,
  variant = 'default',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-none border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'default' &&
          'border-[var(--button-primary-background)] bg-[var(--button-primary-background)] text-[var(--button-primary-foreground)] hover:bg-[var(--button-primary-hover)]',
        variant === 'outline' &&
          'border-[var(--button-outline-border)] bg-transparent text-[var(--button-outline-foreground)] hover:bg-[var(--button-outline-hover-background)] hover:text-[var(--button-outline-hover-foreground)]',
        variant === 'ghost' &&
          'border-transparent bg-transparent text-[var(--button-ghost-foreground)] hover:text-[var(--button-ghost-hover-foreground)]',
        variant === 'danger' &&
          'border-[var(--button-danger-border)] bg-[var(--button-danger-background)] text-[var(--button-danger-foreground)] hover:bg-[var(--button-danger-hover-background)] hover:text-[var(--button-danger-hover-foreground)]',
        className,
      )}
      {...props}
    />
  );
}
