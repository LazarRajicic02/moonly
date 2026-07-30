'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Flower2 } from 'lucide-react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { cn, todayISO } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

const TYPES = ['bbt', 'cervical_mucus', 'opk', 'other'] as const;

type FertilitySign = { id: string; date: string; type: string; value: string };

export default function FertilityPage() {
  const t = useTranslations('fertility');
  const token = getAccessToken()!;
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['fertility'],
    queryFn: () => api.fertility(token) as Promise<FertilitySign[]>,
  });
  const form = useForm({ defaultValues: { date: todayISO(), type: 'bbt' as string, value: '' } });

  const create = useMutation({
    mutationFn: (v: { date: string; type: string; value: string }) => api.createFertility(token, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fertility'] });
      form.reset({ date: todayISO(), type: 'bbt', value: '' });
    },
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
            <Label htmlFor="date">{t('date')}</Label>
            <Input id="date" type="date" {...form.register('date')} />
          </div>

          <div className="space-y-1.5">
            <Label>{t('type')}</Label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => form.setValue('type', type)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs transition active:scale-95',
                    form.watch('type') === type
                      ? 'border-tide bg-tide/20 text-tide-soft'
                      : 'border-white/10 bg-white/5 text-lunar',
                  )}
                >
                  {t(`types.${type}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="value">{t('value')}</Label>
            <Input
              id="value"
              placeholder={form.watch('type') === 'bbt' ? '36.5' : 'pozitivan'}
              {...form.register('value', { required: true })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={create.isPending}>
            {t('log')}
          </Button>
        </form>
      </Card>

      <div className="space-y-2">
        {list.data?.length === 0 && <p className="text-sm text-lunar-dim">{t('empty')}</p>}
        {list.data?.map((f) => (
          <Card key={f.id} className="flex items-center gap-3">
            <Flower2 className="h-5 w-5 shrink-0 text-iris-soft" />
            <div className="flex-1">
              <p className="text-sm text-lunar-bright">{String(f.date).slice(0, 10)}</p>
              <p className="text-xs text-lunar-dim">
                {t(`types.${f.type}` as 'types.bbt')}: {f.value}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
