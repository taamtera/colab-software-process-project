# TOR Software Database — Team Handoff

## What Is Ready

- MongoDB Atlas connection and environment configuration
- 17 collections with validation rules and indexes
- demonstration records for dashboard and matching development
- isolated crawler staging and ingestion history
- cleanup and test-reset safety scripts
- repositories in the Express backend for database access
- Docker services for the backend and crawler

## Responsibility Boundary

The database owner maintains the schema, validators, indexes, safe sample data, cleanup tools, and this documentation.

The backend/authentication developer owns HTTP routes, password hashing, token generation, login behavior, email delivery, and frontend integration. Application code must follow the field names and allowed values documented here and in `schema.md`.

## Teammate Setup

1. Extract the handoff ZIP into a new folder.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Ask the database owner to create or approve a separate Atlas database user. Do not reuse another person's password.
5. Put that user's Atlas URI in `MONGODB_URI` inside `.env`.
6. Keep `MONGODB_DB_NAME=tor_software` for the shared class/demo database.
7. Keep `MONGODB_TEST_DB_NAME=tor_software_test` for disposable tests.
8. Run `npm run db:check`.
9. Run `npm run db:verify`.

Do not run `db:setup` against a database unless the team intends to create or update its validators and indexes. Do not run `db:reset:test` against data that must be retained.

## Authentication Contract

### `users`

- Store `emailNormalized` in lowercase for unique lookup.
- Store only `passwordHash`; never store a plain password.
- Allowed `status` values: `pending_verification`, `active`, `suspended`, `disabled`.
- Allowed `role` values: `company_admin`, `company_member`, `project_manager`, `system_admin`.
- `notificationPreferences.channels` contains `in_app` and/or `email`.
- `notificationPreferences.alertTypes` contains `new_match`, `tor_updated`, and/or `deadline_reminder`.
- `notificationPreferences.deadlineReminderDays` is an optional integer from 1–30.
- Use `deletedAt` for soft deletion instead of immediately removing the user.

### `auth_tokens`

- Allowed `type` values: `email_verification`, `password_reset`, `company_invitation`.
- Store only `tokenHash`; the usable token belongs only in the link sent to the user.
- Set `expiresAt` so MongoDB can automatically remove expired records.
- Set `usedAt` or `revokedAt` when a token must no longer work.

### `sessions`

- Store only a hashed refresh token.
- Allowed `status` values: `active`, `revoked`.
- Set `expiresAt` and revoke sessions after password changes when required.

### `audit_logs`

Record important events such as registration, email verification, login success/failure, password reset, status changes, and role changes. Never place passwords or raw tokens in audit metadata.

Set `expiresAt` only when the team has approved a retention date. Omit it for records that must not expire automatically.

## TOR and Crawler Contract

- Treat `raw_ingestion_items` as temporary untrusted staging data.
- Read each source's `rawRetentionDays` value when calculating staging `expiresAt`.
- Set `triggeredBy` to `schedule`, `manual`, `test`, or `retry` on every ingestion run.
- Upsert projects using `sourceId + externalProjectId`.
- Upsert announcements using the unique `sourceId + announcementKey` combination. Do not use RSS `guid` or project ID alone.
- Create a `tor_versions` snapshot only when `contentHash` changes.
- Keep original source URLs and document checksums for verification.
- Enable AI evaluation, matching, and notifications only after clean normalization.
- Keep the crawler disabled until a source adapter is intentionally being tested.

## AI and Notification Queue Contract

- Initialize AI evaluations with `retryCount: 0` and set `nextAttemptAt` when the job is ready.
- Update `lastAttemptAt` after every AI attempt and store a structured `lastError` after failures.
- Initialize notifications with `attemptCount: 0`, `nextAttemptAt`, and `deliveryError: null`.
- Store notification delivery failures as `deliveryError.code`, `deliveryError.message`, and `deliveryError.lastAttemptAt`.
- Query ready work using `status + nextAttemptAt`; do not scan the complete collection.

## Environment Safety

| Environment | Database | Purpose |
| --- | --- | --- |
| Shared class/demo | `tor_software` | Stable data used by the team and presentation demo |
| Automated/crawler test | `tor_software_test` | Disposable data that reset scripts may delete |
| Future production | `tor_software_prod` | Verified live data only; never use test cleanup commands |

## Commands

| Command | Purpose |
| --- | --- |
| `npm run handoff:verify` | Verify that the shareable package contains required safe files |
| `npm run db:check` | Confirm Atlas connectivity |
| `npm run db:verify` | Check collections, validators, and indexes without deleting data |
| `npm run db:seed` | Insert or update controlled demonstration data |
| `npm run db:cleanup:raw` | Remove expired staging data from a non-production database |
| `npm run db:cleanup:run -- <runId>` | Remove one crawler test run and its staging items |
| `npm run db:reset:test` | Recreate only the database named by `MONGODB_TEST_DB_NAME` |

## Files to Share

- `README.md`
- `.env.example`
- `.gitignore`
- `package.json` and `package-lock.json`
- `docs/`
- `scripts/`

Never share `.env`, `node_modules/`, personal Atlas passwords, raw access tokens, or a ZIP containing those files.

## Acceptance Checklist

- `npm run handoff:verify` passes.
- `npm run db:check` connects using the teammate's own credentials.
- `npm run db:verify` reports all 17 collections and passes.
- Authentication code uses hashes and the documented status values.
- AI and notification workers use the documented retry fields and ready-work indexes.
- Destructive crawler tests use only `tor_software_test`.
- The frontend/backend developer can identify the collection for every product feature using `schema.md`.
