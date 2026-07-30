import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-tide/20 bg-ink-soft/55 p-5 backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  );
}
