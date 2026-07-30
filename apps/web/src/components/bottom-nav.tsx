'use client';

import { useTranslations } from 'next-intl';
import { Home, CalendarDays, Plus, BarChart3, LayoutGrid } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const items = [
  { key: 'dashboard', href: '/dashboard', icon: Home },
  { key: 'calendar', href: '/calendar', icon: CalendarDays },
  { key: 'log', href: '/log', icon: Plus, primary: true },
  { key: 'stats', href: '/stats', icon: BarChart3 },
  { key: 'more', href: '/more', icon: LayoutGrid },
] as const;

export function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {items.map(({ key, href, icon: Icon, ...rest }) => {
          const active = pathname.startsWith(href);
          const primary = 'primary' in rest && rest.primary;
          if (primary) {
            return (
              <Link
                key={key}
                href={href}
                aria-label={t(key)}
                className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-tide text-ink shadow-glow transition-transform active:scale-95"
              >
                <Icon className="h-7 w-7" strokeWidth={2.5} />
              </Link>
            );
          }
          return (
            <Link
              key={key}
              href={href}
              aria-label={t(key)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] transition-colors',
                active ? 'text-tide-soft' : 'text-lunar-dim',
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
              <span>{t(key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
