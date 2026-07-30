export function dayOfWeekUTC(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00.000Z`).getUTCDay();
}

export type MedSchedule = { timeOfDay: string; daysOfWeek: number[]; enabled?: boolean };
export type MedWithSchedules = {
  id: string;
  name: string;
  dosage?: string | null;
  active?: boolean;
  schedules?: MedSchedule[];
};

export type MedDose = {
  medicationId: string;
  takenAt?: string | null;
};

export function isMedScheduledOnDay(med: MedWithSchedules, day: string): boolean {
  if (med.active === false) return false;
  const dow = dayOfWeekUTC(day);
  return (med.schedules ?? []).some((s) => s.enabled !== false && s.daysOfWeek.includes(dow));
}

export function medsForDay(
  meds: MedWithSchedules[],
  day: string,
  skipDays?: Set<string>,
): MedWithSchedules[] {
  if (skipDays?.has(day)) return [];
  return meds.filter((m) => isMedScheduledOnDay(m, day));
}

export function isMedTakenOnDay(medId: string, day: string, doses: MedDose[]): boolean {
  return doses.some(
    (d) => d.medicationId === medId && d.takenAt && String(d.takenAt).slice(0, 10) === day,
  );
}

export function takenMedIdsForDay(day: string, doses: MedDose[]): Set<string> {
  return new Set(
    doses
      .filter((d) => d.takenAt && String(d.takenAt).slice(0, 10) === day)
      .map((d) => d.medicationId),
  );
}

export function medDayStatus(
  day: string,
  meds: MedWithSchedules[],
  doses: MedDose[],
  skipDays?: Set<string>,
): 'none' | 'pending' | 'partial' | 'done' {
  if (skipDays?.has(day)) return 'none';
  const scheduled = medsForDay(meds, day, skipDays);
  if (scheduled.length === 0) return 'none';
  const taken = scheduled.filter((m) => isMedTakenOnDay(m.id, day, doses)).length;
  if (taken === 0) return 'pending';
  if (taken < scheduled.length) return 'partial';
  return 'done';
}
