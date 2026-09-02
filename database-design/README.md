# TOR Software — MongoDB Atlas Database Package

This package converts the original e-GP relational draft into a MongoDB Atlas design for the complete TOR Software product.

It covers:

- TOR collection from e-GP and other public sources
- current TOR records and version history
- source documents and original links
- users, software-house profiles, and qualifications
- registration, verification tokens, login sessions, and security audit logs
- AI requirement evaluation and company matching
- saved TORs, recommendations, and notifications
- crawler execution history and error tracking
- isolated raw crawler staging with automatic cleanup

## Why MongoDB Atlas

The SRS specifies MongoDB Atlas. Atlas hosts MongoDB in the cloud, so the team does not need to install the MongoDB database server on each laptop. The application only needs a secure Atlas connection string.

## Collections

| Collection | Purpose |
| --- | --- |
| `sources` | Public TOR websites and crawler adapter settings |
| `organizations` | Agencies, departments, and purchasing units |
| `tor_announcements` | Latest searchable TOR information |
| `tor_versions` | Immutable history when a TOR changes |
| `ingestion_runs` | Crawler requests, counts, failures, and raw-payload locations |
| `raw_ingestion_items` | Temporary crawler items, validation errors, and normalization status |
| `users` | Login identity, role, company membership, and preferences |
| `auth_tokens` | Hashed email-verification, password-reset, and invitation tokens |
| `sessions` | Hashed refresh sessions with expiration and revocation state |
| `audit_logs` | Registration, login, password, status, and verification events |
| `companies` | Software-house profile, technologies, and qualifications |
| `ai_evaluations` | AI-extracted TOR requirements and observations |
| `company_matches` | Company-to-TOR compatibility scores and explanations |
| `saved_tors` | User bookmarks and follow-up notes |
| `notifications` | New match, update, and deadline alert delivery records |

The detailed model and relationships are in `docs/schema.md`.

The concise setup and responsibility contract for teammates is in `docs/team-handoff.md`.

## Atlas Setup

1. Create a free MongoDB Atlas cluster.
2. Create a database user. This is separate from the email used to sign in to Atlas.
3. Add the development machine's IP address to the Atlas IP access list.
4. Copy the Atlas application connection string.
5. Copy `.env.example` to `.env` and replace the placeholders.
6. Install the Node.js dependency with `npm install`.
7. Test access with `npm run db:check`.
8. Create collections, validation rules, and indexes with `npm run db:setup`.
9. Add demonstration records with `npm run db:seed`.

## Safe Crawler Testing

- Use `tor_software_dev` for shared development data.
- Use `tor_software_test` for crawler and automated tests that may be reset.
- Reserve `tor_software_prod` for verified live data only.
- Run `npm run db:cleanup:raw` to remove already-expired staging items from a non-production database.
- Run `npm run db:cleanup:run -- <runId>` to remove one crawler run and its raw staging items from a non-production database.
- Run `npm run db:reset:test` to drop, recreate, seed, and verify only `MONGODB_TEST_DB_NAME`.

The reset command refuses any database whose name does not end in `_test`. Cleanup commands also block names that appear to be production databases.

No local MongoDB database installation is required. Node.js is only used to run these setup scripts and will also be used by the future backend.

## Security Rules

- Never commit `.env` or paste the Atlas password into source code.
- Use a separate database user for development and production.
- Allow only known IP addresses during development.
- Store password hashes only; never store plain-text passwords.
- Store only hashes of verification, password-reset, invitation, and refresh tokens.
- Store PDF files in Google Cloud Storage and keep only their metadata, checksum, and storage URL in MongoDB.
- Keep original source URLs so users can verify every TOR against the publisher.

## Main Design Decisions

- `tor_announcements` contains the latest version for fast dashboard, search, and filtering.
- `tor_versions` preserves previous content without making the dashboard query historical records.
- `sourceId + dedupKey` prevents the same source item from being inserted twice.
- `contentHash` detects a changed TOR and determines whether a new version is required.
- AI outputs are separated from source data so the original TOR remains auditable.
- AI and notification workers store retry counters, next-attempt times, and structured errors for reliable queue processing.
- Match scores are stored separately because one TOR can match many companies.
- Organization snapshots use bounded fields and ancestor IDs for stable display and agency-wide filtering.
- Audit retention uses an optional per-record `expiresAt` date instead of a fixed global deletion period.
- Qualifications and technologies are embedded in `companies` because they are small, bounded profile data.
- Complete crawler responses are not copied into every TOR. `ingestion_runs` stores a checksum and a cloud-storage location when raw payload retention is needed.

## Handoff to the Backend Developer

Before sharing the package, run `npm run handoff:verify`. Share only the files listed in `docs/team-handoff.md`; never include `.env` or `node_modules/`.

The backend should use the same collection names and should reuse the unique indexes for safe upserts. The crawler should follow this sequence:

1. Start an `ingestion_runs` record.
2. Save each fetched source item in `raw_ingestion_items` with a 14-day `expiresAt` value.
3. Validate and normalize the raw item without changing clean TOR data.
4. Mark invalid staging items as `rejected` or `failed` with validation errors.
5. Build a stable `dedupKey` from the source's external ID or canonical source URL.
6. Compare the new `contentHash` with the current TOR.
7. Insert a new TOR or update the current TOR and add a `tor_versions` snapshot.
8. Mark the staging item as `normalized` and retain the resulting TOR ID.
9. Complete the ingestion record with inserted, updated, unchanged, and failed counts.
10. Queue AI evaluation, company matching, and notifications only for new or changed TORs.

Official references:

- MongoDB Atlas connection requirements: https://www.mongodb.com/docs/atlas/connect-to-database-deployment/
- MongoDB schema validation: https://www.mongodb.com/docs/manual/core/schema-validation/
- MongoDB unique compound indexes: https://www.mongodb.com/docs/manual/core/index-unique/create-compound/
- MongoDB Node.js driver: https://www.mongodb.com/docs/drivers/node/current/get-started/
