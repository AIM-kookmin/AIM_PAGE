# FSD (Feature-Sliced Design) Architecture Guide

This project is migrating to FSD architecture. This document defines the folder structure and rules for the `frontend/` directory.

## 1. Directory Structure

\`\`\`
frontend/src/
├── app/                  # Application Layer
│   ├── layouts/          # Root layouts
│   ├── providers/        # Global context providers
│   └── styles/           # Global styles (Tailwind, CSS)
│
├── pages/                # Pages Layer (Routing)
│   ├── home/             # HomePage (composition of widgets)
│   ├── login/            # LoginPage
│   └── ...               # (Next.js App Router structure mirrors this)
│
├── widgets/              # Widgets Layer (Standalone UI blocks)
│   ├── Header/           # Global Header
│   ├── Footer/           # Global Footer
│   ├── PostList/         # List of posts with filters
│   └── ...
│
├── features/             # Features Layer (User Interactions)
│   ├── AuthByEmail/      # Login/Register logic
│   ├── AuthBySocial/     # Google/Kakao login
│   ├── WritePost/        # Post creation form
│   ├── LikePost/         # Like button with optimistic UI
│   └── ...
│
├── entities/             # Entities Layer (Business Domain)
│   ├── User/             # User model, types, UI (Avatar)
│   ├── Post/             # Post model, types, UI (PostCard)
│   ├── Tag/              # Tag model
│   └── ...
│
└── shared/               # Shared Layer (Reusable Atoms)
    ├── api/              # Supabase client, queries
    ├── config/           # Env vars, constants
    ├── lib/              # Utility functions
    └── ui/               # Generic UI Kit (Button, Input, Modal)
\`\`\`

## 2. Layer Rules (Dependency Rule)

**Can only import from layers BELOW.**

- ✅ `pages` -> `widgets`, `features`, `entities`, `shared`
- ✅ `widgets` -> `features`, `entities`, `shared`
- ✅ `features` -> `entities`, `shared`
- ✅ `entities` -> `shared`
- ❌ `shared` -> CANNOT import from anywhere
- ❌ `features` -> CANNOT import from `widgets`

## 3. Slice Structure (Internal)

Each slice (e.g., `features/AuthByEmail`) should follow this structure:

\`\`\`
features/AuthByEmail/
├── ui/                   # UI Components (LoginForm.tsx)
├── model/                # State, Hooks, Logic (useLogin.ts)
├── api/                  # API requests (optional, usually in shared/api)
└── index.ts              # Public API (Export ONLY what's needed)
\`\`\`

## 4. Migration Strategy

1. **Shared First**: Move `components/ui` -> `shared/ui`, `lib/*` -> `shared/lib`.
2. **Entities**: Identify core domain objects (User, Post) and move types/components.
3. **Features**: Isolate interactive logic (Forms, Buttons).
4. **Widgets**: Group features into big blocks.
5. **Pages**: Refactor `app/*` pages to simply compose Widgets.

## 5. Naming Conventions

- **Folders**: PascalCase for UI slices (`AuthByEmail`), camelCase for generic logic.
- **Files**: PascalCase for Components (`LoginForm.tsx`), camelCase for hooks/utils (`useLogin.ts`).
- **Exports**: Named exports preferred over default exports.

