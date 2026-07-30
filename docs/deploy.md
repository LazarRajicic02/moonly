# Deployment guide

## Vercel (frontend + API — recommended)

Everything runs on one Vercel project: Next.js serves the UI, NestJS runs as a serverless function at `/api/v1/*`.

```
https://your-app.vercel.app/          → Next.js (web)
https://your-app.vercel.app/api/v1/*  → NestJS (API)
https://your-app.vercel.app/api/docs  → Swagger
```

### Setup

1. [Vercel Dashboard](https://vercel.com) → **Add New Project** → import `LazarRajicic02/moonly`.
2. **Root Directory:** `apps/web` (recommended)  
   — or leave repo root; both `vercel.json` files are configured.
3. **Environment variables** (Project → Settings → Environment Variables):

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | [Vercel Postgres](https://vercel.com/storage/postgres), [Neon](https://neon.tech), or Supabase |
| `REDIS_URL` | Yes | [Upstash Redis](https://upstash.com) (serverless-friendly) |
| `JWT_ACCESS_SECRET` | Yes | Random string ≥ 32 characters |
| `JWT_REFRESH_SECRET` | Yes | Random string ≥ 32 characters |
| `CORS_ORIGINS` | Optional | Defaults work for same-origin; set your Vercel URL if needed |
| `WEB_URL` | Optional | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Optional | Leave empty — client uses `/api/v1` on same domain |

4. Deploy. Build runs `pnpm vercel-build`:
   - builds shared + API packages
   - runs `prisma migrate deploy`
   - builds Next.js

### Verify

```bash
curl https://your-app.vercel.app/api/v1/health
```

### Limitations on Vercel serverless

- **Background jobs** (BullMQ medication reminders, GDPR export) do not run continuously — use [Vercel Cron](https://vercel.com/docs/cron-jobs) or Upstash QStash later if needed.
- **Cold starts** — first API request after idle may take a few seconds (Render free tier had the same issue).
- **Redis** must be external (Upstash); no in-container Redis.

---

## Render (API only — alternative)

If you prefer a always-on Docker API instead of serverless, use `render.yaml` (Postgres + Redis + API container). Point Vercel `NEXT_PUBLIC_API_URL` to the Render URL.

See sections below for Render blueprint steps.

---

## Render blueprint (API + DB)

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → connect repo.
2. Apply `render.yaml` (Postgres, Redis, Docker API).
3. Set `WEB_URL` and `CORS_ORIGINS` to your Vercel URL.
4. On Vercel set `NEXT_PUBLIC_API_URL=https://luna-api-xxxx.onrender.com/api/v1`.

---

## Local development

Unchanged — API on `:3001`, web on `:3000`:

```bash
docker compose up -d postgres redis
pnpm install
pnpm --filter @luna/shared build
pnpm --filter @luna/api prisma:generate
pnpm --filter @luna/api exec prisma migrate deploy
pnpm db:seed   # optional
pnpm --filter @luna/api dev   # terminal 1
pnpm --filter @luna/web dev   # terminal 2
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API 500 on Vercel | Check `DATABASE_URL`, `REDIS_URL`, JWT secrets in env vars |
| Build fails on Prisma | `vercel-build` runs `prisma generate` + `migrate deploy` |
| CORS errors | Set `CORS_ORIGINS=https://your-app.vercel.app` |
| 401 after deploy | Log in again (tokens are not shared across domains) |
| Missing translations | Ensure `en.json` matches `sr.json` structure |

Demo user (after seed): `demo@luna.health` / `Password123!`
