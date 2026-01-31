# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIM (AI Monsters) is a Korean university AI club website built with Next.js 14, Supabase, and Feature-Sliced Design (FSD) architecture. The project uses a dual-environment deployment workflow with separate dev and production environments.

## Git & Deployment Workflow

### Branch Strategy
```
origin/dev → fork/dev → fork/prod
  (개발)      (Preview)   (Production)
```

**Important:** This project uses TWO repositories:
- **origin** (`JoonSimJoon/AIM_PAGE`): Primary development repository
- **fork** (`AIM-kookmin/AIM_PAGE`): Deployment repository connected to Vercel

### Git Remotes

The `origin` remote is configured to push to BOTH repositories simultaneously:

```bash
origin  https://github.com/JoonSimJoon/AIM_PAGE.git (fetch)
origin  https://github.com/JoonSimJoon/AIM_PAGE.git (push)
origin  https://github.com/AIM-kookmin/AIM_PAGE.git (push)
fork    https://github.com/AIM-kookmin/AIM_PAGE.git (fetch/push)
```

**Setup (already configured):**
```bash
git remote set-url --add --push origin https://github.com/JoonSimJoon/AIM_PAGE.git
git remote set-url --add --push origin https://github.com/AIM-kookmin/AIM_PAGE.git
```

### Development Workflow

**Simple workflow - one push to both repos:**

1. Work on `dev` branch
2. Commit changes
3. Push to origin (automatically pushes to BOTH repos):
   ```bash
   git push origin dev
   ```
4. Preview deployment triggers automatically on `fork/dev` (Vercel)
5. Create PR from `fork/dev` → `fork/prod` for production deployment

### Deployment Environments

| Branch | Environment | Supabase | Domain |
|--------|-------------|----------|--------|
| `dev` | Preview | aim-dev | Preview URL |
| `prod` | Production | aim-prod | aim-kookmin.com |

## Development Commands

All commands must be run from the `frontend/` directory:

```bash
# Install dependencies
cd frontend
npm install

# Development server
npm run dev          # Starts on http://localhost:3000

# Build (production)
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Environment Variables

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
```

**Note:** Different Supabase projects for dev and prod environments.

## Architecture: Feature-Sliced Design (FSD)

The codebase follows FSD architecture with strict layer dependencies.

### Directory Structure

```
frontend/src/
├── app/                  # Next.js App Router + global layouts
│   ├── (public)/         # Public pages (/, /about, /members, etc.)
│   ├── admin/            # Admin dashboard pages
│   └── providers/        # Context providers
├── widgets/              # Standalone UI blocks (Header, Footer, Hero)
├── features/             # User interactions (AuthByEmail, WritePost)
├── entities/             # Business domain (User, Post, Member)
├── shared/               # Reusable atoms
│   ├── api/              # Supabase client
│   ├── lib/              # Utilities
│   └── ui/               # Generic UI components
└── types/                # TypeScript types
```

### Layer Dependency Rules

**Can only import from layers BELOW:**
- ✅ `app` → `widgets`, `features`, `entities`, `shared`
- ✅ `widgets` → `features`, `entities`, `shared`
- ✅ `features` → `entities`, `shared`
- ✅ `entities` → `shared`
- ❌ `shared` → CANNOT import from anywhere
- ❌ `features` → CANNOT import `widgets`

### Slice Structure

Each slice follows this internal structure:

```
features/AuthByEmail/
├── ui/                   # UI Components
├── model/                # State, Hooks, Logic
├── api/                  # API requests (optional)
└── index.ts              # Public API (exports only)
```

## Design System

### Theme
- **Primary Color**: Violet (`#8b5cf6`)
- **Background**: Pure black (`#000000`)
- **Style**: Dark mode, glassmorphism, subtle glow effects
- **Inspiration**: Linear.app, Vercel Dashboard

### Key Technologies
- **Tailwind CSS** with custom theme extensions
- **Framer Motion** for animations
- **GSAP** for advanced animations
- **Lenis** for smooth scrolling

### Custom Tailwind Extensions

Defined in `frontend/tailwind.config.ts`:

