/**
 * Integration smoke tests — require DATABASE_URL + running Postgres.
 * Skipped automatically when LUNA_INTEGRATION=0 or DATABASE_URL is unset.
 */
import { PrismaClient } from '@prisma/client';

const run = process.env.LUNA_INTEGRATION !== '0' && Boolean(process.env.DATABASE_URL);

(run ? describe : describe.skip)('database smoke', () => {
  const prisma = new PrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('connects and can query users', async () => {
    const count = await prisma.user.count();
    expect(typeof count).toBe('number');
  });
});
