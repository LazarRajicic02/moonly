# Extending Luna

## New API feature

1. Add Prisma models + migrate
2. Create `apps/api/src/modules/<feature>/` with controller, service, module
3. Register module in `app.module.ts`
4. Add shared Zod schemas in `packages/shared` if used by the web
5. Add API client method in `apps/web/src/lib/api.ts`
6. Add page under `apps/web/src/app/[locale]/(app)/`

## Cycle prediction

Domain logic lives in `cycle-prediction.service.ts` (pure, unit-tested). Swap or enhance the algorithm without touching controllers.

## Jobs

Register a BullMQ queue in `JobsModule` and inject `@InjectQueue('name')` into the feature service. Processors live in `modules/jobs/processors.ts`.
