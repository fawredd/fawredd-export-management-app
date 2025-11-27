# Environment Configuration Guide

## Docker Environment (.env)
Use this configuration when running with `docker compose up`:

```bash
DATABASE_URL="postgresql://postgres:mysecretpassword@postgres:5432/postgres"
NEXT_PUBLIC_API_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000
```

The `postgres` hostname refers to the Docker service name defined in `docker-compose.yml`.

## Local Development (.env.development)
Use this configuration when running locally with `npm run dev`:

```bash
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
NEXT_PUBLIC_API_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000
```

The `localhost` hostname refers to your local machine where PostgreSQL is running.

## Setup Instructions

### For Docker:
1. Copy `.env.example` to `.env`
2. Ensure `DATABASE_URL` uses `@postgres:5432`
3. Run `docker compose up --build`

### For Local Development:
1. Copy `.env.development` to backend and frontend directories
2. Ensure PostgreSQL is running locally on port 5432
3. Run `npm run dev` in both backend and frontend directories

## Production
For production, use environment-specific values and never commit secrets to version control.
