'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { MoodChart, SymptomChart, WaterChart } from '@/features/stats/charts';

type Tab = 'overview' | 'symptoms' | 'moods' | 'intimacy' | 'body';

export default function StatsPage() {
  const t = useTranslations('stats');
  const tLog = useTranslations('log');
  const token = getAccessToken()!;
  const [tab, setTab] = useState<Tab>('overview');

  const q = useQuery({ queryKey: ['stats'], queryFn: () => api.stats(token) });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('tabs.overview') },
    { key: 'symptoms', label: t('tabs.symptoms') },
    { key: 'moods', label: t('tabs.moods') },
    { key: 'intimacy', label: t('tabs.intimacy') },
    { key: 'body', label: t('tabs.body') },
  ];

  if (!q.data) return <p className="text-lunar-dim">{t('loading')}</p>;

  const symptomLabels = Object.fromEntries(
    Object.keys(q.data.symptomFrequency).map((k) => [k, tLog(`symptom.${k}` as 'symptom.cramps')]),
  );
  const moodLabels = Object.fromEntries(
    Object.keys(q.data.moodDistribution).map((k) => [k, tLog(`moods.${k}` as 'moods.happy')]),
  );

  const labeledSymptoms = Object.fromEntries(
    Object.entries(q.data.symptomFrequency).map(([k, v]) => [symptomLabels[k] ?? k, v]),
  );
  const labeledMoods = Object.fromEntries(
    Object.entries(q.data.moodDistribution).map(([k, v]) => [moodLabels[k] ?? k, v]),
  );

  return (
    <main className="space-y-5">
      <h1 className="font-display text-3xl text-lunar-bright">{t('title')}</h1>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-xs transition active:scale-95',
              tab === key
                ? 'border-tide bg-tide/20 text-tide-soft'
                : 'border-white/10 bg-white/5 text-lunar',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <p className="text-xs text-lunar-dim">{t('symptoms')}</p>
              <p className="font-display text-2xl text-lunar-bright">{q.data.counts.symptoms}</p>
            </Card>
            <Card>
              <p className="text-xs text-lunar-dim">{t('moods')}</p>
              <p className="font-display text-2xl text-lunar-bright">{q.data.counts.moods}</p>
            </Card>
            <Card>
              <p className="text-xs text-lunar-dim">{t('avgCycle')}</p>
              <p className="font-display text-2xl text-tide-soft">{q.data.averageCycleLength}d</p>
            </Card>
          </div>
          {q.data.prediction && (
            <Card>
              <p className="text-xs text-lunar-dim">{t('cycles')}</p>
              <p className="mt-1 text-sm text-lunar">
                Sledeća:{' '}
                <strong className="text-lunar-bright">
                  {q.data.prediction.nextPeriodStart.slice(0, 10)}
                </strong>{' '}
                · {q.data.prediction.avgPeriodLength} dana
              </p>
            </Card>
          )}
        </div>
      )}

      {tab === 'symptoms' && (
        <Card>
          <h2 className="mb-3 font-display text-lg text-lunar-bright">{t('symptoms')}</h2>
          {Object.keys(labeledSymptoms).length === 0 ? (
            <p className="text-sm text-lunar-dim">{t('loading')}</p>
          ) : (
            <SymptomChart data={labeledSymptoms} />
          )}
        </Card>
      )}

      {tab === 'moods' && (
        <Card>
          <h2 className="mb-3 font-display text-lg text-lunar-bright">{t('moods')}</h2>
          {Object.keys(labeledMoods).length === 0 ? (
            <p className="text-sm text-lunar-dim">{t('loading')}</p>
          ) : (
            <MoodChart data={labeledMoods} />
          )}
        </Card>
      )}

      {tab === 'intimacy' && (
        <div className="space-y-3">
          <p className="text-sm text-lunar-dim">
            {t('intimacyCount', { count: q.data.intimacy.length })}
          </p>
          {q.data.intimacy.filter((r) => r.rating).length > 0 && (
            <Card className="py-4 text-center">
              <p className="text-xs text-lunar-dim">{t('avgRating')}</p>
              <p className="font-display text-3xl text-tide-soft">
                {(
                  q.data.intimacy
                    .filter((r) => r.rating)
                    .reduce((a, r) => a + (r.rating ?? 0), 0) /
                  q.data.intimacy.filter((r) => r.rating).length
                ).toFixed(1)}
                <span className="text-lg text-lunar-dim"> / 5</span>
              </p>
            </Card>
          )}
          {q.data.intimacy.length === 0 ? (
            <Card>
              <p className="text-sm text-lunar-dim">{t('intimacyEmpty')}</p>
            </Card>
          ) : (
            q.data.intimacy.map((row) => (
              <Card key={row.id} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-lunar-bright">
                      {String(row.date).slice(0, 10)}
                    </p>
                    {row.location && (
                      <p className="text-xs text-lunar-dim">
                        {tLog(`locations.${row.location}` as 'locations.home')}
                      </p>
                    )}
                    {row.notes && <p className="text-xs text-lunar-dim">{row.notes}</p>}
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-3 py-1 text-xs',
                      row.protected
                        ? 'bg-iris/20 text-iris-soft'
                        : 'bg-tide/20 text-tide-soft',
                    )}
                  >
                    {row.protected ? t('protected') : t('unprotected')}
                  </span>
                </div>
                {row.rating && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={cn(
                          'text-sm',
                          n <= row.rating! ? 'text-tide-soft' : 'text-white/15',
                        )}
                      >
                        ♥
                      </span>
                    ))}
                    <span className="ml-2 text-xs text-lunar-dim">
                      {tLog(`ratingLabels.${row.rating}` as 'ratingLabels.1')}
                    </span>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {tab === 'body' && (
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-display text-lg text-lunar-bright">{t('water')}</h2>
            <WaterChart data={q.data.series.water} />
          </Card>
          {q.data.series.sleep.length > 0 && (
            <Card>
              <h2 className="mb-3 font-display text-lg text-lunar-bright">{t('sleep')}</h2>
              <div className="space-y-2">
                {q.data.series.sleep.slice(-7).map((s) => (
                  <div key={String(s.date)} className="flex justify-between text-sm">
                    <span className="text-lunar-dim">{String(s.date).slice(0, 10)}</span>
                    <span className="text-lunar-bright">{s.hours}h</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {q.data.series.weight.length > 0 && (
            <Card>
              <h2 className="mb-3 font-display text-lg text-lunar-bright">{t('weight')}</h2>
              <div className="space-y-2">
                {q.data.series.weight.slice(-7).map((w) => (
                  <div key={String(w.date)} className="flex justify-between text-sm">
                    <span className="text-lunar-dim">{String(w.date).slice(0, 10)}</span>
                    <span className="text-lunar-bright">{w.kg} kg</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}
