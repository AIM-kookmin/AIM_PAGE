# Database Migration Guide

## 📋 Overview

This guide explains how to apply the new database schema improvements to your Supabase project.

---

## 🆕 New Migrations

| File | Description | Impact |
|------|-------------|--------|
| `00007_improve_activities_table.sql` | Activities 테이블 필드 추가 | **Safe** - ALTER TABLE ADD COLUMN |
| `00008_improve_studies_table.sql` | Studies 테이블 필드 추가 | **Safe** - ALTER TABLE ADD COLUMN |
| `00009_improve_study_posts_table.sql` | Study Posts 필드 + 트리거 추가 | **Safe** - 자동 생성 기능 |
| `00010_add_study_members_table.sql` | Study Members 테이블 생성 | **Safe** - 새 테이블 |

**Total**: 4 new migration files

---

## 🚀 Migration Steps

### Step 1: Link to Supabase Project

```bash
cd /Users/simjoon/develop/AIM_PAGE
supabase link --project-ref <YOUR_PROJECT_ID>
```

**Find your project ID**:
- Go to https://supabase.com/dashboard
- Select your project
- Copy the "Reference ID" from Project Settings

### Step 2: Check Current Migration Status

```bash
supabase db diff
```

This will show you what migrations are pending.

### Step 3: Apply Migrations

```bash
supabase db push
```

This will apply all migrations in order:
1. 00007_improve_activities_table.sql
2. 00008_improve_studies_table.sql
3. 00009_improve_study_posts_table.sql
4. 00010_add_study_members_table.sql

### Step 4: Verify Migrations

```bash
supabase db inspect
```

Check that all tables have the new columns.

---

## 🔍 What Changes

### Activities Table

**New Columns**:
- `image_url` TEXT - 대표 이미지
- `is_active` BOOLEAN - 공개/비공개
- `order` INTEGER - 정렬 순서
- `location` TEXT - 활동 장소
- `participants` INTEGER - 참가자 수
- `organizer` TEXT - 주최자
- `updated_at` TIMESTAMPTZ - 수정 시간

**Existing Data**: 영향 없음 (모두 DEFAULT 값으로 채워짐)

### Studies Table

**New Columns**:
- `category` TEXT - 카테고리 (기본: 'general')
- `status` TEXT - 상태 (기본: 'active')
- `start_date`, `end_date` DATE - 시작/종료일
- `max_members`, `current_members` INTEGER - 인원 관리
- `is_recruiting` BOOLEAN - 모집 중 여부
- `difficulty` TEXT - 난이도
- `schedule` TEXT - 일정
- `meeting_type` TEXT - 진행 방식
- `cover_url` TEXT - 커버 이미지
- `syllabus`, `prerequisites` TEXT - 커리큘럼/선수조건
- `order` INTEGER - 정렬 순서
- `updated_at` TIMESTAMPTZ - 수정 시간

**Existing Data**: 영향 없음

### Study Posts Table

**New Columns**:
- `excerpt` TEXT - 요약문 (자동 생성)
- `read_time` INTEGER - 읽기 시간 (자동 계산)
- `view_count`, `like_count` INTEGER - 통계
- `published_at` TIMESTAMPTZ - 게시 시간 (자동 설정)
- `order` INTEGER - 정렬 순서

**New Triggers**:
- `generate_study_post_excerpt` - excerpt 자동 생성
- `calculate_study_post_read_time` - read_time 자동 계산
- `set_study_post_published_at` - published_at 자동 설정

**Existing Data**:
- 기존 포스트에 excerpt와 read_time 자동 생성됨

### Study Members Table (NEW)

**완전히 새로운 테이블**:
- 스터디 그룹 멤버십 관리
- `current_members` 자동 업데이트 트리거 포함

---

## ⚠️ Important Notes

### 1. Default Values

모든 새 컬럼은 DEFAULT 값이 있어서 **기존 데이터에 영향 없음**:

```sql
ALTER TABLE activities ADD COLUMN is_active BOOLEAN DEFAULT true;
```

