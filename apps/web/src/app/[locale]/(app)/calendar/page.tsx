'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Pill } from 'lucide-react';
import { api, type Prediction } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import {
  addDaysISO,
  currentPeriodPredictedDays,
  futurePredictedPeriodDays,
  inRange,
  iso,
} from '@/lib/cycle-utils';
import {
  isMedTakenOnDay,
  medDayStatus,
  medsForDay,
  type MedDose,
  type MedWithSchedules,
} from '@/lib/medication-utils';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const WEEKDAY_LABELS: Record<string, string[]> = {
  sr: ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
const FLOW_EMOJI: Record<string, string> = {
  spotting: '🩸',
  light: '💧',
  medium: '💧💧',
  heavy: '💧💧💧',
};

type CalendarData = {
  periodDays: Array<{ date: string; flow: string }>;
  symptoms: Array<{ date: string }>;
  moods: Array<{ date: string }>;
  intimacy: Array<{ date: string }>;
  prediction: Prediction | null;
  medications: MedWithSchedules[];
  medicationDoses: MedDose[];
};

export default function CalendarPage() {
  const t = useTranslations('calendar');
  const locale = useLocale();
  const token = getAccessToken()!;
  const qc = useQueryClient();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  });
  const [selected, setSelected] = useState<string | null>(null);

  const from = iso(month);
  const to = iso(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)));
  const fetchFrom = addDaysISO(from, -14);
  const fetchTo = addDaysISO(to, 14);

  const cal = useQuery({
    queryKey: ['calendar', fetchFrom, fetchTo],
    queryFn: () => api.calendar(token, fetchFrom, fetchTo) as Promise<CalendarData>,
  });

  const invalidateAll = () => {
    void qc.invalidateQueries({ queryKey: ['calendar'] });
    void qc.invalidateQueries({ queryKey: ['prediction'] });
    void qc.invalidateQueries({ queryKey: ['cycles'] });
    void qc.invalidateQueries({ queryKey: ['stats'] });
    void qc.invalidateQueries({ queryKey: ['meds'] });
  };

  const logFlow = useMutation({
    mutationFn: (v: { date: string; flow: string }) => api.addPeriodDay(token, v),
    onSuccess: invalidateAll,
  });

  const removeDay = useMutation({
    mutationFn: (date: string) => api.removePeriodDay(token, date),
    onSuccess: () => {
      invalidateAll();
      setSelected(null);
    },
  });

  const endPeriod = useMutation({
    mutationFn: (date: string) => api.endPeriod(token, date),
    onSuccess: () => {
      invalidateAll();
      setSelected(null);
    },
  });

  const takeMed = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => api.takeMedication(token, id, date),
    onSuccess: invalidateAll,
  });

  const untakeMed = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => api.untakeMedication(token, id, date),
    onSuccess: invalidateAll,
  });

  const grid = useMemo(() => {
    const year = month.getUTCFullYear();
    const m = month.getUTCMonth();
    const firstDay = new Date(Date.UTC(year, m, 1));
    const daysInMonth = new Date(Date.UTC(year, m + 1, 0)).getUTCDate();
    const offset = (firstDay.getUTCDay() + 6) % 7;
    const cells: Array<string | null> = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(iso(new Date(Date.UTC(year, m, d))));
    }
    return cells;
  }, [month]);

  const meds = cal.data?.medications ?? [];
  const doses = cal.data?.medicationDoses ?? [];

  const periodDaysList = useMemo(
    () => (cal.data?.periodDays ?? []).map((d) => String(d.date).slice(0, 10)),
    [cal.data],
  );
  const periodSet = useMemo(
    () => new Map((cal.data?.periodDays ?? []).map((d) => [String(d.date).slice(0, 10), d.flow])),
    [cal.data],
  );
  const symptomSet = useMemo(
    () => new Set((cal.data?.symptoms ?? []).map((d) => String(d.date).slice(0, 10))),
    [cal.data],
  );
  const intimacySet = useMemo(
    () => new Set((cal.data?.intimacy ?? []).map((d) => String(d.date).slice(0, 10))),
    [cal.data],
  );

  const p = cal.data?.prediction;
  const periodLen = p?.avgPeriodLength ?? 5;
  const cycleLen = p?.avgCycleLength ?? 28;
  const fertileFrom = p?.fertileStart?.slice(0, 10);
  const fertileTo = p?.fertileEnd?.slice(0, 10);

  const currentPredictedSet = useMemo(
    () => new Set(currentPeriodPredictedDays(periodDaysList, periodLen)),
    [periodDaysList, periodLen],
  );

  const futurePredictedSet = useMemo(
    () =>
      futurePredictedPeriodDays(p?.nextPeriodStart, periodLen, cycleLen, from, to),
    [p?.nextPeriodStart, periodLen, cycleLen, from, to],
  );

  /** No medication reminders on logged or predicted menstrual days. */
  const periodSkipSet = useMemo(() => {
    const skip = new Set(periodDaysList);
    currentPredictedSet.forEach((d) => skip.add(d));
    futurePredictedSet.forEach((d) => skip.add(d));
    return skip;
  }, [periodDaysList, currentPredictedSet, futurePredictedSet]);

  const selectedIsPeriod = selected ? periodSkipSet.has(selected) : false;
  const selectedMeds = selected && !selectedIsPeriod ? medsForDay(meds, selected, periodSkipSet) : [];

  const today = iso(new Date());
  const monthLabel = month.toLocaleDateString(locale === 'sr' ? 'sr-Latn-RS' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
  const weekdays = WEEKDAY_LABELS[locale] ?? WEEKDAY_LABELS.en!;

  return (
    <main className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl capitalize text-lunar-bright">{monthLabel}</h1>
        <div className="flex gap-1">
          <button
            aria-label={t('prevMonth')}
            onClick={() =>
              setMonth(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() - 1, 1)))
            }
            className="rounded-full p-2.5 text-lunar transition hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label={t('nextMonth')}
            onClick={() =>
              setMonth(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1)))
            }
            className="rounded-full p-2.5 text-lunar transition hover:bg-white/10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-lunar-dim">
        {weekdays.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {grid.map((day, i) => {
          if (!day) return <span key={`b${i}`} />;
          const isLoggedPeriod = periodSet.has(day);
          const isCurrentPredicted = !isLoggedPeriod && currentPredictedSet.has(day);
          const isFuturePredicted =
            !isLoggedPeriod && !isCurrentPredicted && futurePredictedSet.has(day);
          const isFertile =
            !isLoggedPeriod &&
            !isCurrentPredicted &&
            !isFuturePredicted &&
            inRange(day, fertileFrom, fertileTo);
          const medStatus = medDayStatus(day, meds, doses, periodSkipSet);
          const isToday = day === today;
          const isSelected = day === selected;
          return (
            <button
              key={day}
              onClick={() => setSelected(day)}
              aria-label={day}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm transition active:scale-95',
                isLoggedPeriod && 'bg-tide text-white shadow-glow',
                isCurrentPredicted && 'bg-tide/35 text-tide-soft ring-1 ring-tide/50',
                isFuturePredicted && 'bg-tide/20 text-tide-soft ring-1 ring-dashed ring-tide/60',
                !isLoggedPeriod && !isCurrentPredicted && !isFuturePredicted && isFertile && 'bg-iris/20 text-iris-soft',
                !isLoggedPeriod && !isCurrentPredicted && !isFuturePredicted && !isFertile && 'text-lunar hover:bg-white/5',
                isToday && !isLoggedPeriod && 'ring-2 ring-tide-soft',
                isSelected && 'ring-2 ring-lunar-bright',
              )}
            >
              {Number(day.slice(8, 10))}
              <span className="absolute bottom-1.5 flex items-center gap-0.5">
                {medStatus === 'done' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title={t('medTaken')} />
                )}
                {medStatus === 'partial' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title={t('medPartial')} />
                )}
                {medStatus === 'pending' && (
                  <span className="h-1.5 w-1.5 rounded-full border border-amber-400/80 bg-transparent" title={t('medPending')} />
                )}
                {symptomSet.has(day) && <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />}
                {intimacySet.has(day) && <span className="h-1.5 w-1.5 rounded-full bg-iris-soft" />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-lunar-dim">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-tide" /> {t('period')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> {t('medTaken')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-amber-400/80" /> {t('medPending')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-iris/40" /> {t('fertile')}
        </span>
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {/* Medications panel */}
          <Card className="shadow-card">
            <p className="flex items-center gap-2 font-display text-xl text-lunar-bright">
              <Pill className="h-5 w-5 text-tide-soft" />
              {t('medications')}
            </p>
            <p className="text-sm text-lunar-dim">{selected}</p>
            {selectedIsPeriod ? (
              <p className="mt-3 text-sm text-lunar-dim">{t('noMedsPeriod')}</p>
            ) : selectedMeds.length === 0 ? (
              <p className="mt-3 text-sm text-lunar-dim">{t('noMedsToday')}</p>
            ) : (
              <div className="mt-3 space-y-2">
                {selectedMeds.map((med) => {
                  const taken = isMedTakenOnDay(med.id, selected, doses);
                  const times = (med.schedules ?? []).map((s) => s.timeOfDay).join(', ');
                  const isDaily = (med.schedules ?? []).some((s) => s.daysOfWeek.length === 7);
                  return (
                    <div
                      key={med.id}
                      className={cn(
                        'flex items-center justify-between rounded-xl border px-3 py-2.5',
                        taken
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-amber-400/30 bg-amber-400/5',
                      )}
                    >
                      <div>
                        <p className="text-sm text-lunar-bright">{med.name}</p>
                        <p className="text-xs text-lunar-dim">
                          {med.dosage}
                          {times && ` · ${times}`}
                          {isDaily && ` · ${t('dailyReminder')}`}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          taken
                            ? untakeMed.mutate({ id: med.id, date: selected })
                            : takeMed.mutate({ id: med.id, date: selected })
                        }
                        className={cn(
                          'shrink-0 rounded-full px-3 py-1.5 text-xs transition active:scale-95',
                          taken
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-tide/20 text-tide-soft',
                        )}
                      >
                        {taken ? t('medTaken') : t('takeMed')}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Period panel */}
          <Card className="shadow-card">
            <p className="font-display text-xl text-lunar-bright">{t('logFlow')}</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {FLOW_VALUES.map((value) => (
                <button
                  key={value}
                  onClick={() => logFlow.mutate({ date: selected, flow: value })}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border p-3 text-[11px] transition active:scale-95',
                    periodSet.get(selected) === value
                      ? 'border-tide bg-tide/20 text-tide-soft'
                      : 'border-white/10 bg-white/5 text-lunar',
                  )}
                >
                  <span className="text-base leading-none">{FLOW_EMOJI[value]}</span>
                  {t(`flows.${value}`)}
                </button>
              ))}
            </div>

            {periodSet.has(selected) && (
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => endPeriod.mutate(selected)}
                  disabled={endPeriod.isPending}
                >
                  {t('endPeriod')} — {selected}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-red-300"
                  onClick={() => removeDay.mutate(selected)}
                  disabled={removeDay.isPending}
                >
                  {t('removeDay')}
                </Button>
              </div>
            )}

            {(logFlow.isSuccess || endPeriod.isSuccess || removeDay.isSuccess || takeMed.isSuccess) && (
              <p className="mt-3 text-sm text-tide-soft">✓ {t('saved')}</p>
            )}
          </Card>
        </motion.div>
      )}
    </main>
  );
}
