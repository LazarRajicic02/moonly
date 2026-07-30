
function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') return '/api/v1';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/v1`;
  return 'http://localhost:3001/api/v1';
}

type RequestOptions = RequestInit & { token?: string | null };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`);

  const res = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message?.toString?.() ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  register: (body: unknown) => request<{ accessToken: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: unknown) => request<{ accessToken: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  refresh: () => request<{ accessToken: string; user: User }>('/auth/refresh', { method: 'POST', body: '{}' }),
  logout: (token: string) => request('/auth/logout', { method: 'POST', token }),
  me: (token: string) => request<UserProfile>('/me', { token }),
  updateMe: (token: string, body: unknown) => request('/me', { method: 'PATCH', token, body: JSON.stringify(body) }),
  cycles: (token: string) => request<unknown[]>('/cycles', { token }),
  prediction: (token: string) => request<Prediction>('/cycles/predictions', { token }),
  createCycle: (token: string, body: unknown) => request('/cycles', { method: 'POST', token, body: JSON.stringify(body) }),
  updateCycle: (token: string, id: string, body: unknown) =>
    request(`/cycles/${id}`, { method: 'PATCH', token, body: JSON.stringify(body) }),
  endPeriod: (token: string, endDate: string) =>
    request('/cycles/end-period', { method: 'POST', token, body: JSON.stringify({ endDate }) }),
  addPeriodDay: (token: string, body: unknown) => request('/cycles/period-days', { method: 'POST', token, body: JSON.stringify(body) }),
  removePeriodDay: (token: string, date: string) => request(`/cycles/period-days/${date}`, { method: 'DELETE', token }),
  symptoms: (token: string) => request<unknown[]>('/symptoms', { token }),
  createSymptom: (token: string, body: unknown) => request('/symptoms', { method: 'POST', token, body: JSON.stringify(body) }),
  moods: (token: string) => request<unknown[]>('/mood', { token }),
  createMood: (token: string, body: unknown) => request('/mood', { method: 'POST', token, body: JSON.stringify(body) }),
  calendar: (token: string, from: string, to: string) => request(`/calendar?from=${from}&to=${to}`, { token }),
  stats: (token: string) => request<StatsOverview>('/stats/overview', { token }),
  tracking: (token: string) => request('/tracking', { token }),
  logWeight: (token: string, body: unknown) => request('/tracking/weight', { method: 'POST', token, body: JSON.stringify(body) }),
  logSleep: (token: string, body: unknown) => request('/tracking/sleep', { method: 'POST', token, body: JSON.stringify(body) }),
  logWater: (token: string, body: unknown) => request('/tracking/water', { method: 'POST', token, body: JSON.stringify(body) }),
  pregnancy: (token: string) => request('/pregnancy', { token }),
  upsertPregnancy: (token: string, body: unknown) => request('/pregnancy', { method: 'PUT', token, body: JSON.stringify(body) }),
  fertility: (token: string) => request('/fertility', { token }),
  createFertility: (token: string, body: unknown) => request('/fertility', { method: 'POST', token, body: JSON.stringify(body) }),
  medications: (token: string) => request('/medications', { token }),
  createMedication: (token: string, body: unknown) => request('/medications', { method: 'POST', token, body: JSON.stringify(body) }),
  deleteMedication: (token: string, id: string) => request(`/medications/${id}`, { method: 'DELETE', token }),
  takeMedication: (token: string, id: string, date: string) =>
    request(`/medications/${id}/take`, { method: 'POST', token, body: JSON.stringify({ date }) }),
  untakeMedication: (token: string, id: string, date: string) =>
    request(`/medications/${id}/take/${date}`, { method: 'DELETE', token }),
  aiChat: (token: string, body: unknown) => request('/ai/chat', { method: 'POST', token, body: JSON.stringify(body) }),
  reports: (token: string) => request('/reports', { token }),
  createReport: (token: string, body: unknown) => request('/reports/doctor', { method: 'POST', token, body: JSON.stringify(body) }),
  gdprExport: (token: string) => request('/gdpr/export', { method: 'POST', token }),
  gdprDelete: (token: string) => request('/gdpr/delete', { method: 'POST', token }),
  notificationPrefs: (token: string) => request('/notifications/preferences', { token }),
  updateNotificationPrefs: (token: string, body: unknown) =>
    request('/notifications/preferences', { method: 'PATCH', token, body: JSON.stringify(body) }),
  billingPlans: (token: string) => request('/billing/plans', { token }),
  checkout: (token: string) => request('/billing/checkout', { method: 'POST', token }),
  adminUsers: (token: string) => request('/admin/users', { token }),
  adminAnalytics: (token: string) => request('/admin/analytics', { token }),
  intimacy: (token: string) => request<unknown[]>('/intimacy', { token }),
  createIntimacy: (token: string, body: unknown) => request('/intimacy', { method: 'POST', token, body: JSON.stringify(body) }),
  notes: (token: string) => request<unknown[]>('/notes', { token }),
  createNote: (token: string, body: unknown) => request('/notes', { method: 'POST', token, body: JSON.stringify(body) }),
};

export type User = {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ADMIN';
  locale: string;
};

export type UserProfile = User & {
  profile?: { averageCycleLen?: number; averagePeriodLen?: number };
  subscription?: { status: string };
};

export type Prediction = {
  nextPeriodStart: string;
  fertileStart: string;
  fertileEnd: string;
  ovulationDate: string;
  avgCycleLength: number;
  avgPeriodLength: number;
};

export type StatsOverview = {
  counts: { symptoms: number; moods: number; cycles: number };
  symptomFrequency: Record<string, number>;
  moodDistribution: Record<string, number>;
  averageCycleLength: number;
  prediction?: Prediction;
  series: { weight: Array<{ date: string; kg: number }>; sleep: Array<{ date: string; hours: number }>; water: Array<{ date: string; ml: number }> };
  intimacy: Array<{
    id: string;
    date: string;
    protected: boolean | null;
    rating?: number | null;
    location?: string | null;
    notes?: string | null;
  }>;
};
