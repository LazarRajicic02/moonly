export type CycleInput = {
  startDate: Date;
  endDate?: Date | null;
  length?: number | null;
};

export type PredictionResult = {
  nextPeriodStart: Date;
  fertileStart: Date;
  fertileEnd: Date;
  ovulationDate: Date;
  avgCycleLength: number;
  avgPeriodLength: number;
  basedOnCycles: number;
};

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function computeCyclePrediction(
  cycles: CycleInput[],
  options?: { lookback?: number; defaultCycleLen?: number; defaultPeriodLen?: number },
): PredictionResult {
  const lookback = options?.lookback ?? 6;
  const defaultCycleLen = options?.defaultCycleLen ?? 28;
  const defaultPeriodLen = options?.defaultPeriodLen ?? 5;

  const sorted = [...cycles].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const recent = sorted.slice(-lookback);

  const lengths: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1]!;
    const curr = recent[i]!;
    const len = curr.length ?? daysBetween(prev.startDate, curr.startDate);
    if (len >= 15 && len <= 60) lengths.push(len);
  }

  const periodLens = recent
    .filter((c) => c.endDate)
    .map((c) => daysBetween(c.startDate, c.endDate!) + 1)
    .filter((n) => n >= 1 && n <= 15);

  const avgCycleLength =
    lengths.length > 0
      ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
      : defaultCycleLen;
  const avgPeriodLength =
    periodLens.length > 0
      ? Math.round(periodLens.reduce((a, b) => a + b, 0) / periodLens.length)
      : defaultPeriodLen;

  const lastStart = recent.length ? recent[recent.length - 1]!.startDate : new Date();
  const nextPeriodStart = addDays(lastStart, avgCycleLength);
  const ovulationDate = addDays(nextPeriodStart, -14);
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = addDays(ovulationDate, 1);

  return {
    nextPeriodStart,
    fertileStart,
    fertileEnd,
    ovulationDate,
    avgCycleLength,
    avgPeriodLength,
    basedOnCycles: Math.max(lengths.length, recent.length ? 1 : 0),
  };
}

export class CyclePredictionDomainService {
  predict(cycles: CycleInput[], options?: Parameters<typeof computeCyclePrediction>[1]) {
    return computeCyclePrediction(cycles, options);
  }
}
