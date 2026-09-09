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

The frontend reads TOR announcements through the Express API. Dates in responses are serialized by MongoDB/Express as ISO date strings.

- `GET /api/tors`: list TOR announcements. Supports `search`, `status`, `category`, `tagIds`, `sourceId`, `organizationId`, `minBudget`, `maxBudget`, `deadlineAfter`, `page`, and `limit` query parameters. `tagIds` accepts either a comma-separated list or repeated query parameters.
- `GET /api/tors/:torId`: read one TOR announcement by MongoDB ObjectId.
- `PATCH /api/tors/:torId`: update editable TOR fields. Requires `project_manager` or `system_admin` authentication.
- `GET /api/thumbnail/:templateId`: stream a stored WebP thumbnail from the `thumbnails` collection. Returns `404` when no image exists and never returns the stored Base64 value as JSON.

The TOR list/detail responses include `templateId`, `projectId`, `title`, `departmentId`, `departmentName`, `publishedAt`, `procurementMethod`, `announcementType`, `url`, `documentUrl`, `thumbnail`, and `status`. Missing legacy fields are returned as `null`; when a `templateId` exists, `thumbnail` points to the backend thumbnail route so the frontend can fall back if that route returns `404`.

The update body may contain `title`, `description`, `summary`, `category`, `departmentName`, `publishedAt`, `submissionDeadline`, `projectStartAt`, `projectEndAt`, `sourceUrl`, `url`, `documentUrl`, `thumbnail`, `status`, and `budget`. Dates must be ISO date strings, `status` must be `draft`, `open`, `closed`, `cancelled`, or `awarded`, and unknown fields are rejected. The API records `updatedAt` and `updatedByUserId` automatically.

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

Successful detail and update responses use `{ "tor": {} }`. Invalid ObjectIds, invalid update fields, missing records, and authentication failures return the standard `{ "error": { "code", "message", "requestId" } }` error shape.

## Tagging API

- `GET /api/tags`: list active tags; accepts `category` and `search` query parameters
- `POST /api/tags`: create a controlled tag; system administrator only
- `PUT /api/tags/companies/:companyId`: replace a company's approved tags; company member or system administrator
- `PUT /api/tags/tors/:torId`: replace a TOR's approved tags; project manager or system administrator

Company updates are restricted to the authenticated user's own company unless the user is a system administrator. API assignments are manual and approved; future AI/crawler workers must save low-confidence suggestions as unapproved records.

## Authentication Ownership

The authentication teammate should add controllers and routes under `src/routes` and use the shared database repositories. Authentication logic must not be placed in the Next.js browser code.

Planned route prefix: `/api/auth`.

The exact registration fields, statuses, endpoint names, token policy, and team responsibilities are defined in `docs/authentication-contract.md`.

## Docker

The backend image installs production dependencies only, runs as a non-root user, and contains no `.env` file or database credentials. Start it through the repository-level `docker-compose.yml` so health checks and the crawler worker are configured together.
