'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { cn, todayISO } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SYMPTOMS = [
  { value: 'cramps', emoji: '🌀' },
  { value: 'headache', emoji: '🤕' },
  { value: 'bloating', emoji: '🎈' },
  { value: 'fatigue', emoji: '😴' },
  { value: 'breast_tenderness', emoji: '💗' },
  { value: 'acne', emoji: '✨' },
  { value: 'backache', emoji: '🔥' },
  { value: 'nausea', emoji: '🤢' },
  { value: 'cravings', emoji: '🍫' },
  { value: 'insomnia', emoji: '🌙' },
  { value: 'spotting', emoji: '🩸' },
] as const;

const MOODS = [
  { value: 'happy', emoji: '😊' },
  { value: 'calm', emoji: '😌' },
  { value: 'anxious', emoji: '😰' },
  { value: 'irritable', emoji: '😤' },
  { value: 'sad', emoji: '😢' },
  { value: 'energetic', emoji: '⚡' },
  { value: 'low_energy', emoji: '🥱' },
  { value: 'stressed', emoji: '😫' },
  { value: 'neutral', emoji: '😐' },
] as const;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs transition active:scale-95',
        active
          ? 'border-tide bg-tide/20 text-tide-soft shadow-glow'
          : 'border-white/10 bg-white/5 text-lunar',
      )}
    >
      {children}
    </button>
  );
}

