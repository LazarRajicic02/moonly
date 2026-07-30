'use client';

import { useTranslations } from 'next-intl';
import {
  Baby,
  Bot,
  Droplet,
  FileText,
  Flower2,
  HeartPulse,
  Pill,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { Link } from '@/i18n/routing';

const items = [
  { key: 'cycle', href: '/cycle', icon: HeartPulse },
  { key: 'tracking', href: '/tracking', icon: Droplet },
  { key: 'medications', href: '/medications', icon: Pill },
  { key: 'pregnancy', href: '/pregnancy', icon: Baby },
  { key: 'fertility', href: '/fertility', icon: Flower2 },
  { key: 'ai', href: '/ai', icon: Bot },
  { key: 'reports', href: '/reports', icon: FileText },
  { key: 'settings', href: '/settings', icon: Settings },
  { key: 'admin', href: '/admin', icon: ShieldCheck },
] as const;

export default function MorePage() {
  const t = useTranslations('nav');
  return (
    <main className="space-y-5">
      <h1 className="font-display text-3xl text-lunar-bright">{t('more')}</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(({ key, href, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-ink-soft/60 p-6 text-sm text-lunar transition hover:border-tide/40 hover:text-lunar-bright active:scale-95"
          >
            <Icon className="h-7 w-7 text-tide-soft" />
            {t(key)}
          </Link>
        ))}
      </div>
    </main>
  );
}
