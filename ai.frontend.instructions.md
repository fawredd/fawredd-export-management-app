---
applyTo: '**/frontend/'
---

### 🤖 AI Assistant Frontend Guidelines

You are an expert Frontend Engineer. When providing code, suggestions, or refactors, you **MUST** adhere to the following stack and principles.

---

### 1. Core Technology Stack

* **Framework:** Next.js v15 (App Router by default)
* **Library:** React v19 (Functional Components, Hooks, `useActionState`, `useOptimistic`)
* **Language:** TypeScript (Strict mode)
* **Styling:** Tailwind v4 (Utility-first, responsive)
* **Validation:** Zod
* **Data Fetching:** Tanstack Query v5 (`useQuery`, `useMutation`)
* **Tables:** Tanstack Table v8 (Headless, component-based)
* **Forms:** Tanstack Form

---

### 2. Guiding Principles

* **SOLID:**
    * **SRP:** Components must have a Single Responsibility. Create smaller, composable components. Encapsulate complex logic in custom hooks (`use...`).
    * **OCP:** Components should be open to extension (via props, composition) but closed for modification.
    * **DIP:** High-level components should not depend on low-level details. Use React Context or prop drilling for dependency injection.
* **Security:**
    * **Validation:** All user input (forms) **MUST** be validated with **Zod**.
    * **Server Actions:** Use Next.js Server Actions for all mutations. Validate data *inside* the Server Action using Zod before any database/API call.
    * **XSS:** Avoid `dangerouslySetInnerHTML`. React handles most escaping by default.
* **Best Practices:**
    * **"Server First":** Components should be Server Components by default. Only use `'use client'` when absolutely necessary (e.g., for hooks, event listeners).
    * **TypeScript:** **NO `any`**. Use explicit types for props, state, and API responses. Infer types from Zod schemas wherever possible.
    * **Error Handling:** Implement Error Boundaries. `useQuery` and `useMutation` must have `isPending`, `isError`, and `error` states handled in the JSX.
    * **Accessibility (a11y):** Use semantic HTML (`<button>`, `<nav>`). All interactive elements must be keyboard-accessible and have ARIA attributes.
    * **Performance:** Use React 19 features. Data fetching should *always* be done with Tanstack Query for caching, not with `useEffect`.
    * **NEXT.JS** Always try to user SSR, ISR over CSR. Middleware always manages auth. Prevent security risks on client side. 
    * **AUTH** In auth flow, http only cookies should be used. in frontend server should handle auth, not client side. neither localstorage nor coockie storage should be used for auth. Cookie usage should only be used for user data to be shown to the user in frontend. this is modern auth implementation. 

---

### 3. Technology-Specific Rules

* **React v19 / Next.js v15:**
    * Use Server Actions for mutations. Bind them to forms and use `useActionState` to handle pending/error/success states.
    * Use `useOptimistic` for forms that need an immediate UI update.
    * Use file-based routing with the App Router (`/app`).
    * Use `loading.tsx` and `error.tsx` conventions for streaming and error handling.
* **Zod:**
    * Define a Zod schema for *all* data structures:
        1.  API response validation.
        2.  Form validation (e.g., with `react-hook-form`).
        3.  Server Action input validation.
    * Infer TS types from schemas: `type TMyForm = z.infer<typeof myFormSchema>;`
* **Tanstack Query v5:**
    * All data fetching (`GET`) **MUST** use `useQuery`.
    * All data mutations (`POST`, `PUT`, `DELETE`) that are *not* Server Actions **MUST** use `useMutation`.
    * Query Keys **MUST** be managed in a structured way (e.g., `['todos', 'list']`, `['todos', 'detail', id]`).
    * Use `queryClient.invalidateQueries` in `onSuccess` handlers for mutations to refetch data.
* **Tanstack Table v8:**
    * Use the `useReactTable` hook.
    * Define columns using `createColumnHelper`.
    * Render the table using headless UI: `flexRender` for headers, cells, and footers.
    * Components should be composable (e.g., create a reusable `<DataTable>` component).
* **Tailwind v4:**
    * **Utility-First:** Do not write custom CSS files. Style elements directly with utilities.
    * **Responsive:** Use responsive prefixes (`sm:`, `md:`, `lg:`) for all layouts.
    * **Dark Mode:** Implement dark mode using the `dark:` variant.