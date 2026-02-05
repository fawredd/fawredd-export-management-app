# SKILLS.md

This file expands the **Skills index** from `AGENTS.md` with concise, actionable descriptions to help AI agents and contributors understand expectations.

- **TypeScript (strict)** — Strong typing, `noImplicitAny`, `strict` mode enabled. Prefer `type` over `any`, use `readonly` where appropriate, and infer types from Zod schemas where possible.

- **Next.js v15 (App Router)** — Use the App Router by default, favor Server Components, use Server Actions for mutations, and follow SSR-first patterns. Keep client-side code minimal and only in `'use client'` boundaries.

- **React v19 (Server / Client components)** — Prefer functional components and hooks; use Server Components for data fetching and Client Components for interactions. Use `useActionState` and `useOptimistic` where applicable.

- **Tailwind CSS v4 & shadcn/ui** — Utility-first styling; avoid custom CSS files. Use `dark:` variants and responsive prefixes (`sm:`, `md:`, `lg:`).

- **Zod (validation)** — Define schemas for all inputs and API responses. Parse inputs in controllers and Server Actions and infer TS types with `z.infer<>`.

- **TanStack Query v5 / Forms** — Use `useQuery` for GETs, `useMutation` for mutations (if not Server Actions). Manage query keys consistently and invalidate queries on success.

- **TanStack Table v8** — Use `useReactTable`, `createColumnHelper`, and `flexRender` to build accessible, headless tables.

- **Prisma v6 + Postgres** — Keep DB access in `repositories/`. Use Decimal for money fields (`@db.Decimal(20,6)`), run safe migrations, and propose schema changes with a plan.

- **Express v5 (controllers, middlewares)** — Layer controllers -> services -> repositories. Use `express-async-errors` or centralized error middleware and Zod validation middleware.

- **JWT auth / NextAuth (optional)** — Use httponly cookies for JWT; keep secrets out of code. NextAuth may be used for frontend sessions where appropriate.

- **Pino logging** — Structured JSON logging via a shared `logger` utility. Log requests, errors, and critical operations.

- **Swagger/OpenAPI** — Document endpoints with OpenAPI (Swagger UI) and update docs when adding or changing routes.

- **Jest / Supertest / Playwright** — Unit tests with Jest, integration tests with Supertest, and E2E with Playwright. Add tests for happy path and at least one error case per change.

- **Docker / docker-compose** — Services are containerized; prefer `docker-compose up --build` for full stack dev. Keep Dockerfiles lean and reproducible.

- **PDF generation (puppeteer / pdf-lib stubs)** — Provide stubs or isolated utilities for PDF generation; avoid large, unapproved changes to PDF pipelines.

- **Security: helmet, cors, rate limiting** — Enforce security middleware, scope `CORS_ORIGIN` properly, and use rate limiting on public endpoints.

- **Testing patterns: unit + integration + E2E** — Favor small, fast unit tests; use integration tests for API behavior and E2E for critical flows.

---

For more context, see `AGENTS.md` and the `ai.*.instructions.md` files in the repo root.
