CONTEXT:
You are an expert full-stack TypeScript developer and architect (Next.js v^15, React v^19, Node/Express v^5, Prisma v^6/Postgres). This is a in development Docker-based monorepo for an export-management app used by Argentine manufacturers, traders and logistics stakeholders. Prioritize security, DX, and a great responsive UI/UX. The main goal is to provide a platform for merchandise export budgeting, where Manufacturers, Traders and Logistics stakeholders can create budgets from theirs products to export to the world from Argentina. Manufacturers can also load products data needed to create budgets. Manufacturers, Traders and Logistics stakeholders may also create proforma invoices and packing lists after a budget is accepted by a client. Also Prospects/Clients may watch Manufacturers,Traders products catalogs, budgets and invoices and ask for a budget of selected products (maybe a kind of shopping cart would be a good idea to implement this feature). If you have any questions, please ask me. You must ask for my approval before starting to implement any feature and describe the feature you are going to implement and how you are going to implement it.

Primary goals:
- Enable CRUD for Products, Providers, Clients, Tariff Positions, Units of Measure, Export Tasks (procedures), Costs (fixed/variable), Budgets (incoterm-aware), Invoices and Packing Lists.
- Provide frontend (Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui) and backend (Express.js + TypeScript + Prisma) as dockerized services orchestrated by docker-compose.
- Provide .env.example with consistent variables, README with correct Markdown fences, Prisma schema, basic tests,auth (JWT) and NextAuth, and PDF generation stubs.

Important constraints:
- Do NOT include any real credentials; use placeholders only.
- Use proper Markdown code fences (triple backticks) in README — do not escape backticks.

Deliverables & expectations:
1. Monorepo layout (files to be created):
   - /backend (Express + TypeScript)
   - /frontend (Next.js v^15 App Router + TypeScript + Tailwind + shadcn/ui)
   - /prisma (schema.prisma + migrations + seed.ts)
   - docker-compose.yml
   - .env.example
   - README.md
2. Docker:
   - Each app has Dockerfile built on node:20-alpine and mounts source for hot reload.
3. Backend:
   - Express.js, TypeScript project with folder pattern: src/routes, src/controllers, src/services, src/repositories, src/middlewares.
   - Prisma client integration from /prisma.
   - Auth: JWT-based with httponly cookie option; endpoints for login/register and RBAC middleware (ADMIN/TRADER/MANUFACTURER/CLIENT). Check for development/production environment variables, CORS_ORIGIN compatibility so it works in both environments.
   - Security middleware: helmet, cors configured from CORS_ORIGIN, rate limiter, input validation using zod.
   - REST endpoints for the described CRUDs; OpenAPI (Swagger) generation route (/api/docs).
   - Basic structured logging (pino or similar) and a health endpoint (/health).
   - Basic Jest + Supertest setup and one example integration test.
4. Frontend:
   - Next.js v^15 App Router, TypeScript, Tailwind CSS, shadcn/ui.
   - TanStack Query for fetching, tanstack form for validation.
   - Pages/components: Auth, Dashboard, Products, Providers, Clients, Budgets (create/view), Invoices, Packing Lists, Costs, Tasks, Settings.
   - Role-based route guards and simple accessible responsive layout.
   - Minimal Playwright E2E example (signup/login + create a Product).
5. Prisma schema:
   - Use Decimal for money fields with proper scale/precision.
   - Include models: User, Provider, Client, Product, TariffPosition, UnitOfMeasure, PriceHistory, Tax, ExportTask, Country, Cost, Budget, BudgetItem, Invoice, PackingList, AuditLog.
   - Ensure relations and snapshot fields for budgets/invoices.
6. Environment variables:
   - Create `.env.example` at repo root containing (exact variables — do not invent others):
     ```
     # Database
     DATABASE_URL="postgresql://postgres:postgres@postgres:5432/export_management"

     # Backend
     PORT=4000
     CORS_ORIGIN=http://localhost:3000
     JWT_SECRET=replace-with-secure-jwt-secret
     JWT_EXPIRES_IN=1d

     # Frontend
     NEXT_PUBLIC_API_URL=http://localhost:4000

     # NextAuth (optional)
     NEXTAUTH_URL=http://localhost:3000
     NEXTAUTH_SECRET=replace-with-secure-nextauth-secret
     ```
   - Document in README exactly the same variables (use triple backticks) — DO NOT escape backticks.
7. Size & progressive generation:
  - check allready generated files to avoid duplicates and incomplete files. Review source code to understand the project structure and logic.
