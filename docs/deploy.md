# Deployment guide

Luna runs on two platforms:

| App | Platform | URL |
|-----|----------|-----|
| **Web** (`apps/web`) | [Vercel](https://vercel.com) | `https://your-app.vercel.app` |
| **API** (`apps/api`) | [Render](https://render.com) | `https://luna-api-xxxx.onrender.com` |

---

## 1. Deploy API on Render

### Blueprint (recommended)

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect repo `LazarRajicic02/moonly` and apply `render.yaml`.
3. Render creates **Postgres**, **Redis**, and **luna-api** (Docker).
4. When deploy finishes, copy the API URL (e.g. `https://luna-api-xxxx.onrender.com`).

### Manual

- **New → Web Service** → Docker
- **Dockerfile:** `apps/api/Dockerfile`
- **Root directory:** `.` (repo root)
- Add Postgres + Redis; set env vars below.

### Render env vars (API)

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | From Render Postgres (auto via blueprint) |
| `REDIS_URL` | From Render Redis (auto via blueprint) |
| `JWT_ACCESS_SECRET` | Random string ≥ 32 chars (auto-generated in blueprint) |
| `JWT_REFRESH_SECRET` | Random string ≥ 32 chars (auto-generated in blueprint) |
| `WEB_URL` | Your Vercel URL, e.g. `https://moonly.vercel.app` |
| `CORS_ORIGINS` | Same Vercel URL (no trailing slash) |
| `API_URL` | Your Render API URL, e.g. `https://luna-api-xxxx.onrender.com` |

Render sets `PORT` automatically. Migrations run on container start (`prisma migrate deploy`).

### Verify API

```bash
curl https://luna-api-xxxx.onrender.com/api/v1/health
```

Swagger: `https://luna-api-xxxx.onrender.com/api/docs`

---

## 2. Deploy Web on Vercel

1. [Vercel Dashboard](https://vercel.com) → **Add New Project** → import `LazarRajicic02/moonly`.
2. **Root Directory:** `apps/web` (uses `apps/web/vercel.json`).
3. **Environment variables:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://luna-api-xxxx.onrender.com/api/v1` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

4. Deploy. Build command: `pnpm turbo run build --filter=@luna/web` (via monorepo install from repo root).

> If Vercel project root is the **repo root** instead of `apps/web`, the root `vercel.json` applies — same web-only build, no API on Vercel.

---

## 3. Connect frontend ↔ API

1. Deploy Render API first → copy URL.
2. Set `NEXT_PUBLIC_API_URL` on Vercel → redeploy web.
3. Set `WEB_URL` and `CORS_ORIGINS` on Render to your Vercel URL → redeploy API.
4. Open Vercel URL and log in.

---

## 4. Seed demo data (optional)

With production `DATABASE_URL` in your shell:

```bash
pnpm --filter @luna/api exec prisma db seed
```

Demo: `demo@luna.health` / `Password123!`

---

## Local development

```bash
cp .env.example .env
docker compose up -d postgres redis
pnpm install
pnpm --filter @luna/shared build
pnpm --filter @luna/api prisma:generate
pnpm --filter @luna/api exec prisma migrate deploy
pnpm db:seed   # optional
pnpm --filter @luna/api dev   # :3001
pnpm --filter @luna/web dev   # :3000
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Vercel build fails (Prisma/types) | Vercel builds **web only** — API is on Render |
| CORS error in browser | Set `CORS_ORIGINS` on Render to exact Vercel URL |
| API 401 | Log in again after deploy (tokens are per-domain) |
| Render sleeps (free tier) | First request after idle ~30s |
| `MISSING_MESSAGE` build error | Keep `en.json` in sync with `sr.json` |
