# Luna

Women's health companion — cycle prediction, symptoms, mood, tracking, AI assistant, and more.

## Stack

- **Web:** Next.js App Router, React, Tailwind, shadcn-style UI, TanStack Query, next-intl, PWA
- **API:** NestJS, Prisma, PostgreSQL, Redis, BullMQ, JWT auth, OpenAPI
- **Monorepo:** pnpm + Turborepo

## Quick start

```bash
cp .env.example .env
# Start Postgres + Redis (requires Docker Desktop running)
# Postgres is published on host port 5433 to avoid clashes with other local DBs
docker compose up -d postgres redis
pnpm install
pnpm --filter @luna/shared build
pnpm --filter @luna/api prisma:generate
pnpm --filter @luna/api exec prisma migrate deploy
pnpm db:seed
pnpm --filter @luna/api build
pnpm --filter @luna/api dev   # terminal 1 — http://localhost:3001
pnpm --filter @luna/web dev   # terminal 2 — http://localhost:3000
```

If Docker is unavailable, point `DATABASE_URL` / `REDIS_URL` at any local Postgres 16 and Redis 7 instances.
- Web: http://localhost:3000
- API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/api/docs

### Demo accounts

| Email | Password | Role |
|-------|----------|------|
| demo@luna.health | Password123! | USER |
| admin@luna.health | Password123! | ADMIN |

## Workspace layout

```
apps/api     NestJS Clean Architecture API
apps/web     Next.js frontend
packages/shared   Zod schemas & constants
```

## Documentation

See [docs/](docs/) for architecture, API overview, environment variables, GDPR, and extension guides.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run API + web |
| `pnpm build` | Build all packages |
| `pnpm test` | Unit tests |
| `pnpm db:seed` | Seed demo data |
| `docker compose up` | Full stack containers |

## License

Proprietary — Luna.
