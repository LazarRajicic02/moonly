import { computeCyclePrediction } from './cycle-prediction.service';

describe('computeCyclePrediction', () => {
  it('uses default cycle length when insufficient history', () => {
    const start = new Date('2024-01-01T00:00:00.000Z');
    const result = computeCyclePrediction([{ startDate: start, endDate: new Date('2024-01-05T00:00:00.000Z') }]);
    expect(result.avgCycleLength).toBe(28);
    expect(result.nextPeriodStart.toISOString().slice(0, 10)).toBe('2024-01-29');
    expect(result.ovulationDate.toISOString().slice(0, 10)).toBe('2024-01-15');
  });

  it('averages completed cycle lengths', () => {
    const cycles = [
      { startDate: new Date('2024-01-01T00:00:00.000Z') },
      { startDate: new Date('2024-01-29T00:00:00.000Z') },
      { startDate: new Date('2024-02-26T00:00:00.000Z') },
    ];
    const result = computeCyclePrediction(cycles);
    expect(result.avgCycleLength).toBe(28);
    expect(result.nextPeriodStart.toISOString().slice(0, 10)).toBe('2024-03-25');
  });
});
