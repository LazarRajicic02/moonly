'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Droplets, Moon, Scale } from 'lucide-react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { todayISO } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function TrackingPage() {
  const t = useTranslations('tracking');
  const token = getAccessToken()!;
  const qc = useQueryClient();
  const data = useQuery({
    queryKey: ['tracking'],
    queryFn: () =>
      api.tracking(token) as Promise<{
        water?: Array<{ date: string; ml: number }>;
        sleep?: Array<{ date: string; hours: number }>;
        weight?: Array<{ date: string; kg: number }>;
      }>,
  });

  const water = useForm({ defaultValues: { date: todayISO(), ml: 250 } });
  const sleep = useForm({ defaultValues: { date: todayISO(), hours: 7 } });
  const weight = useForm({ defaultValues: { date: todayISO(), kg: 60 } });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['tracking'] });
    void qc.invalidateQueries({ queryKey: ['stats'] });
  };

  const logWater = useMutation({
    mutationFn: (v: { date: string; ml: number }) => api.logWater(token, v),
    onSuccess: invalidate,
  });
  const logSleep = useMutation({
    mutationFn: (v: { date: string; hours: number }) => api.logSleep(token, v),
    onSuccess: invalidate,
  });
  const logWeight = useMutation({
    mutationFn: (v: { date: string; kg: number }) => api.logWeight(token, v),
    onSuccess: invalidate,
  });

  const recentWater = (data.data?.water ?? []).slice(-5).reverse();
  const recentSleep = (data.data?.sleep ?? []).slice(-5).reverse();
  const recentWeight = (data.data?.weight ?? []).slice(-5).reverse();

  return (
    <main className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-lunar-bright">{t('title')}</h1>
        <p className="mt-1 text-sm text-lunar-dim">{t('subtitle')}</p>
      </div>

      <Card className="shadow-card">
        <h2 className="flex items-center gap-2 font-display text-lg text-lunar-bright">
          <Droplets className="h-5 w-5 text-iris-soft" />
          {t('water')}
        </h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={water.handleSubmit((v) => logWater.mutate({ ...v, ml: Number(v.ml) }))}
        >
          <Input type="number" inputMode="numeric" className="flex-1" {...water.register('ml')} />
          <Button type="submit" disabled={logWater.isPending}>
            +{water.watch('ml')}ml
          </Button>
        </form>
        {recentWater.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
            {recentWater.map((w) => (
              <div key={String(w.date) + w.ml} className="flex justify-between text-xs text-lunar-dim">
                <span>{String(w.date).slice(0, 10)}</span>
                <span className="text-lunar">{w.ml} ml</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="shadow-card">
        <h2 className="flex items-center gap-2 font-display text-lg text-lunar-bright">
          <Moon className="h-5 w-5 text-iris-soft" />
          {t('sleep')}
        </h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={sleep.handleSubmit((v) => logSleep.mutate({ ...v, hours: Number(v.hours) }))}
        >
          <Input type="number" step="0.5" inputMode="decimal" className="flex-1" {...sleep.register('hours')} />
          <Button type="submit" disabled={logSleep.isPending}>
            {t('logSleep')}
          </Button>
        </form>
        {recentSleep.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
            {recentSleep.map((s) => (
              <div key={String(s.date)} className="flex justify-between text-xs text-lunar-dim">
                <span>{String(s.date).slice(0, 10)}</span>
                <span className="text-lunar">{s.hours}h</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="shadow-card">
        <h2 className="flex items-center gap-2 font-display text-lg text-lunar-bright">
          <Scale className="h-5 w-5 text-tide-soft" />
          {t('weight')}
        </h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={weight.handleSubmit((v) => logWeight.mutate({ ...v, kg: Number(v.kg) }))}
        >
          <Input type="number" step="0.1" inputMode="decimal" className="flex-1" {...weight.register('kg')} />
          <Button type="submit" disabled={logWeight.isPending}>
            {t('logWeight')}
          </Button>
        </form>
        {recentWeight.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
            {recentWeight.map((w) => (
              <div key={String(w.date)} className="flex justify-between text-xs text-lunar-dim">
                <span>{String(w.date).slice(0, 10)}</span>
                <span className="text-lunar">{w.kg} kg</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
