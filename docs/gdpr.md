# GDPR

Luna supports GDPR-aligned workflows:

## Export

`POST /gdpr/export` creates a job that serializes the user's health data to JSON under `uploads/gdpr/`. Status is available via `GET /gdpr/exports`.

## Deletion

`POST /gdpr/delete` soft-deletes the account: revokes refresh tokens, anonymizes email/display name, and sets `deletedAt` / `anonymizedAt`. Audit log records `ACCOUNT_DELETE`.

## Consents

Registration stores `terms` and `privacy` consent rows with version `1.0`. Extend the `Consent` model for marketing or research consent.
