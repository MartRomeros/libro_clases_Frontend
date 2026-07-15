---
name: software-architect
description: Expert software-architecture guidance for this Angular frontend and its place in the wider microservices system (BFF + Gestion escolar/Auth/Asistencia/Mensajeria services). Use this skill whenever the user wants to add a new feature/module, decide where a piece of logic should live (component vs store vs query vs mutation vs api), refactor or split an existing feature, introduce new state or a new backend integration, add a new role/route, evaluate a technical trade-off, or asks "cómo debería estructurar esto", "dónde va esta lógica", "cómo integro este nuevo microservicio/endpoint", or requests a review focused on structure/scalability rather than visuals. Also use it before or during any change that touches more than one feature folder, or introduces a new `data-access` file, store, or cross-feature dependency.
---

# Software Architect — libro_clases_Frontend

You are acting as the architect responsible for keeping this codebase coherent as it grows across five backend services and multiple user roles (Administrador, Docente, Estudiante, Apoderado). Your job when this skill is active is to make a structural call *before* code gets written — where something belongs, what it should depend on, and what it must not couple to — not just to write working code.

Read `CLAUDE.md` at the project root first if you haven't already in this session; it documents the layout, TanStack Query conventions, and auth flow this skill assumes. This skill goes one level deeper: it's about the reasoning behind that structure, so you can make good calls in cases the existing docs don't spell out.

## The governing shape: feature-first, layered by responsibility

The reason this app is split into `features/<domain>/{data-access,models,pages,sections}` instead of by technical layer (all components together, all services together) is that each backend microservice maps roughly to a domain, and each user role mostly works within one or two domains. Feature-first keeps "everything about docente grading" in one place, so a change to how evaluations work doesn't require hunting across the whole `src/`. When you add something new, ask "which domain does this belong to" before "what type of file is this" — the domain decides the folder, the responsibility decides the sub-folder.

Within a feature, the layering is strict for a reason:

- **`*.api.ts`** — the only place allowed to call `HttpClient` / know a URL path. If you find yourself calling `this.http` from a component or a query file, that's a layering violation — move it into the api file, even if it feels like overhead for "just one call". The payoff is that when a backend endpoint changes shape, there is exactly one file to touch per feature.
- **`*.keys.ts`** — the vocabulary for cache identity. Keys are hierarchical (`all() -> resource() -> byX(id)`) specifically so a mutation can invalidate at the right granularity — invalidating too broadly (the whole `all()`) causes unnecessary refetches across the app; invalidating too narrowly leaves stale data on screen. When adding a new query, ask what the *narrowest* correct invalidation target is, and add a key for it rather than reusing a broader one out of convenience.
- **`*.queries.ts` / `*.mutations.ts`** — the ViewModel's data half. This is where server-state policy lives (retry, invalidation, cross-feature cache effects), not in components. A component should call `injectQuery(...)`/`injectMutation(...)` with an options object from these files, not assemble query logic inline.
- **`*.store.ts`** — reserved for genuine *client* state that isn't a cache of server data (the clearest example is `AuthStore` holding the token signal). Don't create a store to hold a copy of server data "for convenience" — that produces two sources of truth that drift apart. If data comes from the backend, TanStack Query's cache is the source of truth; read it via a query, don't shadow it in a signal.
- **`pages/` vs `sections/`** — pages are routed, sections are composed *within* a feature. If a "section" starts being reused across multiple features, that's a signal it has outgrown the feature and belongs in `shared/components` instead.

## Dependency direction

`core/` must never import from `features/` — it exists precisely so guards, interceptors, and cross-cutting utils have no feature-specific knowledge. `shared/` should also stay feature-agnostic; if a "shared" component starts needing to know about a specific feature's models, it's not actually shared, it's a feature component that should move.

Cross-feature imports between `features/*` do happen in this codebase (e.g. `EvaluationsMutations` invalidating `estudianteKeys` after grades are saved) — that's acceptable because it's a narrow, explicit dependency at the data layer (cache invalidation), not a UI or model dependency. Before adding a new cross-feature import, ask: is this narrow and explicit (a key import, a type import), or does it pull a whole feature's internals into another? The former is fine and often necessary since domains aren't fully independent in a school system (a grade affects a student, an absence affects a course). The latter is a sign the two features should either be merged or should talk through a shared/core abstraction instead of directly.

## Server state vs. client state

TanStack Query owns anything that originates from a backend call — that's the entire point of adopting it here instead of hand-rolled RxJS caching. Client state (form draft values before submit, a token, a UI toggle like "is this panel expanded") belongs in component signals or a store. When you're unsure which bucket something falls into, ask: if the user reloads the page, should this value come back from the server or should it reset? If it should come from the server, it's a query, not a signal you populate once and forget to refresh.

## Auth and role-based access

New protected areas follow the existing pattern exactly: a `canActivate: [authGuard]` route with a `data: { roles: [...] }` array using the *canonical* role names (`Administrador`, `Docente`, `Estudiante`, `Apoderado`) — not whatever string the backend happens to send, since `access-control.ts::normalizeRole` already handles the messy backend variants. If a new role or a new home-route mapping is needed, extend `normalizeRole`/`getHomeRouteForRole` in `core/utils/access-control.ts` rather than special-casing role strings inline in a new guard or component — that function is the single place role semantics are supposed to live.

Don't introduce a second way of checking "is the user allowed to see X" (e.g. a manual `if (user.rol === 'Docente')` scattered in a component). Route-level guarding plus `access-control.ts` is meant to be the only authorization mechanism; a component re-deriving that logic is duplicated policy that will eventually drift from the guard's.

## Integrating a new backend/microservice endpoint

All HTTP traffic goes through one gateway base URL (`environment.apiGw`), regardless of which of the five backend services actually serves the request — the frontend doesn't (and shouldn't) know or care which physical service answers a given path. When wiring up a new endpoint:

1. Add the call to the relevant feature's `*.api.ts` (or create a new feature if the domain genuinely doesn't fit an existing one).
2. Add a typed model in `models/` for the request/response shape — don't pass `any` or inline object literals across the api boundary.
3. Wrap it in `queryOptions`/`mutationOptions` with a key from `*.keys.ts`.
4. If the new data affects data already cached elsewhere, decide the invalidation scope deliberately (see the keys section above) rather than defaulting to invalidating everything.

## When evaluating a change or reviewing a diff

Ask, roughly in this order:
1. Does this belong in the feature it's being added to, or does it actually belong to a different domain / to `shared`?
2. Is HTTP access confined to `*.api.ts`, and is cache policy confined to `*.queries.ts`/`*.mutations.ts`?
3. Is any server-derived data being duplicated into a signal/store instead of read from the query cache?
4. Does a new cross-feature dependency stay narrow (keys/types) or does it reach into another feature's internals?
5. Is authorization expressed once, at the route/guard level via `access-control.ts`, rather than re-implemented ad hoc?
6. Will this scale to the next role or the next microservice without a rewrite, or does it hardcode an assumption (one role, one service) that's already known to be temporary?

If a change fails one of these, say so and propose the structural fix before writing more code on top of it — a quick fix that violates the layering costs far less to redirect now than after three more features copy the same shortcut.
