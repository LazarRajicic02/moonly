
'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getAccessToken, clearAccessToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SettingsPage() {
  const token = getAccessToken()!;
  const prefs = useQuery({ queryKey: ['prefs'], queryFn: () => api.notificationPrefs(token) });
  const plans = useQuery({ queryKey: ['plans'], queryFn: () => api.billingPlans(token) });
  const exportData = useMutation({ mutationFn: () => api.gdprExport(token) });
  const deleteAccount = useMutation({
    mutationFn: () => api.gdprDelete(token),
    onSuccess: () => {
      clearAccessToken();
      window.location.href = '/en';
    },
  });
  const checkout = useMutation({ mutationFn: () => api.checkout(token) });

  return (
    <main className="space-y-6">
      <h1 className="font-display text-3xl text-lunar-bright">Settings</h1>
      <Card>
        <h2 className="text-lg">Notifications</h2>
        <pre className="mt-2 text-xs text-lunar-dim">{JSON.stringify(prefs.data, null, 2)}</pre>
      </Card>
      <Card>
        <h2 className="text-lg">Subscription</h2>
        <pre className="mt-2 text-xs text-lunar-dim">{JSON.stringify(plans.data, null, 2)}</pre>
        <Button className="mt-3" variant="secondary" onClick={() => checkout.mutate()}>Checkout (Stripe placeholder)</Button>
      </Card>
      <Card>
        <h2 className="text-lg">Privacy (GDPR)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => exportData.mutate()}>Export my data</Button>
          <Button variant="outline" onClick={() => deleteAccount.mutate()}>Delete account</Button>
        </div>
      </Card>
    </main>
  );
}
