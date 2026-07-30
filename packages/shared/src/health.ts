import { z } from 'zod';

export const SYMPTOM_TYPES = [
  'cramps',
  'headache',
  'bloating',
  'fatigue',
  'breast_tenderness',
  'acne',
  'backache',
  'nausea',
  'cravings',
  'insomnia',
  'spotting',
  'other',
] as const;

export const MOOD_TYPES = [
  'happy',
  'calm',
  'anxious',
  'irritable',
  'sad',
  'energetic',
  'low_energy',
  'stressed',
  'neutral',
] as const;

export const FLOW_LEVELS = ['spotting', 'light', 'medium', 'heavy'] as const;

export const symptomTypeSchema = z.enum(SYMPTOM_TYPES);
export const moodTypeSchema = z.enum(MOOD_TYPES);
export const flowLevelSchema = z.enum(FLOW_LEVELS);

export const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const createCycleSchema = z.object({
  startDate: dateOnlySchema,
  endDate: dateOnlySchema.optional(),
  notes: z.string().max(2000).optional(),
});

export const createPeriodDaySchema = z.object({
  date: dateOnlySchema,
  flow: flowLevelSchema.default('medium'),
  notes: z.string().max(500).optional(),
});

export const createSymptomSchema = z.object({
  date: dateOnlySchema,
  type: symptomTypeSchema,
  severity: z.number().int().min(1).max(5).default(3),
  notes: z.string().max(500).optional(),
});

export const createMoodSchema = z.object({
  date: dateOnlySchema,
  mood: moodTypeSchema,
  intensity: z.number().int().min(1).max(5).default(3),
  notes: z.string().max(500).optional(),
});

export const createWeightSchema = z.object({
  date: dateOnlySchema,
  kg: z.number().positive().max(500),
  notes: z.string().max(500).optional(),
});

export const createSleepSchema = z.object({
  date: dateOnlySchema,
  hours: z.number().min(0).max(24),
  quality: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
});

export const createWaterSchema = z.object({
  date: dateOnlySchema,
  ml: z.number().int().positive().max(20000),
});

export const dateRangeSchema = z.object({
  from: dateOnlySchema,
  to: dateOnlySchema,
});

export const aiChatSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
});

export const medicationSchema = z.object({
  name: z.string().min(1).max(200),
  dosage: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  reminderTimes: z.array(z.string().regex(/^\d{2}:\d{2}$/)).default([]),
  active: z.boolean().default(true),
});
