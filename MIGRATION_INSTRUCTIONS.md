# 🚀 Database Migration Instructions

Your studies page isn't working because the database migrations haven't been applied yet. Follow one of these methods:

---

## ✅ Method 1: Using CLI (Recommended)

### Step 1: Get Supabase Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Give it a name like "CLI Access"
4. Copy the token

### Step 2: Run the Migration Script

```bash
# Set your token (paste the token you copied)
export SUPABASE_ACCESS_TOKEN=sbp_your_token_here

# Run the script
./apply-migrations.sh
```

That's it! The script will:
- Link to your dev project (`gttkvtlkjdusbortnbiz`)
- Show pending migrations
- Apply all 4 migrations
- Verify the schema

---

## 🔧 Method 2: Manual SQL Execution (Alternative)

If the CLI method doesn't work, apply migrations directly in Supabase:

### Go to SQL Editor
https://supabase.com/dashboard/project/gttkvtlkjdusbortnbiz/sql/new

### Execute Each Migration File

Copy and run each file **in order**:

#### 1. Activities Table Improvements
```sql
-- File: supabase/migrations/00007_improve_activities_table.sql
-- Copy entire file content and run
```

#### 2. Studies Table Improvements
```sql
-- File: supabase/migrations/00008_improve_studies_table.sql
-- Copy entire file content and run
```

#### 3. Study Posts Improvements
```sql
-- File: supabase/migrations/00009_improve_study_posts_table.sql
-- Copy entire file content and run
```

#### 4. Study Members Table
```sql
-- File: supabase/migrations/00010_add_study_members_table.sql
-- Copy entire file content and run
```

---

## 📝 What These Migrations Do

| Migration | Changes |
|-----------|---------|
| **00007** | Adds `image_url`, `is_active`, `order`, `location`, `participants`, `organizer`, `updated_at` to `activities` table |
| **00008** | Adds 15 new fields to `studies` table (category, status, dates, members, difficulty, etc.) |
| **00009** | Adds auto-generation features to `study_posts` (excerpt, read_time, view_count, published_at) |
| **00010** | Creates new `study_members` table with auto-counting triggers |

---

## ✅ Verification

After applying migrations, test:

```bash
# Restart dev server
cd frontend
npm run dev
```

Then visit: http://localhost:3000/studies

The page should now load without errors!

---

## 🆘 Troubleshooting

### Error: "function handle_updated_at does not exist"

If you see this error, first run this SQL:

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Then re-run the migrations.

### Error: "function is_admin does not exist"

Run this SQL first:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT is_admin
    FROM public.member_profiles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Then re-run the migrations.

---

## 📖 More Details

For comprehensive documentation, see:
- `docs/database/MIGRATION_GUIDE.md` - Detailed migration guide
- `docs/database/DATABASE_SCHEMA.md` - Complete schema documentation
