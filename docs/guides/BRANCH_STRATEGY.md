# AIM Page - Git Branch & Deployment Strategy

## 1. Overview
Currently, we operate with a **Single Database (`aim-page-dev`)** for all environments.
This strategy optimizes for development speed but requires careful coordination to avoid data conflicts.

## 2. Environments

| Environment | Git Branch | Vercel Deployment | Database | Note |
|-------------|------------|-------------------|----------|------|
| **Production** | `main` | Production URL | `aim-page-dev` | User-facing (currently using dev DB) |
| **Development** | `develop` | Preview URL | `aim-page-dev` | Integration testing |
| **Feature** | `feature/*` | Preview URL | `aim-page-dev` | Individual task testing |

## 3. Workflow

### Step 1: Feature Development
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
# ... work ...
```

### Step 2: Local Testing
- Develop against `localhost:3000`
- **Warning**: You are connecting to the SHARED dev database.
- Do NOT delete data needed by others.
- Coordinate schema changes with the team.

### Step 3: Pull Request (PR)
- Push to `feature/my-feature`
- Open PR to `develop`
- Vercel automatically deploys a Preview URL.
- Test on the Preview URL.

### Step 4: Merge to Develop
- Merge PR to `develop`.
- This updates the Development environment.

### Step 5: Release (Production)
- Periodically merge `develop` into `main`.
- This triggers Production deployment.

## 4. Future Roadmap (Before Public Launch)
1. Create `aim-page-prod` Supabase project.
2. Configure Vercel Environment Variables:
   - **Production Target**: `NEXT_PUBLIC_SUPABASE_URL` = Prod DB URL
   - **Preview/Dev Target**: `NEXT_PUBLIC_SUPABASE_URL` = Dev DB URL
3. Switch `main` branch to use Prod DB.
