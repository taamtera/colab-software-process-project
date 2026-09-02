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
- isolated raw crawler staging with TTL retention

## Why MongoDB Atlas
| `tor_versions` | Immutable history when a TOR changes |
| `ingestion_runs` | Crawler requests, counts, failures, and raw-payload locations |
| `raw_ingestion_items` | Temporary crawler items, validation errors, and normalization status |
| `rss_query_state` | RSS query completeness, splitting, and retry state |
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
9. Seed non-RSS application data with `npm run db:seed`.
10. Feed approved RSS data through the ingestion pipeline.

## Live Ingestion

No local MongoDB database installation is required. Node.js is only used to run these setup scripts and will also be used by the future backend.

The seed command creates only sources, organizations, companies, users, and audit data. It does not write to `procurement_projects`, `ingestion_runs`, `raw_ingestion_items`, `tor_announcements`, `tor_versions`, `rss_query_state`, or any announcement-dependent collections.

## Security Rules


## Main Design Decisions


## Handoff to the Backend Developer

Before sharing the package, run `npm run handoff:verify`. Share only the files listed in `docs/team-handoff.md`; never include `.env` or `node_modules/`.

The backend should use the same collection names and should reuse the unique indexes for safe upserts. The crawler should follow this sequence:

1. Start an `ingestion_runs` record.
2. Save each fetched source item in `raw_ingestion_items` with a 14-day `expiresAt` value.
3. Validate and normalize the raw item without changing clean TOR data.
4. Mark invalid staging items as `rejected` or `failed` with validation errors.
5. Build a deterministic `announcementKey` from the source announcement identifiers; do not use RSS `guid`.
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

