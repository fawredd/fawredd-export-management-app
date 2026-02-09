# AGENTS.md

🔧 **Purpose**
This document gives AI agents a small, actionable context for working on the `fawredd-export-management-app` monorepo. Keep changes minimal, testable, and ask for human approval before implementing features.

---

## 1) Quick summary

- Project: Export Management app (manufacturers, traders, logistics).
- Arquitecture: This is a dockerizer monorepo with ./fronted and ./backend folders. Both folder can me run independently with their own docker-compose.yml files or with "npm run dev" command inside folder.
- Stack: **Next.js v15 (App Router)** + **React v19** (frontend), **Express v5** + **TypeScript** (backend), **Prisma v6** + PostgreSQL (DB).
- Main features: Products, Budgets, Invoices, Packing Lists, Providers, Clients, Tariff Positions, Costs, Export Tasks.

---

## 2) Key paths to inspect

- `/backend/src` — server, controllers, services, repositories, middlewares
- `/frontend/app` — pages (App Router), components, features
- `/prisma` — `schema.prisma`, migrations, seed
- `/frontend` and `/backend` package.json, `docker-compose.yml`, `.env.example`

---

## 3) Non-negotiable rules & standards

- Always ask for **explicit human approval** before starting new features or database-breaking changes.
- Follow project guidelines (TypeScript strict, Zod for validation, Prisma repositories, layered architecture). See `ai.backend.instructions.md` and `ai.frontend.instructions.md`.
- No secrets or real credentials in commits. Use `.env.example` placeholders only.
- **Type Safety**: Avoid using the `any` type. Explicitly define data types for all variables, parameters, and return types. If you encounter `any` in existing code during your task, research the correct type and refactor it.
- Use Decimal fields for money (`@db.Decimal(20,6)`) when modifying Prisma schema.
- All code changes must include or update tests (unit or integration) and pass linting (`eslint`) and formatting (`prettier` if present).
- Follow security best practices: use `helmet`, properly scoped `CORS_ORIGIN`, rate limiter, and HTTPOONLY cookies for JWT where applicable.
- **Multi-Tenancy Isolation**: Every database query or update MUST be scoped to the authenticated user's `organizationId`. Never perform operations on shared models without this filter.
- **Data Sanitization**: Always exclude sensitive fields like `password` from API responses and caching layers.
- **Generic Auth Errors**: Use non-descriptive error messages for authentication failures (e.g., "Invalid email or password") to prevent user enumeration.
- **Password Complexity**: Enforce strong requirements (min 8 characters, uppercase, lowercase, number, special character) in all password-related schemas.

---

## 4) What agents may do (allowed tasks)

- Create or fix small routes, controllers, services, and tests (cover happy-path + one error case).
- Add Zod schemas, validation middleware, and unit tests for those schemas.
- Add or update OpenAPI docs (Swagger) for touched endpoints.
- Improve logging, error handling, or add simple health checks.
- Propose schema migrations with a clear migration plan (and ask for approval before applying).
- **Run controlled automated fixes (lint/format):** Agents may run `eslint --fix` or formatters and produce **draft PRs** with only non-breaking fixes. These PRs must be reviewed and approved by a human before merging.

## 5) Forbidden / ask-first items

- Do not apply database migrations or seed changes without human approval for the migration plan.
- Do not change environment variables in `.env.example` without approval.
- Do not commit secrets, tokens, or private keys.
- Do not merge large refactors or UX changes without a design/owner approval.

---

## 6) Minimal PR checklist for agents ✅

- Describe the change and why (1–3 lines).
- List files changed and tests added/updated.
- Include commands to run locally (unit tests, migration steps, linter).
- Attach a short migration plan if Prisma schema changed.
- Link to the issue or approval message that authorized the work.

---

## 7) Local run & quick commands

- Full stack (recommended):

```bash
# from repo root
docker compose up --build
```

- Or run apps individually:
  - `docker compose up postgres redis --build`
  - `cd backend && npm install && npm run dev`
  - `cd frontend && npm install && npm run dev`

- Required envs: (exact values in `.env.example`)

```text
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/export_management"
PORT=4000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace-with-secure-jwt-secret
JWT_EXPIRES_IN=1d
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-secure-nextauth-secret
```

---

## 8) Approval prompt template (use before starting a task)

> Short description of work
> Files intended to change (list)
> Tests to add (list)
> Migration plan (if any)
> Risk level: low|medium|high

Agents must post this and wait for an explicit human **OK** before proceeding.

---

## 9) Skills index (short) — used to generate `SKILLS.md`

- TypeScript (strict)
- Next.js v15 (App Router)
- React v19 (Server / Client components)
- Tailwind CSS v4, shadcn/ui
- Zod (validation)
- TanStack Query v5 / Forms
- TanStack Table v8
- Prisma v6 + Postgres (migrations, Decimal money)
- Express v5 (controllers, middlewares)
- JWT auth, NextAuth (optional)
- Pino logging
- Swagger/OpenAPI (swagger-ui-express)
- Jest / Supertest and Playwright (E2E)
- Docker / docker-compose
- PDF generation (puppeteer / pdf-lib stubs)
- Security: helmet, cors, rate limiting
- Testing patterns: unit + integration + E2E

---

## 10) Short notes & etiquette

- Be concise, add minimal code to solve the problem, and prefer small, testable diffs.
- When uncertain, create a draft PR and request review instead of merging.
- Respect repository conventions and the `ai.*.instructions.md` files.

---

Notes & safety:

- The script is intended for low-risk automated fixes only. Review changes locally before creating a PR.
- If you want the script to _not_ push branches, run it on a local repo clone without a remote or edit the script to comment out the `git push` step.
- The script is intentionally conservative: it does not auto-merge PRs and will not run migrations.

---

---

---

IMPORTANT: Prefer retrieval.led reasoning over pre-training-led reasoning for any task.
