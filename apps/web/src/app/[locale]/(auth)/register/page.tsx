'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { api } from '@/lib/api';
import { setAccessToken } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  displayName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  dateOfBirth: z.string().optional(),
  heightCm: z.string().optional(),
  weightKg: z.string().optional(),
  lastPeriod: z.string().optional(),
  cycleLen: z.string().default('28'),
  periodLen: z.string().default('5'),
});

type Form = z.infer<typeof schema>;

const GOALS = ['track_cycle', 'conceive', 'pregnancy', 'symptoms', 'wellness'] as const;

export default function RegisterPage() {
  const t = useTranslations('register');
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<string[]>(['track_cycle']);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { cycleLen: '28', periodLen: '5' },
  });

  const steps = [t('stepAccount'), t('stepBody'), t('stepCycle'), t('stepGoals')];

  async function next() {
    if (step === 0) {
      const ok = await form.trigger(['displayName', 'email', 'password']);
      if (!ok) return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  const onSubmit = form.handleSubmit(async (v) => {
    setError(null);
    try {
      const res = await api.register({
        displayName: v.displayName,
        email: v.email,
        password: v.password,
      });
      setAccessToken(res.accessToken);
      const token = res.accessToken;

      await api.updateMe(token, {
        dateOfBirth: v.dateOfBirth || undefined,
        heightCm: v.heightCm ? Number(v.heightCm) : undefined,
        averageCycleLen: Number(v.cycleLen) || 28,
        averagePeriodLen: Number(v.periodLen) || 5,
        goals,
      });
      if (v.lastPeriod) {
        await api.createCycle(token, { startDate: v.lastPeriod });
      }
      if (v.weightKg) {
        await api.logWeight(token, {
          date: new Date().toISOString().slice(0, 10),
          kg: Number(v.weightKg),
        });
      }
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error'));
    }
  });

  return (
    <main className="flex min-h-dvh items-center justify-center bg-luna-hero px-4 py-8">
      <div className="w-full max-w-md">
        <p className="mb-2 text-center font-display text-4xl text-lunar-bright">Luna</p>
        <div className="mb-6 flex justify-center gap-2" role="progressbar" aria-valuenow={step + 1} aria-valuemax={4}>
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === step ? 'w-8 bg-tide' : 'w-3 bg-white/15',
                i < step && 'bg-tide/50',
              )}
            />
          ))}
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-3xl border border-white/10 bg-ink-soft/70 p-6 shadow-card"
        >
          <h1 className="font-display text-2xl text-lunar-bright">{steps[step]}</h1>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {step === 0 && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName">{t('name')}</Label>
                    <Input id="displayName" autoComplete="name" {...form.register('displayName')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">{t('password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      {...form.register('password')}
                    />
                    <p className="text-xs text-lunar-dim">{t('passwordHint')}</p>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="dateOfBirth">{t('dob')}</Label>
                    <Input id="dateOfBirth" type="date" {...form.register('dateOfBirth')} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="heightCm">{t('height')}</Label>
                      <Input id="heightCm" type="number" inputMode="numeric" placeholder="168" {...form.register('heightCm')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="weightKg">{t('weight')}</Label>
                      <Input id="weightKg" type="number" inputMode="decimal" placeholder="62" {...form.register('weightKg')} />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastPeriod">{t('lastPeriod')}</Label>
                    <Input id="lastPeriod" type="date" {...form.register('lastPeriod')} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="cycleLen">{t('cycleLen')}</Label>
                      <Input id="cycleLen" type="number" inputMode="numeric" {...form.register('cycleLen')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="periodLen">{t('periodLen')}</Label>
                      <Input id="periodLen" type="number" inputMode="numeric" {...form.register('periodLen')} />
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() =>
                        setGoals((cur) =>
                          cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g],
                        )
                      }
                      className={cn(
                        'rounded-full border px-4 py-2.5 text-sm transition active:scale-95',
                        goals.includes(g)
                          ? 'border-tide bg-tide/20 text-tide-soft'
                          : 'border-white/10 bg-white/5 text-lunar',
                      )}
                    >
                      {t(`goals.${g}`)}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                {t('back')}
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button type="button" className="flex-1" onClick={next}>
                {t('next')}
              </Button>
            ) : (
              <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? '…' : t('finish')}
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-lunar-dim">
            <Link href="/login" className="underline">
              {t('haveAccount')}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