function Scale({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs text-lunar-dim">{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            aria-label={`${label} ${n}`}
            onClick={() => onChange(n)}
            className={cn(
              'h-9 flex-1 rounded-xl border text-sm transition active:scale-95',
              n <= value
                ? 'border-tide bg-tide/25 text-tide-soft'
                : 'border-white/10 bg-white/5 text-lunar-dim',
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LogPage() {
  const t = useTranslations('log');
  const token = getAccessToken()!;
  const qc = useQueryClient();

  const [date, setDate] = useState(todayISO());
  const [symptom, setSymptom] = useState<string | null>(null);
  const [severity, setSeverity] = useState(3);
  const [mood, setMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState('');
  const [intimacyProtected, setIntimacyProtected] = useState<boolean | null>(null);
  const [intimacyRating, setIntimacyRating] = useState(4);
  const [intimacyLocation, setIntimacyLocation] = useState<string | null>(null);

  const LOCATIONS = [
    { value: 'home', emoji: '🏠' },
    { value: 'partner', emoji: '💑' },
    { value: 'hotel', emoji: '🏨' },
    { value: 'auto', emoji: '🚗' },
    { value: 'outdoors', emoji: '🌿' },
    { value: 'other', emoji: '📍' },
  ] as const;

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['calendar'] });
    void qc.invalidateQueries({ queryKey: ['stats'] });
  };

  const saveSymptom = useMutation({
    mutationFn: () => api.createSymptom(token, { date, type: symptom, severity }),
    onSuccess: () => {
      setSymptom(null);
      invalidate();
    },
  });
  const saveMood = useMutation({
    mutationFn: () => api.createMood(token, { date, mood, intensity }),
    onSuccess: () => {
      setMood(null);
      invalidate();
    },
  });
  const saveIntimacy = useMutation({
    mutationFn: () =>
      api.createIntimacy(token, {
        date,
        protected: intimacyProtected ?? undefined,
        rating: intimacyRating,
        location: intimacyLocation ?? undefined,
      }),
    onSuccess: () => {
      setIntimacyProtected(null);
      setIntimacyLocation(null);
      setIntimacyRating(4);
      invalidate();
    },
  });
  const saveNote = useMutation({
    mutationFn: () => api.createNote(token, { date, content: note }),
    onSuccess: () => setNote(''),
  });

  return (
    <main className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-lunar-bright">{t('title')}</h1>
      </motion.div>

      <div className="flex items-center gap-3">
        <label htmlFor="log-date" className="text-sm text-lunar-dim">
          {t('date')}
        </label>
        <Input
          id="log-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="max-w-[180px]"
        />
      </div>

      <Card className="shadow-card">
        <h2 className="font-display text-xl text-lunar-bright">{t('symptoms')}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => (
            <Chip key={s.value} active={symptom === s.value} onClick={() => setSymptom(s.value)}>
              <span aria-hidden>{s.emoji}</span> {t(`symptom.${s.value}`)}
            </Chip>
          ))}
        </div>
        {symptom && (
          <>
            <Scale value={severity} onChange={setSeverity} label={t('severity')} />
            <Button className="mt-4 w-full" onClick={() => saveSymptom.mutate()}>
              {saveSymptom.isPending ? '…' : t('save')}
            </Button>
          </>
        )}
        {saveSymptom.isSuccess && !symptom && (
          <p className="mt-2 text-sm text-tide-soft">✓ {t('saved')}</p>
        )}
      </Card>

      <Card className="shadow-card">
        <h2 className="font-display text-xl text-lunar-bright">{t('mood')}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <Chip key={m.value} active={mood === m.value} onClick={() => setMood(m.value)}>
              <span aria-hidden>{m.emoji}</span> {t(`moods.${m.value}`)}
            </Chip>
          ))}
        </div>
        {mood && (
          <>
            <Scale value={intensity} onChange={setIntensity} label={t('intensity')} />
            <Button className="mt-4 w-full" onClick={() => saveMood.mutate()}>
              {saveMood.isPending ? '…' : t('save')}
            </Button>
          </>
        )}
        {saveMood.isSuccess && !mood && <p className="mt-2 text-sm text-tide-soft">✓ {t('saved')}</p>}
      </Card>

      <Card className="shadow-card">
        <h2 className="font-display text-xl text-lunar-bright">{t('intimacy')}</h2>

        <p className="mt-3 text-xs text-lunar-dim">{t('protected')} / {t('unprotected')}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => setIntimacyProtected(true)}
            className={cn(
              'rounded-xl border px-4 py-3 text-sm transition active:scale-95',
              intimacyProtected === true
                ? 'border-iris bg-iris/20 text-iris-soft'
                : 'border-white/10 bg-white/5 text-lunar',
            )}
          >
            💜 {t('protected')}
          </button>
          <button
            onClick={() => setIntimacyProtected(false)}
            className={cn(
              'rounded-xl border px-4 py-3 text-sm transition active:scale-95',
              intimacyProtected === false
                ? 'border-tide bg-tide/20 text-tide-soft'
                : 'border-white/10 bg-white/5 text-lunar',
            )}
          >
            ❤️ {t('unprotected')}
          </button>
        </div>

        <Scale value={intimacyRating} onChange={setIntimacyRating} label={t('rating')} />
        <p className="mt-1 text-center text-xs text-tide-soft">
          {t(`ratingLabels.${intimacyRating}` as 'ratingLabels.1')}
        </p>

        <p className="mt-4 text-xs text-lunar-dim">{t('location')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LOCATIONS.map((loc) => (
            <Chip
              key={loc.value}
              active={intimacyLocation === loc.value}
              onClick={() => setIntimacyLocation(loc.value)}
            >
              <span aria-hidden>{loc.emoji}</span> {t(`locations.${loc.value}`)}
            </Chip>
          ))}
        </div>

        <Button
          className="mt-4 w-full"
          disabled={intimacyProtected === null}
          onClick={() => saveIntimacy.mutate()}
        >
          {saveIntimacy.isPending ? '…' : t('saveIntimacy')}
        </Button>
        {saveIntimacy.isSuccess && intimacyProtected === null && (
          <p className="mt-2 text-sm text-tide-soft">✓ {t('saved')}</p>
        )}
      </Card>

      <Card className="shadow-card">
        <h2 className="font-display text-xl text-lunar-bright">{t('diary')}</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('diaryPlaceholder')}
          rows={3}
          className="mt-3 w-full rounded-xl border border-white/10 bg-ink-soft/80 px-3 py-2 text-sm text-lunar-bright placeholder:text-lunar-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tide"
        />
        <Button
          className="mt-3 w-full"
          disabled={!note.trim()}
          onClick={() => saveNote.mutate()}
        >
          {saveNote.isPending ? '…' : t('save')}
        </Button>
        {saveNote.isSuccess && <p className="mt-2 text-sm text-tide-soft">✓ {t('saved')}</p>}
      </Card>
    </main>
  );
}
