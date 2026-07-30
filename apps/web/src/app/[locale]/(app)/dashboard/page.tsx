'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Droplets, HeartPulse, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useAccessToken } from '@/lib/auth';
import { todayISO } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Link, useRouter } from '@/i18n/routing';

function daysUntil(dateISO: string) {
  const target = new Date(dateISO.slice(0, 10) + 'T00:00:00.000Z');
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

function CycleRing({ day, total }: { day: number; total: number }) {
  const r = 84;
  const c = 2 * Math.PI * r;
  const progress = Math.min(Math.max(day / total, 0), 1);
  return (
    <div className="relative mx-auto h-52 w-52">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="url(#roseGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
        />
        <defs>
          <linearGradient id="roseGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E86A93" />
            <stop offset="100%" stopColor="#A78BDA" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs uppercase tracking-widest text-lunar-dim">dan ciklusa</span>
        <span className="font-display text-6xl text-lunar-bright">{day}</span>
        <span className="text-sm text-lunar-dim">od {total}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const router = useRouter();
  const qc = useQueryClient();
  const { token, ready } = useAccessToken();
  const [todayLabel, setTodayLabel] = useState('');

  useEffect(() => {
    if (ready && !token) router.push('/login');
  }, [ready, token, router]);

  useEffect(() => {
    setTodayLabel(
      new Date().toLocaleDateString(locale === 'sr' ? 'sr-Latn-RS' : 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    );
  }, [locale]);

  const me = useQuery({ queryKey: ['me'], queryFn: () => api.me(token!), enabled: ready && !!token });
  const prediction = useQuery({
    queryKey: ['prediction'],
    queryFn: () => api.prediction(token!),
    enabled: ready && !!token,
  });

  const logPeriod = useMutation({
    mutationFn: () => api.addPeriodDay(token!, { date: todayISO(), flow: 'medium' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar'] }),
  });
  const addWater = useMutation({
    mutationFn: () => api.logWater(token!, { date: todayISO(), ml: 250 }),
  });

  if (!ready || !token) {
    return <main className="space-y-6 min-h-[40vh]" aria-busy="true" />;
  }

  const p = prediction.data;
  const total = p?.avgCycleLength ?? 28;
  const until = p ? daysUntil(p.nextPeriodStart) : null;
  const cycleDay = until !== null ? Math.max(1, Math.min(total, total - until + 1)) : 1;

  return (
    <main className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-lunar-dim">{todayLabel || '\u00A0'}</p>
        <h1 className="font-display text-3xl text-lunar-bright">
          {t('greeting', { name: me.data?.displayName?.split(' ')[0] ?? '…' })}
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-rose-glow py-8 text-center shadow-card">
          <CycleRing day={cycleDay} total={total} />
          {until !== null && (
            <p className="mt-2 text-sm text-lunar">
              {until > 0 ? (
                <>
                  {t('nextPeriod')}:{' '}
                  <strong className="text-tide-soft">
                    {until} {until === 1 ? 'dan' : 'dana'}
                  </strong>
                </>
              ) : (
                <strong className="text-tide-soft">{t('periodNow')}</strong>
              )}
            </p>
          )}
        </Card>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => logPeriod.mutate()}
          className="flex flex-col items-center gap-2 rounded-2xl border border-tide/30 bg-tide/10 p-4 text-xs text-lunar-bright transition active:scale-95"
        >
          <HeartPulse className="h-6 w-6 text-tide-soft" />
          {logPeriod.isSuccess ? '✓' : t('logPeriod')}
        </button>
        <button
          onClick={() => addWater.mutate()}
          className="flex flex-col items-center gap-2 rounded-2xl border border-iris/30 bg-iris/10 p-4 text-xs text-lunar-bright transition active:scale-95"
        >
          <Droplets className="h-6 w-6 text-iris-soft" />
          {addWater.isSuccess ? '✓ 250ml' : '+250ml'}
        </button>
        <Link
          href="/log"
          className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-lunar-bright transition active:scale-95"
        >
          <Sparkles className="h-6 w-6 text-lunar" />
          {t('quickLog')}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-widest text-lunar-dim">{t('nextPeriod')}</p>
          <p className="mt-2 font-display text-2xl text-lunar-bright">
            {p?.nextPeriodStart?.slice(0, 10) ?? '—'}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-lunar-dim">{t('fertileWindow')}</p>
          <p className="mt-2 font-display text-2xl text-iris-soft">
            {p ? `${p.fertileStart.slice(5, 10)} – ${p.fertileEnd.slice(5, 10)}` : '—'}
          </p>
        </Card>
      </div>
    </main>
  );
}