### 2. Auto-Generated Functions

Study Posts에 자동 생성 기능이 추가됩니다:

**Excerpt 생성**:
```sql
-- Trigger가 자동으로 content_md에서 추출
NEW.excerpt := LEFT(clean_markdown, 200) || '...';
```

**Read Time 계산**:
```sql
-- 단어 수 / 200 (분당 200단어)
NEW.read_time := word_count / 200;
```

**Published At 설정**:
```sql
-- status가 'published'로 변경될 때
NEW.published_at := NOW();
```

### 3. RLS Policy Changes

Studies 테이블의 RLS 정책이 업데이트됩니다:

**Before**:
```sql
visibility = 'public'
```

**After**:
```sql
visibility = 'public' AND (status = 'active' OR status = 'completed')
```

→ recruiting/cancelled 상태의 스터디는 숨겨짐

---

## 🧪 Testing After Migration

### 1. Test Activities

```sql
-- Insert test activity
INSERT INTO activities (title, category, date, description)
VALUES ('Test Activity', 'seminar', '2024-06-01', 'Test description');

-- Check default values
SELECT is_active, "order", updated_at FROM activities WHERE title = 'Test Activity';
-- Expected: is_active=true, order=0, updated_at=NOW()
```

### 2. Test Studies

```sql
-- Insert test study
INSERT INTO studies (title, description)
VALUES ('Test Study', 'Test description');

-- Check defaults
SELECT category, status, max_members, is_recruiting FROM studies WHERE title = 'Test Study';
-- Expected: category='general', status='active', max_members=10, is_recruiting=true
```

### 3. Test Study Posts Auto-Generation

```sql
-- Insert test post
INSERT INTO study_posts (author_id, title, content_md, status)
VALUES (
  'your-user-id',
  'Test Post',
  'This is a long content for testing the excerpt generation feature. It should automatically create a 200 character excerpt from this content.',
  'draft'
);

-- Check auto-generated fields
SELECT excerpt, read_time FROM study_posts WHERE title = 'Test Post';
-- Expected: excerpt is populated, read_time is calculated
```

### 4. Test Study Members

```sql
-- Join a study
INSERT INTO study_members (study_id, member_id)
VALUES ('study-uuid', 'user-uuid');

-- Check current_members updated
SELECT current_members FROM studies WHERE id = 'study-uuid';
-- Expected: current_members increased by 1
```

---

## 🔄 Rollback (If Needed)

If something goes wrong, you can rollback:

```bash
# Rollback last migration
supabase db reset

# Or manually drop added columns
supabase db diff --schema public > rollback.sql
# Edit rollback.sql to remove unwanted changes
```

**Warning**: 롤백은 신중하게! 데이터 손실 가능

---

## 📦 Update Frontend Types

After migration, update TypeScript types:

```bash
# Option 1: Manual (recommended)
# Use the types in: frontend/src/types/database.ts

# Option 2: Auto-generate from Supabase
supabase gen types typescript --local > frontend/src/types/supabase.ts
```

---

## ✅ Verification Checklist

- [ ] All 4 migration files applied successfully
- [ ] No errors in `supabase db push` output
- [ ] Activities table has new columns
- [ ] Studies table has new columns
- [ ] Study Posts table has new columns + triggers
- [ ] Study Members table created
- [ ] RLS policies updated
- [ ] Test inserts work correctly
- [ ] Auto-generation triggers work
- [ ] Frontend TypeScript types updated

---

## 🆘 Troubleshooting

### Error: "relation already exists"

Some columns might already exist. This is okay - migrations use `IF NOT EXISTS`.

### Error: "function handle_updated_at does not exist"

You need the updated_at trigger function. Add it:

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Error: "function is_admin does not exist"

You need the admin check function:

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

---

## 📞 Support

If you encounter issues:

1. Check Supabase Dashboard → Database → Logs
2. Review migration file contents
3. Test SQL queries in SQL Editor
4. Check RLS policies are correct

---

**Last Updated**: 2026-02-01
**Migration Version**: 2.0
