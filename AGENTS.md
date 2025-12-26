# AGENTS.md - AI Coding Agent Instructions

## 📁 Project Structure & Documentation
- **Root**: `AGENTS.md` (This file)
- **Docs**: `docs/`
  - `plans/`: Migration plans & feature specs
  - `guides/`: Developer guides (Deployment, Config)
  - `architecture/`: Architecture decisions (FSD, Database)
- **Frontend**: `frontend/` (Next.js 14)
- **Backend**: `backend/` (Deprecated, migrating to Supabase)

## 🏗️ Architecture (FSD + Supabase)
- **Pattern**: Feature-Sliced Design (See `docs/architecture/FSD_STRUCTURE.md`)
- **Database**: Supabase PostgreSQL (See `docs/plans/SUPABASE_MIGRATION.md`)
- **Auth**: Supabase Auth (Replacing JWT)
- **Storage**: Supabase Storage (Replacing S3)

## 💻 Commands
```bash
npm run dev              # Run frontend + backend
npm run dev:frontend     # Frontend only (Next.js :3000)
# Backend commands are deprecated but available for reference
```

## 📝 Code Style
- **TypeScript**: Strict mode, interfaces over types for objects.
- **Imports**: Use FSD layer imports (e.g., `@/shared/ui/Button`).
- **Naming**: PascalCase for components, camelCase for logic.
- **Comments**: Korean comments allowed. JSDoc for exports.

## 🚀 Key Files for Context
- `frontend/lib/supabase/client.ts` - Supabase client (to be created)
- `docs/architecture/FSD_STRUCTURE.md` - Folder structure rules
- `docs/plans/SUPABASE_MIGRATION.md` - Migration roadmap
