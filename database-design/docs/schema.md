# TOR Software Database Model

## Relationship Overview

```mermaid
erDiagram
    SOURCES ||--o{ ORGANIZATIONS : publishes
    SOURCES ||--o{ TOR_ANNOUNCEMENTS : collects
    SOURCES ||--o{ INGESTION_RUNS : records
    INGESTION_RUNS ||--o{ RAW_INGESTION_ITEMS : contains
    ORGANIZATIONS ||--o{ TOR_ANNOUNCEMENTS : owns
    TOR_ANNOUNCEMENTS ||--o{ TOR_VERSIONS : preserves
    TOR_ANNOUNCEMENTS ||--o{ AI_EVALUATIONS : analyzed_by
    COMPANIES ||--o{ USERS : includes
    USERS ||--o{ AUTH_TOKENS : receives
    USERS ||--o{ SESSIONS : opens
    USERS ||--o{ AUDIT_LOGS : generates
    COMPANIES ||--o{ COMPANY_MATCHES : receives
    TOR_ANNOUNCEMENTS ||--o{ COMPANY_MATCHES : matched_to
    USERS ||--o{ SAVED_TORS : saves
    TOR_ANNOUNCEMENTS ||--o{ SAVED_TORS : bookmarked_as
    USERS ||--o{ NOTIFICATIONS : receives
    TOR_ANNOUNCEMENTS ||--o{ NOTIFICATIONS : triggers
```

MongoDB references use `ObjectId` values. Relationships are shown here to communicate ownership; MongoDB does not enforce foreign keys automatically.

## 1. `sources`

Stores one record for each monitored public website.

Important fields:

- `code`: stable short name such as `EGP` or `BMA`
- `name`: publisher or source display name
- `baseUrl`: official website root
- `adapterType`: crawler implementation name
- `enabled`: whether scheduled collection is active
- `rawRetentionDays`: source-specific raw staging retention, normally `14`
- `crawlSchedule`: intended collection frequency and timezone
- `lastSuccessfulRunAt`: monitoring value

## 2. `organizations`

Represents agencies, departments, and purchasing units without separate tables for each level.

Important fields:

- `sourceId`: source that supplied the organization
- `externalId`: source-specific identifier when available
- `nameTh` and `nameEn`: display names
- `organizationType`: `agency`, `department`, or `purchasing_unit`
- `parentOrganizationId`: optional parent reference
- `ancestorIds`: ordered parent chain used for agency-wide filtering without recursive queries

## 3. `tor_announcements`

Stores only the latest normalized state used by the dashboard, search, filters, TOR detail page, and recommendations.

Important fields:

- `sourceId`: publishing source
- `dedupKey`: stable source ID or canonical URL fingerprint
- `externalId`: original source identifier when available
- `title`, `summary`, `category`, and `keywords`: searchable data
- `organization`: bounded display snapshot containing `organizationId`, optional external ID, Thai and English names, organization type, ancestor IDs, and optional purchasing-unit name
- `announcementType` and `procurementMethod`: source code and display name
- `budget`: amount or range in THB and source text
- `publishedAt`, `submissionDeadline`, `projectStartAt`, `projectEndAt`
- `sourceUrl`: original verification link
- `documents`: PDF metadata and storage locations
- `status`: `draft`, `open`, `closed`, `cancelled`, or `awarded`
- `version` and `contentHash`: change tracking
- `firstSeenAt` and `lastSeenAt`: crawler monitoring

Do not store large PDF binary data in this collection. Store files in Google Cloud Storage and retain metadata such as `sourceUrl`, `storageUrl`, `checksum`, `mimeType`, `pageCount`, and `fileSizeBytes`.

## 4. `tor_versions`

Stores immutable snapshots created only when normalized TOR content changes.

Important fields:

- `torId`, `version`, and `contentHash`
- `changeType`: `created`, `updated`, `cancelled`, or `restored`
- `changedFields`: fields that changed from the previous version
- `snapshot`: normalized source data at that version
- `rawItem`: optional raw source item, not the complete repeated feed
- `capturedAt`

## 5. `ingestion_runs`

Tracks each crawler execution for operations, auditing, and debugging.

Important fields:

- `sourceId`, `startedAt`, and `completedAt`
- `environment`: `development`, `test`, or `production`
- `triggeredBy`: `schedule`, `manual`, `test`, or `retry`
- `status`: `running`, `completed`, `partial`, or `failed`
- `request`: endpoint and non-secret request parameters
- `statistics`: fetched, inserted, updated, unchanged, and failed counts
- `rawPayload`: checksum, byte size, and cloud-storage location
- `error`: safe error code and message

## 6. `raw_ingestion_items`

Temporarily isolates untrusted crawler output before it can enter the clean TOR collection.

Important fields:

- `ingestionRunId`, `sourceId`, and `environment`
- source URL, external ID, deduplication key, and content hash
- raw payload or a cloud-storage pointer for large responses
- `processingStatus`: `pending`, `normalized`, `rejected`, or `failed`
- validation errors and an optional normalized preview
- `normalizedTorId` after successful processing
- `expiresAt` for automatic removal, normally 14 days after collection

## 7. `users`

Stores application identity and access data.

