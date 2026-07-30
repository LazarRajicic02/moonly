# Environment variables

Copy `.env.example` to `.env`.

## Required for local API

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Redis for BullMQ / cache |
| `JWT_ACCESS_SECRET` | ≥32 chars |
| `JWT_REFRESH_SECRET` | ≥32 chars |

## Optional integrations

| Variable | Service |
|----------|---------|
| `RESEND_API_KEY` | Transactional email |
| `OPENAI_API_KEY` / `OPENAI_BASE_URL` | AI assistant |
| `FIREBASE_*` | FCM push |
| `STRIPE_*` | Subscriptions (placeholder) |
| `SENTRY_DSN` | Error monitoring |
| `NEXT_PUBLIC_POSTHOG_*` | Product analytics |

When optional keys are missing, services log no-op behavior so local development still works.
