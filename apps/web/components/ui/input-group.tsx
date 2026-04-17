import * as React from 'react';
import { cn } from '@/lib/utils';

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex items-center border border-input bg-background text-foreground',
      'focus-within:ring-1 focus-within:ring-ring',
      className,
    )}
    {...props}
  />
));
InputGroup.displayName = 'InputGroup';

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-11 w-full bg-transparent px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
InputGroupInput.displayName = 'InputGroupInput';

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-11 items-center justify-center px-2 text-muted-foreground',
      className,
    )}
    {...props}
  />
));
InputGroupAddon.displayName = 'InputGroupAddon';

export { InputGroup, InputGroupAddon, InputGroupInput };
