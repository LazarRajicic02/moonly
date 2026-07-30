import { PrismaClient, FlowLevel, MoodType, SymptomType, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.aiMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.doctorReport.deleteMany();
  await prisma.gdprExportJob.deleteMany();
  await prisma.medicationDose.deleteMany();
  await prisma.medicationSchedule.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.fertilitySign.deleteMany();
  await prisma.pregnancyCheckIn.deleteMany();
  await prisma.pregnancyProfile.deleteMany();
  await prisma.waterLog.deleteMany();
  await prisma.sleepLog.deleteMany();
  await prisma.weightLog.deleteMany();
  await prisma.note.deleteMany();
  await prisma.moodLog.deleteMany();
  await prisma.symptomLog.deleteMany();
  await prisma.cyclePrediction.deleteMany();
  await prisma.periodDay.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.devicePushToken.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@luna.health',
      passwordHash,
      displayName: 'Luna Admin',
      role: Role.ADMIN,
      locale: 'en',
      profile: { create: {} },
      notificationPreference: { create: {} },
      subscription: { create: { status: 'ACTIVE' } },
      consents: {
        create: [
          { type: 'terms', granted: true, version: '1.0' },
          { type: 'privacy', granted: true, version: '1.0' },
        ],
      },
    },
  });

  const demo = await prisma.user.create({
    data: {
      email: 'demo@luna.health',
      passwordHash,
      displayName: 'Maya Demo',
      role: Role.USER,
      locale: 'en',
      profile: {
        create: {
          averageCycleLen: 28,
          averagePeriodLen: 5,
          goals: ['track_cycle', 'understand_symptoms'],
        },
      },
      notificationPreference: { create: {} },
      subscription: { create: { status: 'TRIALING' } },
      consents: {
        create: [
          { type: 'terms', granted: true, version: '1.0' },
          { type: 'privacy', granted: true, version: '1.0' },
        ],
      },
    },
  });

  const cycleStarts = [84, 56, 28, 0].map((d) => daysAgo(d));
  for (let i = 0; i < cycleStarts.length; i++) {
    const start = cycleStarts[i]!;
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 4);
    const cycle = await prisma.cycle.create({
      data: {
        userId: demo.id,
        startDate: start,
        endDate: i < cycleStarts.length - 1 ? end : undefined,
        length: i < cycleStarts.length - 1 ? 28 : undefined,
        notes: i === 0 ? 'Baseline cycle' : undefined,
      },
    });
    for (let day = 0; day < 5; day++) {
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate() + day);
      await prisma.periodDay.create({
        data: {
          userId: demo.id,
          cycleId: cycle.id,
          date,
          flow: day === 0 || day === 4 ? FlowLevel.light : FlowLevel.medium,
        },
      });
    }
  }

  const symptoms: Array<{ offset: number; type: SymptomType; severity: number }> = [
    { offset: 2, type: SymptomType.cramps, severity: 4 },
    { offset: 3, type: SymptomType.bloating, severity: 3 },
    { offset: 10, type: SymptomType.headache, severity: 2 },
    { offset: 12, type: SymptomType.fatigue, severity: 3 },
    { offset: 1, type: SymptomType.backache, severity: 3 },
  ];
  for (const s of symptoms) {
    await prisma.symptomLog.create({
      data: {
        userId: demo.id,
        date: daysAgo(s.offset),
        type: s.type,
        severity: s.severity,
      },
    });
  }

  const moods: Array<{ offset: number; mood: MoodType }> = [
    { offset: 1, mood: MoodType.calm },
    { offset: 2, mood: MoodType.irritable },
    { offset: 5, mood: MoodType.happy },
    { offset: 8, mood: MoodType.anxious },
    { offset: 12, mood: MoodType.energetic },
  ];
  for (const m of moods) {
    await prisma.moodLog.create({
      data: { userId: demo.id, date: daysAgo(m.offset), mood: m.mood, intensity: 3 },
    });
  }

  for (let i = 0; i < 14; i++) {
    await prisma.waterLog.create({
      data: { userId: demo.id, date: daysAgo(i), ml: 1500 + i * 50 },
    });
    await prisma.sleepLog.create({
      data: {
        userId: demo.id,
        date: daysAgo(i),
        hours: 6.5 + (i % 3) * 0.5,
        quality: 3 + (i % 3),
      },
    });
    if (i % 2 === 0) {
      await prisma.weightLog.create({
        data: { userId: demo.id, date: daysAgo(i), kg: 62 + (i % 5) * 0.2 },
      });
    }
  }

  await prisma.cyclePrediction.create({
    data: {
      userId: demo.id,
      nextPeriodStart: daysAgo(-28),
      fertileStart: daysAgo(-9),
      fertileEnd: daysAgo(-15),
      ovulationDate: daysAgo(-14),
      avgCycleLength: 28,
      avgPeriodLength: 5,
      basedOnCycles: 3,
    },
  });

  await prisma.medication.create({
    data: {
      userId: demo.id,
      name: 'Vitamin D',
      dosage: '1000 IU',
      schedules: { create: [{ timeOfDay: '09:00' }] },
    },
  });

  await prisma.fertilitySign.create({
    data: {
      userId: demo.id,
      date: daysAgo(14),
      type: 'bbt',
      value: '36.6',
    },
  });

  console.log('Seeded users:');
  console.log(`  admin: ${admin.email} / Password123!`);
  console.log(`  demo:  ${demo.email} / Password123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