Important fields:

- `email`, normalized email, and a secure `passwordHash`
- `profile`: first name, last name, phone, avatar, and job title
- `role`: `company_admin`, `company_member`, `project_manager`, or `system_admin`
- `companyId`: company membership when relevant
- `notificationPreferences.channels`: enabled delivery channels from `in_app` and `email`
- `notificationPreferences.alertTypes`: enabled alerts from `new_match`, `tor_updated`, and `deadline_reminder`
- `notificationPreferences.deadlineReminderDays`: optional reminder lead time from 1–30 days
- `status`: `pending_verification`, `active`, `suspended`, or `disabled`
- email verification, login, password-change, lock, terms-acceptance, and soft-deletion timestamps

## 8. `auth_tokens`

Stores short-lived authentication actions without storing usable raw tokens.

Important fields:

- `type`: `email_verification`, `password_reset`, or `company_invitation`
- `tokenHash`: one-way hash of the token sent to the user
- optional `userId` and `companyId`, plus normalized email
- `expiresAt`, `usedAt`, `revokedAt`, and `createdAt`

The expiry index removes expired records automatically. The raw token belongs only in the email link and must never be saved in MongoDB.

## 9. `sessions`

Stores refresh sessions so the backend can support logout, logout from all devices, and revocation after a password change.

Important fields:

- `userId` and hashed refresh token
- `status`: `active` or `revoked`
- optional user-agent and hashed IP address
- `expiresAt`, `lastUsedAt`, `revokedAt`, and `createdAt`

## 10. `audit_logs`

Records important security and account events.

Important fields:

- actor, target, event, and success/failure outcome
- request ID, optional device details, and safe metadata
- `createdAt`

Recommended events include registration, login success/failure, email verification, password reset, role changes, account suspension, and company verification.

`expiresAt` is optional. When present, the TTL index removes the record at that date. Omit it for security events that must be retained indefinitely or archived under a separate policy.

## 11. `companies`

Stores the software-house profile used for AI matching.

Important fields:

- legal and display names, company size, district, and contact data
- `technologies`: bounded list such as Next.js, Node.js, MongoDB, and Google Cloud
- `qualifications`: certification, capability, and experience evidence
- `profileCompleteness`: matching-readiness percentage
- `verificationStatus`: `unverified`, `pending`, `verified`, or `rejected`

## 12. `ai_evaluations`

Stores AI-derived information separately from official source facts.

Important fields:

- `torId` and `torVersion`
- `status`: `queued`, `processing`, `completed`, or `failed`
- `retryCount`, `lastAttemptAt`, and `nextAttemptAt`: retry and backoff state used by the worker queue
- `lastError`: structured code, message, and retryable flag for the latest failed attempt
- `requirements`: extracted requirement, category, importance, and evidence
- `budgetObservation`, `riskFlags`, and `summary`
- `model`: provider, name, version, and prompt version
- `generatedAt`

Every AI statement should include evidence text or a page reference when possible. The UI must label this information as AI-generated.

## 13. `company_matches`

Stores the evaluated relationship between one company and one TOR version.

Important fields:

- `companyId`, `torId`, and `torVersion`
- `score`: 0–100 compatibility score
- `recommendation`: `strong_match`, `possible_match`, or `not_recommended`
- `requirementMatches`: met, partial, or missing status with evidence
- `strengths`, `gaps`, and `explanation`
- `computedAt`

## 14. `saved_tors`

Stores one bookmark per user and TOR.

Important fields:

- `userId` and `torId`
- `note`
- `followUpStatus`: `watching`, `reviewing`, `preparing_bid`, `submitted`, or `dismissed`
- `createdAt` and `updatedAt`

## 15. `notifications`

Tracks in-app and email alerts.

Important fields:

- `eventKey`: idempotency value that prevents duplicate delivery
- `userId`, optional `companyId`, and optional `torId`
- `type`: `new_match`, `tor_updated`, `deadline_reminder`, or `system`
- `channel`: `in_app` or `email`
- `status`: `queued`, `sent`, `failed`, or `read`
- `attemptCount` and `nextAttemptAt`: delivery retry state
- `deliveryError`: structured code, message, and last-attempt timestamp
- `title`, `message`, `createdAt`, `sentAt`, and `readAt`

Workers should query queued or failed records using the `status + nextAttemptAt` index rather than repeatedly scanning all notifications.

## Feature-to-Collection Map

| Product feature | Main collections |
| --- | --- |
| Dashboard, search, and filters | `tor_announcements`, `sources`, `organizations` |
| Five-source crawler | `sources`, `ingestion_runs`, `tor_announcements`, `tor_versions` |
| Raw crawler validation and cleanup | `ingestion_runs`, `raw_ingestion_items` |
| TOR details, PDF reader, source link | `tor_announcements`, `tor_versions` |
| Company profile and qualifications | `companies`, `users` |
| Registration, login, and account recovery | `users`, `auth_tokens`, `sessions`, `audit_logs` |
| AI evaluation | `ai_evaluations`, `tor_announcements` |
| Matching and recommendations | `company_matches`, `companies`, `ai_evaluations` |
| Saved TORs and notifications | `saved_tors`, `notifications` |