```tsx
// Glass card
"bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"

// Primary button
"bg-primary-500 hover:bg-primary-400 text-white rounded-xl hover:shadow-glow-primary"

// Text hierarchy
"text-white"           // Heading
"text-white/80"        // Body
"text-white/60"        // Muted

// Hover glow
"hover:text-primary-400 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]"
```

### Animation Classes
- `animate-fade-in`: 0.5s fade entrance
- `animate-slide-up`: 0.5s slide from bottom
- `animate-glow-pulse`: Infinite glow pulsing

### Design Anti-Patterns (DO NOT USE)
- Heavy blur animations (`animate-blob`, `blur-[100px]+`)
- Multiple conflicting accent colors
- Neon/oversaturated colors
- Gratuitous gradients

Full design system: `docs/design/DESIGN_SYSTEM.md`

## Database: Supabase

### Schema Management

Migrations are located in `supabase/migrations/`:
- `00001_about_recruit_tables.sql` - About/Recruit tables
- `00002_rls_policies.sql` - Row-level security
- `00003_members_table.sql` - Members table
- `00004_studies_activities_tables.sql` - Studies/Activities
- `00005_member_status.sql` - Member status fields

### Running Migrations

```bash
# Link to Supabase project
supabase link --project-ref [PROJECT_ID]

# Apply migrations
supabase db push

# Reset database (local dev)
supabase db reset
```

### Key Tables
- `members` - Club member profiles
- `about` - About page content
- `recruit` - Recruitment announcements
- `studies` - Study posts
- `activities` - Activity records

## Key Features

### Public Pages
- Main page (Hero, Activities, Members, Achievements)
- Member list with generation filters
- Activity and study records
- Recruitment announcements

### Authentication
- Google OAuth via Supabase Auth
- Approval-based membership system
- Profile management

### Admin Features
- Member approval/rejection
- Content management (About, Recruit, Studies, Activities)
- Dashboard analytics

## Important Files

| File | Purpose |
|------|---------|
| `frontend/src/app/layout.tsx` | Root layout with providers |
| `frontend/src/app/(public)/page.tsx` | Main landing page |
| `frontend/src/shared/api/supabase/client.ts` | Supabase client setup |
| `frontend/tailwind.config.ts` | Tailwind theme configuration |
| `frontend/src/app/globals.css` | Global CSS and variables |

## Common Development Tasks

### Development & Deployment

**Daily development:**
```bash
# Make changes, then:
git add .
git commit -m "feat: your changes"
git push origin dev  # Pushes to BOTH JoonSimJoon/AIM_PAGE and AIM-kookmin/AIM_PAGE
```

**Production deployment:**
1. Verify preview deployment works at fork/dev
2. Go to GitHub: `AIM-kookmin/AIM_PAGE`
3. Create PR: `dev` → `prod`
4. Merge PR
5. Vercel automatically deploys to production

### Adding New Pages
1. Create route in `frontend/src/app/(public)/[route]/page.tsx`
2. Compose using widgets from `frontend/src/widgets/`
3. Follow FSD dependency rules

### Creating Components
- **Reusable UI**: Add to `shared/ui/`
- **Business Logic**: Create in `entities/` or `features/`
- **Page Sections**: Create in `widgets/`

### Working with Supabase
```tsx
import { createClient } from '@/shared/api/supabase/client'

const supabase = createClient()
const { data, error } = await supabase
  .from('members')
  .select('*')
```

### Adding Animations
Use Framer Motion for scroll-triggered animations:

```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
  Content
</motion.div>
```

## Documentation

Comprehensive documentation is available in `docs/`:
- `docs/architecture/FSD_STRUCTURE.md` - FSD architecture guide
- `docs/design/DESIGN_SYSTEM.md` - Complete design system reference
- `docs/guides/DEPLOYMENT_WORKFLOW.md` - Detailed deployment workflow
- `docs/plans/WEBSITE_RENEWAL.md` - Website redesign roadmap

## Project Context

This is an ongoing website redesign project inspired by modern agency websites (Noomo Agency). The redesign focuses on:
- Full-screen hero sections with animations
- Scroll-triggered reveals
- Glassmorphism UI
- Smooth scrolling experience
- Rich micro-interactions

See `docs/plans/WEBSITE_RENEWAL.md` for the complete redesign roadmap.
