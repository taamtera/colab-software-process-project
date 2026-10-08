# TOR Software Express Backend

This service is the private connection between the Next.js frontend and MongoDB Atlas.

```text
Next.js frontend -> Express API -> MongoDB Atlas
```

The frontend must never receive `MONGODB_URI` or connect directly to Atlas.

## Local Setup

1. Add `MONGODB_URI` and `MONGODB_DB_NAME` to `database-design/.env`.
2. Run `npm install` from `tor-backend`.
3. Run `npm run check`.
4. Run `npm run dev`.
5. Open `http://localhost:4000/api/health`.

The backend loads the shared `database-design/.env` automatically. Shell or deployment environment variables take precedence over values in that file. `.env.example` remains available as a reference for backend-only settings such as authentication and CORS.

## Current Foundation

- Secure HTTP response headers with Helmet
- Restricted frontend origins with credential support
- One-megabyte JSON request limit
- Request IDs for troubleshooting and audit logs
- Shared MongoDB connection pool
- Database health endpoint
- Safe 404 and server-error responses
- Graceful server and database shutdown
- Reusable repositories for users, secure tokens, sessions, audit logs, companies, and TOR discovery
- Controlled tag catalog and reviewed TOR/company tag assignments

## TOR API

The frontend reads projects through the Express API. RSS stage dates use `YYYY-MM-DD`; contract dates preserve the source API?s original Thai strings.

- `GET /api/tors`: list TOR announcements. Supports `search`, `status`, `category`, `tagIds`, `sourceId`, `organizationId`, `minBudget`, `maxBudget`, `deadlineAfter`, `page`, and `limit` query parameters. `tagIds` accepts either a comma-separated list or repeated query parameters.
- `GET /api/tors/:projectId`: read one project by its exact string project ID.
- `GET /api/tors/documents/:projectId`: proxy the real e-GP document inline for browser preview.
- `GET /api/tors/documents/:projectId/download`: proxy the real e-GP document as a forced download.

Document preview supports PDF and HTML. PDF bytes are served unchanged with `application/pdf`; HTML is decoded using its declared encoding and returned as UTF-8 with a base URL so relative assets and document links resolve against the source. Downloads use `.pdf` or `.html` according to the response. HTML responses are sandboxed without scripts or access to the application's origin; PDF responses retain compatibility with the browser's native viewer. Legacy HTTP links on the allowed e-GP hosts are upgraded to HTTPS before fetching. Every redirect must remain on those hosts. Unavailable upstream documents return `502`; unsupported formats return `415`. The popup offers an original-document link for source applications that need JavaScript or cannot be previewed.
- `PATCH /api/tors/:projectId`: update editable TOR fields. Requires `project_manager` or `system_admin` authentication.
- `GET /api/thumbnail/:projectId`: stream a stored WebP thumbnail from the `thumbnails` collection. Returns `404` when no current image exists and never returns the stored Base64 value as JSON.

The TOR list/detail responses identify projects using string `projectId`. MongoDB `_id` and retired top-level `templateId`, `projectKey`, and `announcementType` are omitted. Responses include display fields, RSS status/date, unordered latest stage observations, and first/last sighting timestamps. Plan IDs remain separate from linked numeric projects. Invitation publication does not verify that bidding is open.

The removed enrichment fields are omitted entirely from API responses, even if a legacy input document contains them: `opend`, `opendLookup`, `province`, `district`, `subdistrict`, `projectLocation`, `projectMoney`, `referencePrice`, `totalContractValue`, `contractProjectStatus`, `contracts`, `opendUpdatedAt`, and `locationFilter`. They are not returned as nulls, empty objects, or empty arrays. The frontend no longer maps or displays them. Optional application `budget` data is separate from the retired opend fields.

Document, detail, update, and thumbnail routes now take string project identities. `GET /api/thumbnail/:projectId` checks the stored image's `sourceUrl` against the current project's `documentUrl`, returns decoded WebP bytes, and returns `404` for a missing or stale image. Responses disable cache retention so independently arriving thumbnail updates become visible. Coverage is nationwide; ingestion retains its software/IT title filter.

The update body may contain `title`, `description`, `summary`, `category`, `departmentName`, `publishedAt`, `submissionDeadline`, `projectStartAt`, `projectEndAt`, `sourceUrl`, `url`, `documentUrl`, `thumbnail`, `status`, and `budget`. Publication dates must be `YYYY-MM-DD`; other editable application dates use ISO strings. `status` accepts the RSS stage statuses documented in the database schema, including `multiple_announcements_same_day`. Unknown fields are rejected. The API records `updatedAt` and `updatedByUserId` automatically.

Successful list responses use this shape:

```json
{
	"items": [],
	"pagination": {
		"page": 1,
		"limit": 20,
		"total": 0,
		"totalPages": 0
	}
}
```

Successful detail and update responses use `{ "tor": {} }`. Invalid update fields, missing records, and authentication failures return the standard `{ "error": { "code", "message", "requestId" } }` error shape.

## Tagging API

Project discovery accepts `search` (all whitespace-separated terms, literal case-insensitive substrings across project ID, title, description, department ID and name), `departmentId`, `procurementMethod`, `stage`, `stageScope=latest|retained`, `fromDate`, `toDate`, and `sort=latest|oldest|relevance`. Dates use inclusive `YYYY-MM-DD` bounds on `statusPublishedAt`. Latest-stage filtering includes each stage tied on the latest publication day. Retained-stage filtering considers the latest stored observation of each stage, not a complete announcement history. `__unknown__` selects missing departments or methods. Project and department IDs remain strings.

`page` and `limit` select a result page. Responses also include `totalAllProjects` and global `facets.departments` (`value`, `name`, `count`) and `facets.methods` (`value`, `count`). Facet counts describe the whole collection, rather than the filtered page. Relevance prioritizes exact IDs, followed by title and department matches; it is not an AI compatibility score.

- `GET /api/tags`: list active tags; accepts `category` and `search` query parameters
- `POST /api/tags`: create a controlled tag; system administrator only
- `PUT /api/tags/companies/:companyId`: replace a company's approved tags; company member or system administrator
- `PUT /api/tags/tors/:projectId`: replace a TOR's approved tags; project manager or system administrator

Company updates are restricted to the authenticated user's own company unless the user is a system administrator. API assignments are manual and approved; future AI/crawler workers must save low-confidence suggestions as unapproved records.

## Authentication Ownership

The authentication teammate should add controllers and routes under `src/routes` and use the shared database repositories. Authentication logic must not be placed in the Next.js browser code.

Planned route prefix: `/api/auth`.

The exact registration fields, statuses, endpoint names, token policy, and team responsibilities are defined in `docs/authentication-contract.md`.

## Docker

The backend image installs production dependencies only, runs as a non-root user, and contains no `.env` file or database credentials. Start it through the repository-level `docker-compose.yml` so health checks and the crawler worker are configured together.