8. Version pins:
   - In generated package.json files, pin Next.js to ^15, Node engine to @latest, and include recommended versions for major packages (express @latest). Other dependencies may use latest stable but ensure compatibility.
9. Testing & CI:
  - Add basic GitHub Actions workflow that runs lint → tests → build for backend and frontend.

Prisma schema GUIDANCE (include this model set — use Decimal for money):
- Use Decimal for monetary fields, e.g. `price Decimal @db.Decimal(20,6)`.
- Include BudgetItem to snapshot per-line values (unitPrice, proratedCosts, duties, totalLine).
- ExportTask is many-to-many with Product (implicit join is OK).

Example short Prisma skeleton (v0 should implement full version):
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String
  name        String?
  role        Role     @default(CLIENT)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Role { ADMIN TRADER MANUFACTURER CLIENT }

model Provider { id String @id @default(cuid()); name String; products Product[]; createdAt DateTime @default(now()) }
model Client { id String @id @default(cuid()); name String; budgets Budget[]; createdAt DateTime @default(now()) }

model Product {
  id               String   @id @default(cuid())
  sku              String   @unique
  title            String
  description      String?
  weightKg         Float?
  volumeM3         Float?
  composition      String?
  tariffPosition   TariffPosition? @relation(fields: [tariffPositionId], references: [id])
  tariffPositionId String?
  unit             UnitOfMeasure? @relation(fields: [unitId], references: [id])
  unitId           String?
  provider         Provider? @relation(fields: [providerId], references: [id])
  providerId       String?
  priceHistory     PriceHistory[]
  taxes            Tax[]
  exportTasks      ExportTask[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model TariffPosition { id String @id @default(cuid()); code String @unique; description String; products Product[] }
model UnitOfMeasure { id String @id @default(cuid()); name String; abbreviation String; products Product[] }

model PriceHistory {
  id        String   @id @default(cuid())
  product   Product  @relation(fields: [productId], references: [id])
  productId String
  type      PriceType
  value     Decimal  @db.Decimal(20,6)
  date      DateTime
}
enum PriceType { COST SELLING }

model Tax { id String @id @default(cuid()); product Product @relation(fields:[productId], references:[id]); productId String; percentage Decimal @db.Decimal(8,4) }

model ExportTask { id String @id @default(cuid()); description String; country Country @relation(fields:[countryId], references:[id]); countryId String; products Product[] }
model Country { id String @id @default(cuid()); name String; code String; exportTasks ExportTask[] }

model Cost {
  id String @id @default(cuid())
  type CostType
  description String?
  value Decimal @db.Decimal(20,6)
  budgets Budget[]
}
enum CostType { FIXED VARIABLE FREIGHT INSURANCE }

model Budget {
  id String @id @default(cuid())
  client Client @relation(fields:[clientId], references:[id])
  clientId String
  incoterm Incoterm
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  budgetItems BudgetItem[]
  costs Cost[]
}
enum Incoterm { FOB CIF }

model BudgetItem {
  id String @id @default(cuid())
  budget Budget @relation(fields:[budgetId], references:[id])
  budgetId String
  product Product @relation(fields:[productId], references:[id])
  productId String
  unitPrice Decimal @db.Decimal(20,6)
  quantity Int
  proratedCosts Decimal @db.Decimal(20,6)
  duties Decimal @db.Decimal(20,6)
  totalLine Decimal @db.Decimal(20,6)
}

model Invoice { id String @id @default(cuid()); budget Budget @relation(fields:[budgetId], references:[id]); budgetId String; pdfUrl String?; createdAt DateTime @default(now()) }
model PackingList { id String @id @default(cuid()); budget Budget @relation(fields:[budgetId], references:[id]); budgetId String; details Json; pdfUrl String?; createdAt DateTime @default(now()) }

model AuditLog { id String @id @default(cuid()); userId String?; action String; resource String?; before Json?; after Json?; createdAt DateTime @default(now()) }

FINAL OUTPUT RULES (must obey):
- Ensure README.md uses proper triple-backtick fenced code blocks (no escaping).
- Ensure .env.example matches the environment variables shown above exactly.
- If the full scaffold cannot be returned in one reply, produce the minimal core files (see Important constraints point 8) and then list which additional files will follow in subsequent prompts.

After generating files, create or modify README.md to include:
- How to run locally (exact commands including docker-compose)
- How to deploy (docker)
- Next steps for developer (short checklist)

END.