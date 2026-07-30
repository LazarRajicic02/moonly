# Architecture

Luna uses a pnpm/Turborepo monorepo with a NestJS API and Next.js web app.

## Backend layers

Each feature module follows Clean Architecture:

1. **Presentation** — controllers, DTOs, Swagger
2. **Application** — use-case services
3. **Domain** — pure logic (e.g. cycle prediction)
4. **Infrastructure** — Prisma repositories, Redis, Resend, FCM, OpenAI, PDF, Stripe

Cross-cutting concerns: JWT auth + refresh rotation, rate limiting, audit logs, BullMQ jobs.

## Frontend

Feature-first folders under `apps/web/src/features` and App Router pages under `app/[locale]`.

Server state: TanStack Query. Forms: React Hook Form + Zod. i18n: next-intl (`en`, `sr`). Theme: next-themes.

## Data flow

```
Browser → Next.js → REST /api/v1 → Nest controllers → services → Prisma → PostgreSQL
                                         ↓
                                   BullMQ / Redis → workers (reminders, PDF, GDPR)
```
