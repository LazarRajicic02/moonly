
'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { StatsOverview } from '@/lib/api';

export function SymptomChart({ data }: { data: StatsOverview['symptomFrequency'] }) {
  const rows = Object.entries(data).map(([name, count]) => ({ name, count }));
  return (
    <div className="h-64 w-full" role="img" aria-label="Symptom frequency chart">
      <ResponsiveContainer>
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
          <XAxis dataKey="name" stroke="#8B93A7" tick={{ fontSize: 11 }} />
          <YAxis stroke="#8B93A7" />
          <Tooltip />
          <Bar dataKey="count" fill="#E86A93" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MoodChart({ data }: { data: StatsOverview['moodDistribution'] }) {
  const rows = Object.entries(data).map(([name, count]) => ({ name, count }));
  return (
    <div className="h-64 w-full" role="img" aria-label="Mood distribution chart">
      <ResponsiveContainer>
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
          <XAxis dataKey="name" stroke="#8B93A7" tick={{ fontSize: 11 }} />
          <YAxis stroke="#8B93A7" />
          <Tooltip />
          <Bar dataKey="count" fill="#A78BDA" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WaterChart({ data }: { data: Array<{ date: string; ml: number }> }) {
  const rows = data.map((d) => ({ date: String(d.date).slice(0, 10), ml: d.ml }));
  return (
    <div className="h-64 w-full" role="img" aria-label="Water intake chart">
      <ResponsiveContainer>
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
          <XAxis dataKey="date" stroke="#8B93A7" tick={{ fontSize: 11 }} />
          <YAxis stroke="#8B93A7" />
          <Tooltip />
          <Line type="monotone" dataKey="ml" stroke="#A78BDA" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
