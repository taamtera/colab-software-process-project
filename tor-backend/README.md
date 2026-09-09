# TOR Software Express Backend

This service is the private connection between the Next.js frontend and MongoDB Atlas.

```text
Next.js frontend -> Express API -> MongoDB Atlas
```

The frontend must never receive `MONGODB_URI` or connect directly to Atlas.

## Local Setup

1. Copy `.env.example` to `.env`.
2. Add the private Atlas URI and keep `MONGODB_DB_NAME=tor_software`.
3. Run `npm install`.
4. Run `npm run check`.
5. Run `npm run dev`.
6. Open `http://localhost:4000/api/health`.

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
