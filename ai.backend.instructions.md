---
applyTo: '**/backend/'
---
# AI assistant Project Instructions

This project is a **TypeScript backend** using **Express v5**, **Prisma v6** (with PostgreSQL), **Zod** for schema validation, and **Swagger/OpenAPI** for API documentation.  
Follow these standards when suggesting code completions.

---

## ⚙️ Project Architecture

Use **layered architecture** with clear separation of concerns:

```
src/
 ├─ routes/          → Express route definitions (minimal logic)
 ├─ controllers/     → HTTP handlers, input validation, response mapping
 ├─ services/        → Business logic
 ├─ repositories/    → Prisma queries and persistence logic
 ├─ middlewares/     → Auth, logging, validation, error handling
 ├─ utils/           → Helpers and sanitization functions
 └─ schemas/         → Zod validation schemas
```

Each layer imports **only downward**, never circular dependencies.

---

## 🧱 TypeScript Standards

- Target: **ES2022** (`"module": "NodeNext"`)
- Use **type-safe async/await**, never `.then()`
- Prefer **`type`** over `interface` unless extending multiple
- Use **`readonly`** where appropriate
- No `any`; use `unknown` or infer from Zod
- Enable strict mode in `tsconfig.json`

---

## 🧾 Coding Conventions

- Indentation: 2 spaces  
- Strings: single quotes  
- Imports: sorted by path depth and alphabetically  
- Use `async` for all route handlers  
- Use `try/catch` with centralized error middleware  
- Use **Pino** for logging (`pino` instance in `src/utils/logger.ts`)  
- Return JSON responses with `{ success, data?, error? }` structure  

---

## 🧪 Validation & Sanitization

- Validate all request bodies, params, and queries with **Zod** schemas.
- Import generated Prisma models from `@prisma/client`.
- Use `prisma-zod-generator` output for entity validation.
- Sanitize strings (trim, escape, normalize) in a helper before saving to DB.
- Always parse and validate before using data in services.

Example pattern:
```ts
const userData = userSchema.parse(req.body);
```

---

## 🧰 Database Layer

- ORM: **Prisma v6**  
- DB: **PostgreSQL**  
- Keep all Prisma queries in `repositories/` files.
- Use `findUnique`, `findMany`, `create`, `update`, `delete` with clear types.
- Handle transactions using `prisma.$transaction`.
- Prefer returning plain objects, not Prisma models directly.

---

## 🧾 Documentation & Comments

- Document public functions and endpoints with **JSDoc**.
- For API docs, use **Swagger (OpenAPI 3.1)** via `swagger-ui-express` and `swagger-jsdoc`.
- Each route file should export a router and include a short docstring.

Example:
```ts
/**
 * @route GET /users
 * @summary Get all users
 * @returns {User[]} 200 - List of users
 */
```

---

## 📦 Logging & Error Handling

- Use `pino` logger with JSON output.
- Log all requests via middleware (`src/middlewares/logger.ts`).
- Implement centralized `errorHandler` middleware that maps errors to HTTP codes.
- Use ZodError flattening for validation messages.

---

## 🧭 Routing Rules

- Group routes by resource (users, posts, etc.)
- Each `routes/*.ts` file mounts its controller handlers.
- Register all routes in `src/app.ts`.
- Always return consistent JSON structure.

Example:
```ts
router.post('/', controller.createUser);
```

---

## 🧠 Testing (optional but recommended)

- Use **Vitest** or **Jest** for unit tests.
- Test Zod schemas and services logic.
- Use in-memory Postgres or mocked Prisma for integration tests.

---

## 🧩 Additional Libraries

Recommended helpers:
- `zod-express-middleware` or custom middleware for validation
- `helmet` and `cors` for security
- `dotenv` for environment configuration
- `express-async-errors` to simplify error propagation
- `openapi-types` for Swagger typings
- `sanitize-html` or `validator` for input cleaning

---

## 🧠 Prompt Guidance for Copilot

When completing code:
- Follow this architecture and naming style.
- Suggest modular, reusable functions.
- Avoid redundant validation in multiple layers.
- Prefer composition over inheritance.
- Include full imports when generating new files.
- Use modern syntax (`??`, `?.`, array destructuring).
- Keep code concise but explicit.

---

## 🌐 Example folder pattern (for Copilot reference)

```
src/
 ├─ routes/
 │   └─ user.routes.ts
 ├─ controllers/
 │   └─ user.controller.ts
 ├─ services/
 │   └─ user.service.ts
 ├─ repositories/
 │   └─ user.repository.ts
 ├─ schemas/
 │   └─ user.schema.ts
 ├─ utils/
 │   ├─ logger.ts
 │   └─ sanitize.ts
 ├─ middlewares/
 │   ├─ validate.ts
 │   ├─ errorHandler.ts
 │   └─ logger.ts
 └─ app.ts
```

---

## 🚀 Example behavior

When generating:
- `routes`: Only call controller functions.
- `controllers`: Parse input with Zod, call service, return JSON.
- `services`: Business logic; call repositories.
- `repositories`: Direct Prisma access.
- `schemas`: Define Zod objects for data validation.
- `middlewares`: Handle validation, logging, and errors.
- `markdown`: follow project functionality and current doc content to propose next content.

---
