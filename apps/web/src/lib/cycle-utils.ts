export function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(day: string, n: number) {
  const d = new Date(`${day}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
}

export function inRange(day: string, from?: string, to?: string) {
  if (!from || !to) return false;
  const [a, b] = from <= to ? [from, to] : [to, from];
  return day >= a && day <= b;
}

/** Group sorted ISO dates into consecutive clusters. */
export function clusterPeriodDays(sortedDays: string[]): string[][] {
  if (sortedDays.length === 0) return [];
  const clusters: string[][] = [[sortedDays[0]!]];
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = sortedDays[i - 1]!;
    const curr = sortedDays[i]!;
    if (addDaysISO(prev, 1) === curr) {
      clusters[clusters.length - 1]!.push(curr);
    } else {
      clusters.push([curr]);
    }
  }
  return clusters;
}

/** Remaining predicted days for the current (ongoing) period cluster. */
export function currentPeriodPredictedDays(
  periodDays: string[],
  expectedLen: number,
  today = iso(new Date()),
): string[] {
  if (periodDays.length === 0 || expectedLen <= 0) return [];
  const sorted = [...periodDays].sort();
  const clusters = clusterPeriodDays(sorted);
  const latest = clusters[clusters.length - 1]!;
  if (latest.length >= expectedLen) return [];

  const first = latest[0]!;
  const last = latest[latest.length - 1]!;
  // Only extend recent clusters (started within expectedLen days from today)
  if (today < first || addDaysISO(first, expectedLen + 3) < today) return [];

  const predicted: string[] = [];
  let d = last;
  for (let i = latest.length; i < expectedLen; i++) {
    d = addDaysISO(d, 1);
    if (!sorted.includes(d)) predicted.push(d);
  }
  return predicted;
}

/** Next predicted period window [start, end] using profile/prediction length. */
export function nextPeriodWindow(
  nextStart: string | undefined,
  periodLen: number,
): { from: string; to: string } | null {
  if (!nextStart || periodLen <= 0) return null;
  return { from: nextStart.slice(0, 10), to: addDaysISO(nextStart.slice(0, 10), periodLen - 1) };
}

/** All predicted menstrual days in [rangeFrom, rangeTo], repeating every cycleLen from nextStart. */
export function futurePredictedPeriodDays(
  nextStart: string | undefined,
  periodLen: number,
  cycleLen: number,
  rangeFrom: string,
  rangeTo: string,
): Set<string> {
  const days = new Set<string>();
  if (!nextStart || periodLen <= 0 || cycleLen <= 0) return days;

  let start = nextStart.slice(0, 10);
  while (addDaysISO(start, periodLen - 1) < rangeFrom) {
    start = addDaysISO(start, cycleLen);
  }

  while (start <= rangeTo) {
    for (let i = 0; i < periodLen; i++) {
      const d = addDaysISO(start, i);
      if (d > rangeTo) break;
      if (d >= rangeFrom) days.add(d);
    }
    start = addDaysISO(start, cycleLen);
  }

  return days;
}
