'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Baby } from 'lucide-react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

type PregnancyProfile = { dueDate?: string; active?: boolean };

function pregnancyWeek(dueDate: string) {
  const due = new Date(dueDate.slice(0, 10) + 'T00:00:00.000Z');
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  const daysLeft = Math.round((due.getTime() - now.getTime()) / 86400000);
  const week = Math.max(1, Math.min(40, Math.round((280 - daysLeft) / 7)));
  return { week, daysLeft };
}

export default function PregnancyPage() {
  const t = useTranslations('pregnancy');
  const token = getAccessToken()!;
  const qc = useQueryClient();
  const data = useQuery({
    queryKey: ['pregnancy'],
    queryFn: () => api.pregnancy(token) as Promise<PregnancyProfile | null>,
  });
  const form = useForm({ defaultValues: { dueDate: '' } });

  const save = useMutation({
    mutationFn: (v: { dueDate: string }) =>
      api.upsertPregnancy(token, { dueDate: v.dueDate || undefined, active: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pregnancy'] }),
  });

  const profile = data.data;
  const stats = profile?.dueDate ? pregnancyWeek(profile.dueDate) : null;

  return (
    <main className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-lunar-bright">{t('title')}</h1>
        <p className="mt-1 text-sm text-lunar-dim">{t('subtitle')}</p>
      </div>

      {profile?.dueDate && stats ? (
        <Card className="bg-rose-glow py-8 text-center shadow-card">
          <Baby className="mx-auto h-10 w-10 text-tide-soft" />
          <p className="mt-3 text-xs uppercase tracking-widest text-lunar-dim">{t('active')}</p>
          <p className="font-display text-5xl text-lunar-bright">
            {t('week')} {stats.week}
          </p>
          <p className="mt-2 text-sm text-lunar">
            {t('dueDate')}: <strong>{profile.dueDate.slice(0, 10)}</strong>
          </p>
          <p className="mt-1 text-sm text-tide-soft">
            {stats.daysLeft > 0 ? `${stats.daysLeft} ${t('daysLeft')}` : '🎉'}
          </p>
        </Card>
      ) : (
        <Card className="shadow-card">
          <p className="text-lunar-dim">{t('empty')}</p>
          <p className="mt-1 text-sm text-lunar-dim">{t('emptyHint')}</p>
        </Card>
      )}

      <Card className="shadow-card">
        <form className="space-y-3" onSubmit={form.handleSubmit((v) => save.mutate(v))}>
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">{t('dueDate')}</Label>
            <Input id="dueDate" type="date" {...form.register('dueDate', { required: true })} />
          </div>
          <Button type="submit" className="w-full" disabled={save.isPending}>
            {profile?.dueDate ? t('update') : t('enable')}
          </Button>
        </form>
      </Card>
    </main>
  );
}
