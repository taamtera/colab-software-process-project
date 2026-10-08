# TOR Software database design

The current crawler flow uses three collections:

| Collection | Purpose | Identity |
| --- | --- | --- |
| `tor_announcements` | One project with retained RSS stage observations | Unique string `projectId` |
| `thumbnails` | Base64 WebP thumbnails tied to the current document | Unique string `projectId` |
| `ingestion_runs` | Department/stage requests, raw counts, keyword outcomes, completeness | Internal MongoDB `_id` |

[Schema](docs/schema.md) contains field types and status mappings. [Team handoff](docs/team-handoff.md) describes application responsibilities. The existing authentication, company, tagging, and AI collections are separate application features; the ingestion flow does not write to them.

Projects and thumbnails use `projectId` strings throughout the frontend and API. Plan IDs remain separate from numeric procurement IDs. Top-level `templateId`, `announcementType`, and `projectKey` are retired on projects. Raw identifiers stay in `itemParams`. There is no Bangkok restriction; the software/IT title filter remains part of ingestion.

## New database setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and configure `MONGODB_URI` and `MONGODB_DB_NAME`.
3. Run `npm run db:check`.
4. Run `npm run db:setup` to create validators and indexes, including unique string `projectId` indexes on both projects and thumbnails.
5. Run `npm run db:verify`.

`db:setup` retains the application's existing collection definitions. It checks for unmigrated identities before changing the database. `db:seed` writes only optional non-RSS application demo data.

## Existing database migration

The crawler workflow does not migrate old data or create indexes. The database owner performs this separately:

1. Pause ingestion and other project/thumbnail writers.
2. Run `npm run db:migrate` for a read-only preview. Resolve reported missing identities, RSS stage codes, non-string department IDs, and references to duplicate `_id` records first. Raw document `itemParams.templateType` is preserved but does not establish an RSS stage; stage metadata must come from the RSS status or request/announcement fields.
3. Review the merge/discard counts. The migration keeps one project per string `projectId`, the latest observation per stage, the earliest `firstSeenAt`, and the latest `lastSeenAt`. Different latest stages on the same date remain ambiguous. Plan IDs never merge into linked numeric IDs.
4. Apply with a new backup filename:

   ```powershell
   npm run db:migrate -- --apply --backup project-migration-backup.ejson
   ```

5. Run `npm run db:setup`, then `npm run db:verify`, before resuming ingestion.

Apply writes an EJSON backup of all three collections, their validators, and indexes, without overwriting a previous backup. The project/thumbnail rewrite uses an atomic transaction and requires a replica set or mongos (including Atlas). It retains a surviving original `_id`, moves raw template IDs into `itemParams`, removes retired identity and enrichment fields without placeholders, and discards duplicate or stale images whose source URL no longer matches the current document. Unresolved source identities or application references block the migration. Existing ingestion logs remain unchanged.

Retired identity indexes are removed after the backup and before the transaction; full unique `projectId` indexes are created after it commits. If a later step fails, keep writers paused and retain the backup. Rerun the preview and finish setup/verification; use the backup for manual restoration if the merge must be reversed. The backup contains source documents and must not be committed or shared publicly.

## Local verification

Run `npm test` for migration contract tests and `npm run handoff:verify` for package checks. Database setup and verification commands require a configured MongoDB connection. The frontend refreshes projects and thumbnails independently every 30 seconds, and does not assume verified open bidding from an invitation announcement.

## Enrichment removal

The 13 removed enrichment fields listed in the schema must be absent, including null values and empty arrays. The API and frontend omit them; the migration no longer recreates them. The revised project validator rejects them when database setup is applied. Keep the external workflow's enrichment step disabled.

Run `npm run db:verify-enrichment-removed` to check all project documents without writing anything. It returns each field's remaining count and fails if any project still contains a removed field. A successful zero count confirms physical field absence rather than only hiding it in the frontend.
