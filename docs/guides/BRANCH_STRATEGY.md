# Branch and PR workflow

Verified on 2026-09-13 for `AIM-kookmin/AIM_PAGE`:

| Purpose | Branch |
| --- | --- |
| Default / integration | `dev` |
| Production release | `prod` |
| Changes under review | `fix/*`, `feat/*`, `feature/*`, etc. |

There is no remote `main` or `develop`. Open ordinary change PRs against `dev`.
Promotion from `dev` to `prod` is a separate release PR.

## This checkout's remotes

- `origin`: fetches `JoonSimJoon/AIM_PAGE`; currently has push URLs for both the
  personal and organization repositories.
- `upstream`: `AIM-kookmin/AIM_PAGE`.

Use the explicit remote you intend to update instead of relying on dual push:

```bash
git fetch upstream
git switch -c fix/example upstream/dev
# Implement and verify changes.
git push -u upstream fix/example
gh pr create --repo AIM-kookmin/AIM_PAGE --base dev --head fix/example
```

## Validation and deployment

CI runs lint, TypeScript, Jest, isolated PostgreSQL permission tests, and a Next.js
build on PRs targeting `dev`, `prod`, or `main` if it is introduced later. Failed
commands fail the workflow. The build job uses placeholder public Supabase values
and does not need database credentials. Vercel deployment environment variables
must contain the real values for the intended environment.

Before release, verify the hosting project's production branch and its Supabase
environment settings. Repository branch names alone do not prove which database
a deployment uses. SQL changes are reviewed and applied separately; never replay
the entire historical migration directory against an existing deployment.
