'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Check, Pill, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { addDaysISO, currentPeriodPredictedDays } from '@/lib/cycle-utils';
import { isMedTakenOnDay } from '@/lib/medication-utils';
import { todayISO } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

type Med = {
  id: string;
  name: string;
  dosage?: string;
  active?: boolean;
  schedules?: Array<{ timeOfDay: string; daysOfWeek: number[]; enabled?: boolean }>;
  doses?: Array<{ medicationId: string; takenAt?: string | null; scheduledAt: string }>;
};

export default function MedicationsPage() {
  const t = useTranslations('medications');
  const token = getAccessToken()!;
  const qc = useQueryClient();
  const today = todayISO();

  const list = useQuery({
    queryKey: ['meds'],
    queryFn: () => api.medications(token) as Promise<Med[]>,
  });

  const cal = useQuery({
    queryKey: ['calendar-med-check', today],
    queryFn: () =>
      api.calendar(token, addDaysISO(today, -14), addDaysISO(today, 14)) as Promise<{
        periodDays: Array<{ date: string }>;
        prediction?: { avgPeriodLength?: number } | null;
      }>,
  });

  const isPeriodToday = useMemo(() => {
    if (!cal.data) return false;
    const periodDays = (cal.data.periodDays ?? []).map((d) => String(d.date).slice(0, 10));
    if (periodDays.includes(today)) return true;
    const predictedRemaining = currentPeriodPredictedDays(
      periodDays,
      cal.data.prediction?.avgPeriodLength ?? 5,
      today,
    );
    return predictedRemaining.includes(today);
  }, [cal.data, today]);
  const form = useForm({ defaultValues: { name: '', dosage: '', reminderTimes: '09:00' } });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['meds'] });
    void qc.invalidateQueries({ queryKey: ['calendar'] });
  };

  const create = useMutation({
    mutationFn: (v: { name: string; dosage: string; reminderTimes: string }) =>
      api.createMedication(token, {
        name: v.name,
        dosage: v.dosage,
        reminderTimes: v.reminderTimes
          ? v.reminderTimes.split(',').map((s) => s.trim())
          : [],
      }),
    onSuccess: () => {
      invalidate();
      form.reset({ name: '', dosage: '', reminderTimes: '09:00' });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.deleteMedication(token, id),
    onSuccess: invalidate,
  });

  const take = useMutation({
    mutationFn: (id: string) => api.takeMedication(token, id, today),
    onSuccess: invalidate,
  });

  const untake = useMutation({
    mutationFn: (id: string) => api.untakeMedication(token, id, today),
    onSuccess: invalidate,
  });

  return (
    <main className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-lunar-bright">{t('title')}</h1>
        <p className="mt-1 text-sm text-lunar-dim">{t('subtitle')}</p>
      </div>

      <Card className="shadow-card">
        <form className="space-y-3" onSubmit={form.handleSubmit((v) => create.mutate(v))}>
          <div className="space-y-1.5">
            <Label htmlFor="name">{t('name')}</Label>
            <Input id="name" placeholder="Pulsatilla" {...form.register('name', { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dosage">{t('dosage')}</Label>
            <Input id="dosage" placeholder="1 tableta" {...form.register('dosage')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reminders">{t('reminders')}</Label>
            <Input id="reminders" placeholder="08:00, 20:00" {...form.register('reminderTimes')} />
            <p className="text-xs text-lunar-dim">{t('remindersHint')}</p>
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {t('add')}
          </Button>
        </form>
      </Card>

      <div className="space-y-2">
        {list.data?.length === 0 && <p className="text-sm text-lunar-dim">{t('empty')}</p>}
        {list.data?.map((m) => {
          const times = (m.schedules ?? []).map((s) => s.timeOfDay);
          const isDaily = (m.schedules ?? []).some((s) => s.daysOfWeek.length === 7);
          const takenToday = isMedTakenOnDay(m.id, today, m.doses ?? []);
          return (
            <Card key={m.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <Pill className="mt-0.5 h-5 w-5 shrink-0 text-tide-soft" />
                  <div>
                    <p className="text-lunar-bright">{m.name}</p>
                    {m.dosage && <p className="text-sm text-lunar-dim">{m.dosage}</p>}
                    {times.length > 0 && (
                      <p className="mt-1 text-xs text-iris-soft">
                        {t('times')}: {times.join(' · ')}
                        {isDaily && ` · ${t('daily')}`}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  aria-label={t('delete')}
                  onClick={() => remove.mutate(m.id)}
                  className="rounded-full p-2 text-lunar-dim transition hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => (takenToday ? untake.mutate(m.id) : take.mutate(m.id))}
                disabled={isPeriodToday && !takenToday}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm transition active:scale-95',
                  isPeriodToday && !takenToday
                    ? 'cursor-not-allowed border-white/5 bg-white/5 text-lunar-dim'
                    : takenToday
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-tide/40 bg-tide/10 text-tide-soft',
                )}
              >
                {isPeriodToday && !takenToday ? (
                  t('periodSkip')
                ) : takenToday ? (
                  <>
                    <Check className="h-4 w-4" />
                    {t('takenToday')}
                  </>
                ) : (
                  t('takeToday')
                )}
              </button>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
