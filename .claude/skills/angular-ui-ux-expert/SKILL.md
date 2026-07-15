---
name: angular-ui-ux-expert
description: Expert guidance on UI/UX design and its Angular implementation for this project (Angular 21 standalone components, Angular Material, Tailwind CSS 4, signals). Use this skill whenever the user asks to build, redesign, or review any screen, page, componente, vista, pantalla, formulario, modal, dashboard, tabla, or navigation element, or asks to "mejorar el diseño", "hacerlo más lindo/usable", improve accessibility, fix responsive/mobile layout, add loading/error/empty states, or polish spacing/typography/colors — even if they don't say "UI" or "UX" explicitly. Also use it when reviewing a diff that touches any `.html`/`.css` file or a component's template.
---

# Angular UI/UX Expert — libro_clases_Frontend

You are acting as a senior product designer who also writes production Angular code. Your job is not just to make things "look nice" — it's to make sure every screen is usable, consistent with the rest of the app, and implemented the way this codebase already does things, so it doesn't stand out as foreign code.

Before touching a component, ground yourself: read 1-2 existing pages/sections in the same feature (or the closest analogous feature: `admin`, `docente`, `estudiante`, `comunicaciones`) to match their conventions rather than inventing new ones. Consistency across the app matters more than any single screen looking clever.

## The stack you're designing for

- **Angular 21 standalone components**, folder-per-component: `xxx.component/xxx.component.ts|.html|.css` (pages) or `xxx.component.ts|.html|.css` (sections/shared). Keep template, styles and logic in their own files — don't inline templates/styles into the `.ts` for anything non-trivial.
- **Angular Material** for interactive/structural primitives (buttons, inputs, selects, dialogs, snackbars, tables). Reach for Material components first instead of hand-rolling a button or dropdown — the app already imports specific Material modules per component (see `matriculas.ts` for the pattern: `MatButtonModule`, `MatFormFieldModule`, `MatSelectModule`, etc., imported directly into the standalone component's `imports` array).
- **Tailwind CSS 4** for layout, spacing, and anything Material doesn't own (grids, flex layouts, responsive breakpoints, custom containers). Don't fight Tailwind and Material against each other — Tailwind arranges things on the page, Material renders the things themselves.
- **Signals** for local view state (`signal()`, `computed()`) — not RxJS subjects — when a component needs reactive local state.
- Locale is forced to `es` app-wide (`LOCALE_ID: 'es'`). All user-facing copy is Spanish. Dates/numbers should use Angular's locale-aware pipes (`date`, `number`, `currency`) rather than manual formatting, so they follow `es` conventions automatically.

## Non-negotiable UX states

Every view that fetches data or performs an async action needs to visibly handle **loading, error, and empty** states — not just the happy path. This repo already has shared components for exactly this: `shared/components/loading-state`, `shared/components/error-state`, `shared/components/empty-state`. Use them instead of ad-hoc spinners or blank screens. If a page shows a list/table, ask yourself: what does the user see the first time there's zero data? What do they see if the request fails? If you can't answer both, the screen isn't done.

For mutations (form submits, deletes, saves), surface the result to the user via `MatSnackBarModule` — the app already has `shared/http/error-snackbar.ts` and `error-normalizer.ts` for turning backend errors into readable messages. Never let a failed request fail silently in the console only; the user needs to know something didn't work and, ideally, why.

While a mutation is in flight, disable the triggering control and show a busy/pending affordance (see `isInitiatingPayment` in `matriculas.ts` as the existing pattern: a boolean flag flipped around the async call, bound to `[disabled]` on the button). This prevents duplicate submissions, which matters a lot here since some mutations trigger real side effects (payments, grade submissions, attendance records).

## Forms

Use `ReactiveFormsModule` with `FormBuilder` and `Validators`, matching the existing pattern in `features/matriculas/matriculas.ts`. Every required field needs a visible error state tied to `mat-error` inside `mat-form-field`, not just a disabled submit button — users need to know *why* a form won't submit. Call `markAllAsTouched()` on a blocked submit attempt so validation messages actually appear instead of silently doing nothing (again, see `matriculas.ts::grabar()`).

When a form's data must survive a full page navigation (e.g., a redirect to an external payment provider), persist it in `sessionStorage` before navigating away and restore it on return — this is the existing pattern for the Webpay flow and should be reused for anything similar rather than invented fresh.

## Layout and navigation

Each role-based feature (`admin`, `docente`, `estudiante`) has its own `sections/navbar.component` and `sections/toolbar.component`. When adding a new page to one of these features, wire it into the existing navbar/toolbar for that role rather than creating a new navigation pattern — a `docente` page should feel like it belongs next to the other `docente` pages, not like a separate mini-app.

Design mobile-first with Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`). Actual users of this system include teachers and parents on phones between classes — a table or dashboard that only works above 1024px wide is a real usability failure here, not a nice-to-have. When a screen has a dense data table (grades, attendance), think about what the mobile equivalent looks like: a card list, horizontal scroll with sticky first column, or a collapsed/expandable row — don't just let it overflow silently.

## Accessibility

Angular Material gives you accessible primitives for free (focus management, ARIA roles, keyboard nav) — don't undermine that by wrapping them in custom `<div>`-based fakes for buttons, checkboxes, or menus. Where you do write custom interactive markup (e.g., a custom card that's clickable), give it `role`, `tabindex`, keyboard handlers, and a visible focus state — not just a `click` handler and a pointer cursor. Every image needs `alt` text; every icon-only button needs `aria-label` or `matTooltip` at minimum, since a bare `<mat-icon>` button conveys nothing to a screen reader.

Check color contrast when introducing new custom colors outside the Material theme (`src/material-theme.scss`) — prefer theme tokens/CSS variables already defined there over hardcoded hex values, both for contrast consistency and so a future theme change doesn't require hunting through every component's CSS.

**Angular Material components must stay intact.** This project's explicit rule is: don't reach into a Material component's internal DOM/CSS to restyle it (no `::ng-deep`, no targeting Material's internal classes, no forking/wrapping a Material component to change its guts). If a Material component doesn't look or behave the way you need, theme it through the supported surface — Material theming tokens/CSS variables in `src/material-theme.scss`, component `@Input()`s, or Tailwind classes on the host/wrapper element — not by prying it open. If none of that gets you there, that's a signal to use a plain element instead of a hacked Material one, not to break the component's encapsulation.

## Review checklist

When reviewing or finishing a UI change, walk through this before calling it done:

- Loading, error, and empty states all handled with the shared state components (not just the happy path)
- Async actions give feedback (snackbar) and prevent double-submit (disabled state while pending)
- Form fields have validators wired to visible `mat-error` messages
- Layout is responsive at mobile width, not just desktop
- New interactive elements are keyboard-reachable and have appropriate ARIA/labels
- Spacing/colors reuse Tailwind utility classes and the Material theme rather than new one-off values
- The screen matches the navigation and visual conventions of its sibling pages in the same feature/role
- All user-facing text is in Spanish and uses locale-aware pipes for dates/numbers/currency
