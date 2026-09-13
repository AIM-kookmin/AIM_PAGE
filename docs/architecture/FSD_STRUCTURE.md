# FSD and Next.js App Router

The app uses Next.js 14 App Router and is gradually adopting Feature-Sliced Design.
Route files live only in `frontend/src/app`. Do not create `src/pages` for FSD page
components: Next.js interprets that directory as the separate Pages Router.

## Current structure

```text
frontend/src/
├── app/                       # Routes, layouts, metadata, error boundaries
│   ├── (public)/               # Public navigation and smooth scroll
│   │   ├── page.tsx            # /
│   │   ├── about/              # /about
│   │   ├── members/            # /members
│   │   ├── activities/         # /activities
│   │   ├── studies/[id]/       # /studies and published post detail
│   │   ├── news/               # /news
│   │   ├── recruit/            # /recruit
│   │   ├── login/              # /login
│   │   ├── register/           # /register
│   │   ├── pending/            # /pending (authenticated)
│   │   └── profile/            # /profile (approved member)
│   ├── admin/                  # Server-checked admin layout and CRUD routes
│   ├── auth/callback/          # OAuth code exchange
│   └── api/                    # Member admin and storage redirect handlers
├── widgets/                   # Composed UI: public navigation, hero, news
├── entities/                  # member and news domain slices
├── shared/
│   ├── api/supabase/           # Browser/server clients and legacy data access
│   ├── config/                # Public application constants
│   ├── hooks/                 # Shared hooks
│   ├── lib/                   # Pure utilities
│   ├── providers/             # Shared authentication state
│   └── ui/                    # Generic UI, notifications, error presentation
├── types/                     # Database contracts (legacy shared types)
└── middleware.ts              # Session refresh and protected route routing
```

`features/` is a future home for extracted user interactions, not a requirement
to introduce empty folders. Existing `*Client.tsx` files and route-local form
components can stay beside their route until a concrete reuse justifies extraction.

## Dependency and runtime boundaries

- `app` composes `widgets`, `features`, `entities`, and `shared`.
- `widgets` may use `features`, `entities`, and `shared`.
- `features` may use `entities` and `shared`.
- `entities` may use `shared`. The current database contracts remain in `types`.
- `shared` does not import application routes, widgets, features, or entities.
- Shared UI must not import components from another route. For example, admin
  notifications live in `shared/ui/Notification.tsx`.

Use a slice's `index.ts` for browser-safe exports. Keep server-only exports in a
separate `server.ts`, e.g. `@/entities/news/server`. Modules that read cookies or
service-role credentials import `server-only`; never re-export them through a
client barrel. Next.js enforces this boundary at build time.

Public data pages use server components for loading and client components for
interaction. The shared auth provider maintains session/UI state; middleware,
the OAuth callback, and auth pages own redirects. Admin layout/API checks and
Supabase RLS remain the authority for access.

The cookie-aware server client makes these data pages dynamic. `revalidate = 60`
alone does not turn them into static ISR pages. Introducing anonymous cached data
clients is a separate change requiring checks for privacy and cache invalidation.

## Slice example

```text
entities/news/
├── api/queries.ts              # Browser operations
├── api/queries.server.ts       # Server operations
├── model/types.ts
├── index.ts                    # Browser-safe public API
└── server.ts                   # Server-only public API
```

Use PascalCase for React components and camelCase for hooks and utilities.
Keep existing slice naming consistent and prefer named exports, except Next.js
route conventions. Build outputs such as `.next` and `*.tsbuildinfo` stay untracked.

See [the structural review](../reviews/2026-09-13-project-structure.md) for the
route map, fixes, verification, and remaining migration work.
