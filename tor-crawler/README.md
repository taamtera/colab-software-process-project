# TOR Software Crawler Worker

This service is the container-ready foundation for the five public TOR source adapters.

It currently connects to Atlas, exposes a health endpoint, schedules crawler cycles, and remains disabled until source adapters are implemented and reviewed.

## Safety Defaults

- `CRAWLER_ENABLED=false` prevents accidental website requests.
- `CRAWLER_ENVIRONMENT=development` keeps early work outside production.
- `RAW_RETENTION_DAYS=14` matches the temporary staging retention policy.
- The worker never writes source results directly into `tor_announcements`; adapters must use the raw staging pipeline.

## Adding a Source

Implement an adapter with a `collect` function under `src/adapters`, then export it from `src/adapters/index.mjs`. Each adapter must create an ingestion run, store raw items, validate and normalize them, and only then upsert clean TOR records.

