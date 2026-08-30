# TOR Software Docker Workflow

Docker runs the Express API and crawler worker consistently on every teammate's computer. MongoDB Atlas remains the shared data store, and PDFs remain outside containers in Google Cloud Storage.

## Start

1. Install and start Docker Desktop.
2. Keep the private Atlas URI only in `tor-backend/.env`.
3. Run `docker compose config --quiet` to validate configuration without printing environment values.
4. Run `docker compose up --build -d`.
5. Open `http://localhost:4000/api/health`.
6. Run `docker compose ps` to confirm both services are healthy.

## Stop

- Run `docker compose down` to stop both services.
- No database data is removed because Atlas is external.

## Logs

- API: `docker compose logs -f api`
- Crawler: `docker compose logs -f crawler`

## Safety

- `.env` files are excluded from Docker build contexts.
- The crawler is disabled by default until real source adapters are reviewed.
- No MongoDB or PDF data is stored in a container volume.
- Do not place the Atlas URI in a Dockerfile, image, frontend variable, or Compose file.
- Production deployments should use the hosting platform's secret manager or Docker secrets instead of copying a developer `.env` file.

## Windows Requirement

Docker Desktop's Linux engine requires WSL2 virtualization. If `docker desktop status` reports `stopped` and WSL says virtualization is unsupported, enable CPU virtualization in BIOS and the Windows `Virtual Machine Platform` and `Windows Subsystem for Linux` features, restart Windows, then start Docker Desktop again.
