
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { api } from '@/lib/api';
import { setAccessToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/routing';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await api.login(values);
    setAccessToken(res.accessToken);
    router.push('/dashboard');
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-luna-hero px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-ink-soft/70 p-8">
        <h1 className="font-display text-3xl text-lunar-bright">{t('loginTitle')}</h1>
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input id="email" type="email" {...form.register('email')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <Input id="password" type="password" {...form.register('password')} />
        </div>
        {form.formState.errors.root && (
          <p className="text-sm text-red-300">{form.formState.errors.root.message}</p>
        )}
        <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
          {t('submitLogin')}
        </Button>
        <p className="text-sm text-lunar-dim">
          <Link href="/register" className="underline">
            {t('registerTitle')}
          </Link>
        </p>
      </form>
    </main>
  );
}
