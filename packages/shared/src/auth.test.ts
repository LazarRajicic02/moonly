import { describe, expect, it } from 'vitest';
import { registerSchema } from './auth';
import { createCycleSchema } from './health';

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    const result = registerSchema.safeParse({
      email: 'demo@luna.health',
      password: 'password123',
      displayName: 'Demo',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      email: 'demo@luna.health',
      password: 'short',
      displayName: 'Demo',
    });
    expect(result.success).toBe(false);
  });
});

describe('createCycleSchema', () => {
  it('requires YYYY-MM-DD', () => {
    expect(createCycleSchema.safeParse({ startDate: '2024-01-01' }).success).toBe(true);
    expect(createCycleSchema.safeParse({ startDate: '01/01/2024' }).success).toBe(false);
  });
});
