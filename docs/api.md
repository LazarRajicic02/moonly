# API overview

Base URL: `/api/v1`  
OpenAPI UI: `/api/docs`

## Auth

- `POST /auth/register` — create account, sets httpOnly `refresh_token`
- `POST /auth/login`
- `POST /auth/refresh` — rotate refresh token
- `POST /auth/logout`

Access tokens are Bearer JWTs (short-lived). Refresh tokens are hashed (SHA-256) in the database with family reuse detection.

## Core health

- `GET/POST /cycles`, `GET /cycles/predictions`, `POST /cycles/period-days`
- `GET/POST /symptoms`, `DELETE /symptoms/:id`
- `GET/POST /mood`, `DELETE /mood/:id`
- `GET /calendar?from&to`
- `GET /stats/overview`

## Extended modules

- Tracking: `GET /tracking`, `POST /tracking/{weight|sleep|water}`
- Pregnancy: `GET/PUT /pregnancy`, `POST /pregnancy/check-ins`
- Fertility: `GET/POST /fertility`
- Medications: `GET/POST /medications`, `DELETE /medications/:id`
- AI: `POST /ai/chat`, `GET /ai/conversations`
- Reports: `POST /reports/doctor`, `GET /reports`, `GET /reports/:id/pdf`
- GDPR: `POST /gdpr/export`, `GET /gdpr/exports`, `POST /gdpr/delete`
- Admin: `GET /admin/users`, `GET /admin/analytics` (ADMIN role)
- Billing: `GET /billing/plans`, `POST /billing/checkout`, `POST /billing/webhook`
- Notifications: `POST /notifications/device-token`, `GET/PATCH /notifications/preferences`
- Health: `GET /health`
