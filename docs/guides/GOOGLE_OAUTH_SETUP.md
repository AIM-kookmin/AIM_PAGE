# Google OAuth Migration Guide

This guide details the steps to migrate from email/password login to Google OAuth using Supabase Auth.

## 1. Prerequisites (Manual Setup)

Before using AI agents, you must configure Google Cloud and Supabase manually.

### A. Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `aim-page-auth`).
3. Go to **APIs & Services > OAuth consent screen**.
   - User Type: **External**
   - App Name: `AIM Page`
   - Support Email: Your email
   - Developer Contact Info: Your email
4. Go to **Credentials > Create Credentials > OAuth client ID**.
   - Application type: **Web application**
   - Name: `Supabase Auth`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://aim-page.vercel.app` (Your production URL)
   - **Authorized redirect URIs**:
     - `https://<YOUR_SUPABASE_ID>.supabase.co/auth/v1/callback`
     - (Find this URL in Supabase Dashboard > Authentication > Providers > Google)
5. Copy **Client ID** and **Client Secret**.

### B. Supabase Dashboard
1. Go to **Authentication > Providers**.
2. Select **Google**.
3. Enable **Google provider**.
4. Paste **Client ID** and **Client Secret**.
5. Click **Save**.

---

## 2. Implementation Plan (AI Agent Workflow)

Use this plan to instruct AI agents for implementation.

### Step 1: Update Login UI
**Agent**: `frontend-ui-ux-engineer`
**Task**: Add "Sign in with Google" button to the login page.

**Prompt Template:**
```markdown
Update the Login page (`/app/(public)/login/page.tsx`) to include Google OAuth.

1. Add a "Sign in with Google" button above or below the email form.
   - Use a Google icon (e.g., from `react-icons/fc` or an SVG).
   - Style it to match the existing dark theme (e.g., white background, black text).

2. Implement the handler:
   ```typescript
   const handleGoogleLogin = async () => {
     const { error } = await supabase.auth.signInWithOAuth({
       provider: 'google',
       options: {
         redirectTo: `${window.location.origin}/auth/callback`,
         queryParams: {
           access_type: 'offline',
           prompt: 'consent',
         },
       },
     })
     if (error) alert(error.message)
   }
   ```
```

### Step 2: Update Auth Callback (Already Done)
We already created `/app/auth/callback/route.ts` in Phase 2. No action needed unless specific logic is required.

### Step 3: Handle New User Registration
**Agent**: `general` or `backend` logic
**Task**: Ensure new users from Google have correct metadata/role.

**Strategy**:
- **Triggers**: Use Supabase Database Triggers to automatically create a `member_profile` entry when a new user signs up via Google.
- **Role**: Default role will be `member` (or `user`). Admin role must be assigned manually in Supabase Dashboard.

**SQL Trigger (to be executed in Supabase SQL Editor):**
```sql
-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.member_profiles (user_id, display_name, email, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 3. Migration Checklist

- [ ] Google Cloud Project created & OAuth configured
- [ ] Supabase Google Provider enabled
- [ ] Login page updated with Google button
- [ ] Database Trigger created for `member_profiles` sync
- [ ] Tested locally (`localhost:3000`)
- [ ] Tested on Vercel Preview
- [ ] Production URL added to Google Cloud Console

## 4. Cost Considerations
- **Supabase Auth**: Free (up to 50,000 MAU on Free Tier).
- **Google OAuth**: Free.
- No hidden costs for standard usage.
