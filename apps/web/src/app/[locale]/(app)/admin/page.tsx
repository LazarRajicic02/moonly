
'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AdminPage() {
  const token = getAccessToken()!;
  const users = useQuery({ queryKey: ['admin-users'], queryFn: () => api.adminUsers(token) });
  const analytics = useQuery({ queryKey: ['admin-analytics'], queryFn: () => api.adminAnalytics(token) });
  const chart = ((analytics.data as any)?.signupsByDay ?? []) as Array<{ date: string; count: number }>;
  return (
    <main className="space-y-6">
      <h1 className="font-display text-3xl text-lunar-bright">Admin</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries((analytics.data as any)?.totals ?? {}).map(([k, v]) => (
          <Card key={k}><p className="text-sm text-lunar-dim">{k}</p><p className="text-2xl">{String(v)}</p></Card>
        ))}
      </div>
      <Card>
        <h2 className="mb-3 text-lg">Signups</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
              <XAxis dataKey="date" stroke="#8B93A7" tick={{ fontSize: 10 }} />
              <YAxis stroke="#8B93A7" />
              <Tooltip />
              <Bar dataKey="count" fill="#5BA4A4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 text-lg">Users</h2>
        <div className="space-y-2">
          {((users.data as any[]) ?? []).map((u) => (
            <div key={u.id} className="flex justify-between border-b border-white/5 py-2 text-sm">
              <span>{u.displayName}</span>
              <span className="text-lunar-dim">{u.email} · {u.role}</span>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
