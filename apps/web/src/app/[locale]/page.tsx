
'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen bg-luna-hero text-lunar-bright">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl tracking-tight">{t('brand')}</span>
        <Button asChild variant="ghost">
          <Link href="/login">{t('ctaLogin')}</Link>
        </Button>
      </header>

      <section className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-6 pb-24 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <p className="font-display text-6xl leading-none tracking-tight md:text-8xl">{t('brand')}</p>
          <h1 className="mt-6 font-display text-3xl text-lunar md:text-4xl">{t('tagline')}</h1>
          <p className="mt-4 max-w-lg text-lg text-lunar-dim">{t('heroSubtitle')}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/register">{t('ctaStart')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">{t('ctaLogin')}</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="pointer-events-none absolute right-[-10%] top-16 hidden h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(232,236,244,0.35),rgba(91,164,164,0.12)_45%,transparent_70%)] blur-2xl md:block"
        />
      </section>
    </main>
  );
}
