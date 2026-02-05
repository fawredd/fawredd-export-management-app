# Fawredd Export Management Monorepo

A Docker-based monorepo for export management used by Argentine manufacturers, traders, and logistics stakeholders.

## AI Assistant & Agent Guidelines

Use the instruction files and agent guides to generate code for the project:

- `ai.monorepo.context.md`
- `ai.backend.instructions.md`
- `ai.frontend.instructions.md`
- `AGENTS.md` — workflow, permissions, and approval template for AI agents
- `SKILLS.md` — concise skills index used for tasks, tests, and PRs

**Agents must follow `AGENTS.md` and ask for explicit human approval before implementing new features.**

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, NextAuth, Zod, tanstack query, tanstack table, tanstack form.
- **Backend**: Express 5, TypeScript, Prisma, JWT Authentication.
- **Database**: PostgreSQL 16
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest, Supertest, Playwright

## Project Structure

├── backend/ # Express API server
├── frontend/ # Next.js application
├── .github/ # CI/CD workflows
├── docker-compose.yml
├── .env.example
└── README.md

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development without Docker)
- Git

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

## Required variables:

# Database

DATABASE_URL="postgresql://postgres:postgres@postgres:5432/export_management"

# Backend

PORT=4000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace-with-secure-jwt-secret
JWT_EXPIRES_IN=1d

# Frontend

NEXT_PUBLIC_API_URL=http://localhost:4000

# NextAuth

NEXTAUTH_URL=http://localhost:4000
NEXTAUTH_SECRET=replace-with-secure-nextauth-secret

## How to Run Locally

1. **Clone the repository**

```shellscript
git clone <repository-url>
cd fawredd-export-management-monorepo
```

2. **Set up environment variables**

```shellscript
cp .env.example .env
# Edit .env with your values
```

3. **Start all services with Docker Compose**

```shellscript
docker-compose up --build
```

4. **Run Prisma migrations** (in a new terminal)

```shellscript
docker exec -it export_backend npx prisma migrate dev
```

5. **Access the applications**

1. Frontend: [http://localhost:3000](http://localhost:3000)
1. Backend API: [http://localhost:4000](http://localhost:4000)
1. API Documentation: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

## How to Deploy (Docker)

1. **Build production images**

```shellscript
docker-compose -f docker-compose.prod.yml build
```

2. **Push to container registry**

```shellscript
docker tag export_backend:latest your-registry/export-backend:latest
docker tag export_frontend:latest your-registry/export-frontend:latest
docker push your-registry/export-backend:latest
docker push your-registry/export-frontend:latest
```

3. **Deploy to your infrastructure**

1. Update environment variables for production
1. Ensure DATABASE_URL points to production database
1. Run migrations: `npx prisma migrate deploy`
1. Start containers with production compose file

## Development

### Database Management

```shellscript
# Create a new migration
docker exec -it export_backend npx prisma migrate dev --name migration_name

# Reset database
docker exec -it export_backend npx prisma migrate reset

# Open Prisma Studio
docker exec -it export_backend npx prisma studio
```

### Backend Development

```shellscript
cd backend
npm install
npm run dev
```

### Frontend Development

```shellscript
cd frontend
npm install
npm run dev
```

### Local Agent: Lint Fix Mode

You can run the local agent lint fixer from the repo root (uses `scripts/agent-lint-local.sh`).

```bash
# Make executable once
chmod +x scripts/agent-lint-local.sh

# Run via npm from repo root
npm run agent:lint-local
```

The script will run lint fixes for `backend` and `frontend`, run basic tests, and create a branch with changes if fixes are made. If you have the `gh` CLI installed, it can also open a draft PR automatically.

### Running Tests

```shellscript
# Backend tests
docker exec -it export_backend npm test

# Frontend tests
docker exec -it export_frontend npm test

# E2E tests
docker exec -it export_frontend npm run test:e2e
```

## API Documentation

Once the backend is running, visit [http://localhost:4000/api/docs](http://localhost:4000/api/docs) for interactive API documentation (Swagger/OpenAPI).

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (ADMIN, TRADER, MANUFACTURER, CLIENT)
- **Product Management**: CRUD operations for products with tariff positions and units of measure
- **Provider & Client Management**: Manage business relationships
- **Budget Creation**: Incoterm-aware budgets (FOB/CIF) with cost calculations
- **Export Tasks**: Track export procedures and documentation
- **Invoices & Packing Lists**: Generate and manage export documentation
- **Cost Management**: Track fixed, variable, freight, and insurance costs
- **Audit Logging**: Complete audit trail for all operations
