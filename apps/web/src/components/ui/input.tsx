
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-md border border-white/10 bg-ink-soft/80 px-3 py-2 text-sm text-lunar-bright placeholder:text-lunar-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tide',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
