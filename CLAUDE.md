# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Angular 21 standalone SPA frontend for a "Libro de Clases Digital" (digital school gradebook/attendance system). It is the UI layer for a microservices ecosystem it does not own:

- `MS Gestion escolar` — Java Spring Boot
- `MS Autenticacion y autorizacion` — Node.js + Express
- `MS Asistencia y conducta` — Node.js + Express
- `MS Mensajeria` — Node.js + Express
- `BFF` — Node.js + Express

All HTTP calls go through a single API gateway base URL defined in `src/environments/environment.ts` (`environment.apiGw`).

## Commands

Package manager is in transition from npm to **pnpm** (`pnpm-lock.yaml` / `pnpm-workspace.yaml` were just added, `package-lock.json` removed, `packageManager` field dropped from `package.json`). Prefer `pnpm` for new work unless told otherwise; both will currently work since `package.json` scripts are package-manager-agnostic.

```bash
pnpm install          # install deps
pnpm start            # ng serve, http://localhost:4200 (alias: pnpm run dev)
pnpm run build        # production build -> dist/frontend/browser/
pnpm run watch        # dev build, watch mode
pnpm test             # ng test — runs unit tests via @angular/build:unit-test (Vitest under the hood, jsdom)
```

To run a single test file or a subset, pass args through to the underlying test runner, e.g.:
```bash
pnpm test -- --project=frontend --testPathPattern=matricula.page.spec.ts
```
(Check `ng test --help` if the exact filter flag doesn't match, since this uses Angular's newer Vitest-based unit-test builder rather than Karma.)

There is no lint script defined in `package.json`. Formatting is via Prettier (`.prettierrc`: single quotes, 100 print width, Angular parser for `.html`).

Cypress e2e tests and `cypress.config.ts` were removed from the repo (see current git status) — do not add new Cypress specs or re-introduce the `cypress` dependency unless explicitly asked; component-level specs (`*.spec.ts` next to the component) are the current testing convention.

CI (`.github/workflows/ci.yml`) runs on push to `master`: `npm install` + `npm run build`, then FTP-deploys `dist/frontend/browser/` straight to a cPanel host. There is no test or lint gate in CI — build success is the only check before deploy.

## Architecture

Feature-first, standalone-components Angular app, structured closer to **MVVM** than MVC:

- **View** — `.html` templates + standalone components.
- **ViewModel** — component `.ts` classes, `stores`, `queries`, `mutations` (state prep for the UI).
- **Model** — `models/` (typed DTOs/entities) and the API layer.

### Directory layout

```
src/app/
  core/            # guards, interceptors, cross-cutting services/utils (no feature knowledge)
  layout/
  shared/          # reusable components, http helpers (error normalization/snackbar), shared pages
  features/
    landing/ auth/ admin/ docente/ estudiante/ comunicaciones/ matriculas/
```

Each feature follows the same internal shape:

```
feature/
  data-access/
    *.api.ts          # HttpClient calls only, returns Promise via firstValueFrom
    *.keys.ts          # TanStack Query key factories (hierarchical: all() -> resource() -> byX())
    *.queries.ts        # queryOptions() wrappers around the api
    *.mutations.ts      # mutationOptions() wrappers; invalidate related query keys onSuccess
    *.store.ts          # local reactive state via signals (e.g. AuthStore), when a feature needs it
  models/            # request/response DTOs and domain types
  pages/             # route-level components (folder-per-page: `*.page.component/`)
  sections/          # composed UI blocks reused within a feature (navbar, toolbar, etc.)
  *.routes.ts        # lazy-loaded route definitions for the feature
```

When adding a new API-backed feature, follow this exact split rather than putting HTTP calls or query logic directly in components.

### Data fetching: TanStack Angular Query

`provideTanStackQuery` is configured once in `app.config.ts` with `staleTime: 5m`, `gcTime: 10m`, `retry: 1` for queries and `retry: 0` for mutations. Query keys are hierarchical factories per feature (see `evaluations.keys.ts` for the pattern: `all -> resource() -> byX(id)`), used both for fetching and for targeted `invalidateQueries` calls in mutations — cross-feature invalidation is normal (e.g. `EvaluationsMutations` invalidates `estudianteKeys.notas(id)` after saving grades).

### Routing, auth and role-based access

- `app.routes.ts` is the single source of top-level routes; each feature module is lazy-loaded via `loadChildren`/`loadComponent`.
- Protected routes carry `canActivate: [authGuard]` plus `data: { roles: [...] }` (role names: `Administrador`, `Docente`, `Estudiante`, and `Apoderado` for account/profile-only areas).
- `authGuard` (`core/guards/auth.guard.ts`) checks `AuthStore.accessToken()`, then calls `queryClient.ensureQueryData(authQuery.me())` to resolve the current user/role, and redirects to `/no-access` or `/auth/login` on failure/role mismatch. Role matching goes through `core/utils/access-control.ts` (`normalizeRole`, `isRoleAllowed`, `getHomeRouteForRole`) — role strings from the backend are normalized (case-insensitive substring match), not compared exactly.
- `authInterceptor` (`core/interceptors/auth.interceptor.ts`) reads the JWT from `localStorage` (`token` key) and attaches it as `Authorization: Bearer <token>` on every request.
- `AuthStore` (`features/auth/data-access/auth.store.ts`) is the single signal-based source of truth for the token; `clearSession()` also clears the TanStack `QueryClient` cache, not just `localStorage`.

### Payments (matriculas feature)

`features/matriculas` implements enrollment + Webpay (Transbank) payment initiation: it POSTs form data to the BFF, stores form state in `sessionStorage` (to survive the redirect), then does a client-side form `submit()` to the Webpay URL/token returned by the backend. `webpay-return.component.ts` handles the return leg. When touching this flow, preserve the sessionStorage round-trip since the browser fully navigates away during payment.

### Internationalization / locale

App-wide locale is forced to `es` (`LOCALE_ID: 'es'`, `registerLocaleData(localeEs)` in `app.config.ts`).

### Styling

Tailwind CSS 4 (via `@tailwindcss/postcss`) alongside Angular Material with a custom theme (`src/material-theme.scss`) and global `src/styles.css`. Component-scoped styles use the paired `.css` file per component (folder-per-component convention: `xxx.component/xxx.component.ts|.html|.css`).

## Consideraciones

- Todos los componentes de angular material se dejan intactos
- utilizar engram en todo momento
- las respuestas siempre estara en español
-
