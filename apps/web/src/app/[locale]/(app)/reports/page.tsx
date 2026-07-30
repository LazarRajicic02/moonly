
'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ReportsPage() {
  const token = getAccessToken()!;
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['reports'], queryFn: () => api.reports(token) });
  const create = useMutation({
    mutationFn: () => {
      const to = new Date().toISOString().slice(0, 10);
      const from = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
      return api.createReport(token, { from, to, title: 'Doctor summary' });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });
  return (
    <main className="space-y-6">
      <h1 className="font-display text-3xl text-lunar-bright">Doctor reports</h1>
      <Button onClick={() => create.mutate()}>Generate PDF report</Button>
      <div className="space-y-2">
        {(list.data as any[] | undefined)?.map((r) => (
          <Card key={r.id} className="flex items-center justify-between">
            <div>
              <p>{r.title}</p>
              <p className="text-sm text-lunar-dim">{r.status}</p>
            </div>
            {r.status === 'ready' && (
              <a className="text-tide-soft underline" href={`${process.env.NEXT_PUBLIC_API_URL}/reports/${r.id}/pdf`}>
                Download
              </a>
            )}
          </Card>
        ))}
      </div>
    </main>
  );
}
