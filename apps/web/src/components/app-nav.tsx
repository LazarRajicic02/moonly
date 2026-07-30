'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import {
  BarChart3,
  CalendarDays,
  Home,
  LogOut,
  MoonStar,
  MoreHorizontal,
  PlusCircle,
  SunMedium,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { clearAccessToken } from '@/lib/auth';

const tabs = [
  { key: 'dashboard', href: '/dashboard', icon: Home },
  { key: 'calendar', href: '/calendar', icon: CalendarDays },
  { key: 'log', href: '/log', icon: PlusCircle, center: true },
  { key: 'stats', href: '/stats', icon: BarChart3 },
  { key: 'more', href: '/more', icon: MoreHorizontal },
] as const;

function ThemeToggle({ className, label }: { className?: string; label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <button
      aria-label={label}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={className}
    >
      {!mounted ? (
        <span className="inline-block h-5 w-5" aria-hidden />
      ) : resolvedTheme === 'dark' ? (
        <SunMedium className="h-5 w-5" />
      ) : (
        <MoonStar className="h-5 w-5" />
      )}
    </button>
  );
}

export function AppNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  function logout() {
    clearAccessToken();
    window.location.href = '/en/login';
  }

  return (
    <>
      {/* Mobile top header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-ink/85 px-5 py-3 backdrop-blur-md lg:hidden">
        <span className="font-display text-2xl tracking-tight text-lunar-bright">Luna</span>
        <div className="flex items-center gap-1">
          <ThemeToggle
            label={t('theme')}
            className="rounded-full p-2.5 text-lunar transition hover:bg-white/10"
          />
          <button
            aria-label={t('logout')}
            onClick={logout}
            className="rounded-full p-2.5 text-lunar transition hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label={t('main')}
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {tabs.map(({ key, href, icon: Icon, ...rest }) => {
            const active = pathname.startsWith(href);
            const center = 'center' in rest;
            return (
              <Link
                key={key}
                href={href}
                aria-label={t(key)}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[11px] transition',
                  active ? 'text-tide-soft' : 'text-lunar-dim',
                )}
              >
                <span
                  className={cn(
                    center &&
                      '-mt-5 rounded-full bg-gradient-to-br from-tide to-iris p-3 text-white shadow-glow',
                  )}
                >
                  <Icon className={cn('h-5 w-5', center && 'h-6 w-6')} />
                </span>
                <span>{t(key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col gap-6 border-r border-white/10 bg-ink/70 p-6 lg:flex lg:min-h-screen">
        <span className="font-display text-3xl tracking-tight text-lunar-bright">Luna</span>
        <nav aria-label={t('main')} className="flex flex-col gap-1">
          {tabs.map(({ key, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition',
                  active
                    ? 'bg-tide/15 text-tide-soft'
                    : 'text-lunar hover:bg-white/5 hover:text-lunar-bright',
                )}
              >
                <Icon className="h-4 w-4" />
                {t(key)}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center gap-2">
          <ThemeToggle
            label={t('theme')}
            className="rounded-full p-2.5 text-lunar transition hover:bg-white/10"
          />
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-lunar transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
