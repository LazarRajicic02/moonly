'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { CalendarHeart, Droplets, Sparkles } from 'lucide-react';
import { api, type Prediction } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { todayISO } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

type Cycle = {
  id: string;
  startDate: string;
  endDate?: string | null;
  length?: number | null;
};

export default function CyclePage() {
  const t = useTranslations('cycle');
  const token = getAccessToken()!;
  const qc = useQueryClient();
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());

  const cycles = useQuery({
    queryKey: ['cycles'],
    queryFn: () => api.cycles(token) as Promise<Cycle[]>,
  });
  const prediction = useQuery({
    queryKey: ['prediction'],
    queryFn: () => api.prediction(token) as Promise<Prediction>,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['cycles'] });
    void qc.invalidateQueries({ queryKey: ['prediction'] });
    void qc.invalidateQueries({ queryKey: ['calendar'] });
    void qc.invalidateQueries({ queryKey: ['stats'] });
  };

  const create = useMutation({
    mutationFn: () => api.createCycle(token, { startDate }),
    onSuccess: invalidate,
  });

  const endPeriod = useMutation({
    mutationFn: () => api.endPeriod(token, endDate),
    onSuccess: invalidate,
  });

  const activeCycle = cycles.data?.find((c) => !c.endDate);

  return (
    <main className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-lunar-bright">{t('title')}</h1>
      </div>

      {prediction.data && (
        <Card className="bg-rose-glow shadow-card">
          <p className="text-xs uppercase tracking-widest text-lunar-dim">{t('prediction')}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-lunar-dim">{t('nextPeriod')}</p>
              <p className="font-display text-xl text-lunar-bright">
                {prediction.data.nextPeriodStart.slice(0, 10)}
              </p>
            </div>
            <div>
              <p className="text-xs text-lunar-dim">{t('periodLength')}</p>
              <p className="font-display text-xl text-tide-soft">
                {prediction.data.avgPeriodLength} {t('days')}
              </p>
            </div>
            <div>
              <p className="text-xs text-lunar-dim">{t('cycleLength')}</p>
              <p className="font-display text-xl text-lunar-bright">
                {prediction.data.avgCycleLength} {t('days')}
              </p>
            </div>
            <div>
              <p className="text-xs text-lunar-dim">{t('fertileWindow')}</p>
              <p className="text-sm text-iris-soft">
                {prediction.data.fertileStart.slice(5, 10)} – {prediction.data.fertileEnd.slice(5, 10)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {activeCycle ? (
        <Card className="border-tide/30 shadow-card">
          <h2 className="flex items-center gap-2 font-display text-xl text-lunar-bright">
            <CalendarHeart className="h-5 w-5 text-tide-soft" />
            {t('activePeriod')}
          </h2>
          <p className="mt-1 text-sm text-lunar-dim">
            {t('started')}: {String(activeCycle.startDate).slice(0, 10)}
          </p>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="endDate">{t('endDate')}</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <p className="text-xs text-lunar-dim">{t('lengthHint')}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => endPeriod.mutate()}
              disabled={endPeriod.isPending}
            >
              {endPeriod.isSuccess ? t('endPeriodSuccess') : t('endPeriod')}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="shadow-card">
          <h2 className="flex items-center gap-2 font-medium text-lunar-bright">
            <Droplets className="h-4 w-4 text-tide-soft" />
            {t('logPeriod')}
          </h2>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">{t('startDate')}</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => create.mutate()}
              disabled={create.isPending}
            >
              {create.isSuccess ? t('logged') : t('logStart')}
            </Button>
          </div>
        </Card>
      )}

      <section>
        <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-lunar-dim">
          <Sparkles className="h-4 w-4" />
          {t('history')}
        </h2>
        <div className="mt-3 space-y-2">
          {cycles.data?.length === 0 && (
            <p className="text-sm text-lunar-dim">{t('empty')}</p>
          )}
          {cycles.data?.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-ink-soft/60 px-4 py-3"
            >
              <div>
                <p className="text-sm text-lunar-bright">
                  {String(c.startDate).slice(0, 10)}
                  {c.endDate ? ` → ${String(c.endDate).slice(0, 10)}` : ''}
                </p>
              </div>
              {c.length ? (
                <span className="rounded-full bg-tide/15 px-3 py-1 text-xs text-tide-soft">
                  {c.length} {t('days')}
                </span>
              ) : (
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-lunar-dim">
                  {t('active')}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
