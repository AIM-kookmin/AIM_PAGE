# AGENTS.md - AI Coding Agent Instructions

## 📁 Project Structure & Documentation
- **Root**: `AGENTS.md` (This file)
- **Docs**: `docs/`
  - `plans/`: Migration plans & feature specs
  - `guides/`: Developer guides (Deployment, Config)
  - `architecture/`: Architecture decisions (FSD, Database)
- **Frontend**: `frontend/` (Next.js 14)
- **Backend**: Supabase; the legacy `backend/` directory has been removed.

## 🏗️ Architecture (FSD + Supabase)
- **Pattern**: Feature-Sliced Design (See `docs/architecture/FSD_STRUCTURE.md`)
- **Database**: Supabase PostgreSQL (See `docs/plans/SUPABASE_MIGRATION.md`)
- **Auth**: Supabase Auth (Replacing JWT)
- **Storage**: Supabase Storage (Replacing S3)

## 💻 Commands
```bash
npm run dev              # Frontend (Next.js :3000)
npm run dev:frontend     # Frontend only (Next.js :3000)
npm run type-check       # Frontend TypeScript check
npm test                 # Frontend Jest tests
# In frontend/: npm run test:db runs isolated profile permission migration tests.
```

## 📝 Code Style
- **TypeScript**: Strict mode, interfaces over types for objects.
- **Imports**: Use FSD layer imports (e.g., `@/shared/ui/Button`).
- **Naming**: PascalCase for components, camelCase for logic.
- **Comments**: Korean comments allowed. JSDoc for exports.

## 🚀 Key Files for Context
- `frontend/src/shared/api/supabase/client.ts` - Browser Supabase client
- `frontend/src/shared/api/supabase/server.ts` - Request-scoped server Supabase client
- `docs/architecture/FSD_STRUCTURE.md` - Folder structure rules
- `docs/plans/SUPABASE_MIGRATION.md` - Migration roadmap
