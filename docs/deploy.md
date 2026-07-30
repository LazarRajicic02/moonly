# Deployment guide

Luna is split across two hosts:

| App | Platform | Why |
|-----|----------|-----|
| **Web** (`apps/web`) | [Vercel](https://vercel.com) | Next.js, edge, PWA |
| **API** (`apps/api`) | [Render](https://render.com) | NestJS, Postgres, Redis, Docker |

---

## 1. Deploy API on Render (recommended)

### Option A — Blueprint (fastest)

1. Push this repo to GitHub (already done).
2. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect `LazarRajicic02/moonly` and apply `render.yaml`.
4. Render creates:
   - PostgreSQL (`luna-db`)
   - Redis (`luna-redis`)
   - Web service (`luna-api`) from `apps/api/Dockerfile`
5. When the API is live, copy its URL (e.g. `https://luna-api-xxxx.onrender.com`).

### Option B — Manual web service

1. **New → Web Service** → connect repo.
2. **Runtime:** Docker  
   **Dockerfile path:** `apps/api/Dockerfile`  
   **Root directory:** `.` (repo root)
3. Add a **PostgreSQL** and **Redis** instance in Render; paste their URLs into env vars.

### Required env vars (API)

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | From Render Postgres |
| `REDIS_URL` | From Render Redis |
| `JWT_ACCESS_SECRET` | Random string ≥ 32 chars |
| `JWT_REFRESH_SECRET` | Random string ≥ 32 chars |
| `API_URL` | `https://luna-api-xxxx.onrender.com` |
| `WEB_URL` | `https://your-app.vercel.app` |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |

Render sets `PORT` automatically; the API listens on it.

### Verify API

```bash
curl https://luna-api-xxxx.onrender.com/api/v1/health
# → {"status":"ok","database":"up",...}
```

Swagger: `https://luna-api-xxxx.onrender.com/api/docs`

Migrations run automatically on container start (`prisma migrate deploy`).

---

## 2. Deploy Web on Vercel

1. Import `LazarRajicic02/moonly` on [Vercel](https://vercel.com).
2. **Root directory:** leave as repo root (uses root `vercel.json`).
3. **Environment variables:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://luna-api-xxxx.onrender.com/api/v1` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

4. Deploy. Build runs: `pnpm turbo run build --filter=@luna/web`.

---

## 3. Connect frontend ↔ API

After both are live:

1. Set `CORS_ORIGINS` on Render to your exact Vercel URL (no trailing slash).
2. Redeploy API if you change CORS.
3. Open Vercel URL → register / login → requests go to Render API.

---

## 4. Optional: seed demo data

From your machine (with `DATABASE_URL` pointing at production Postgres):

```bash
pnpm --filter @luna/api exec prisma db seed
```

Demo user: `demo@luna.health` / `Password123!`

---

## 5. Railway (alternative)

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub.
2. Add **PostgreSQL** and **Redis** plugins.
3. Add a service with **Dockerfile path** `apps/api/Dockerfile`.
4. Set the same env vars as in the table above.
5. Railway exposes a public URL — use it for `NEXT_PUBLIC_API_URL`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Vercel build fails on `@prisma/client` | Fixed: API build runs `prisma generate`; Vercel only builds web |
| API 401 on Vercel preview | Log in again; token is per-domain |
| CORS error in browser | Add Vercel URL to `CORS_ORIGINS` on API |
| Render free tier sleeps | First request after idle may take ~30s |
| DB connection failed | Check `DATABASE_URL` includes `?schema=public` |
