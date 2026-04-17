import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex gap-1 border-b border-[var(--border)] p-0',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center border-b-2 border-transparent px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--foreground-tertiary)] transition-colors hover:text-[var(--foreground)] data-[state=active]:border-[var(--foreground)] data-[state=active]:text-[var(--foreground)]',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: TabsPrimitive.TabsContentProps) {
  return <TabsPrimitive.Content className={cn('mt-4', className)} {...props} />;
}
