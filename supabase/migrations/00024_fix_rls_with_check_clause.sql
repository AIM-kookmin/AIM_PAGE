-- ============================================================================
-- Fix RLS WITH CHECK clause for INSERT and UPDATE operations
-- ============================================================================
-- Issue: All "allow_admin_all" policies were missing WITH CHECK clause,
-- causing INSERT and UPDATE to fail while DELETE worked.
--
-- RLS behavior:
-- - DELETE: Only checks USING clause ✅ (worked)
-- - INSERT: Only checks WITH CHECK clause ❌ (was NULL → failed)
-- - UPDATE: Checks both USING and WITH CHECK ❌ (WITH CHECK was NULL → failed)
--
-- Solution: Add WITH CHECK clause to all admin policies
-- ============================================================================

-- ============================================================================
-- 1. about_sections
-- ============================================================================
DROP POLICY IF EXISTS "allow_admin_all" ON public.about_sections;
CREATE POLICY "allow_admin_all" ON public.about_sections
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 2. about_activities
-- ============================================================================
DROP POLICY IF EXISTS "allow_admin_all" ON public.about_activities;
CREATE POLICY "allow_admin_all" ON public.about_activities
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 3. about_history
-- ============================================================================
DROP POLICY IF EXISTS "allow_admin_all" ON public.about_history;
CREATE POLICY "allow_admin_all" ON public.about_history
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 4. about_contacts
-- ============================================================================
DROP POLICY IF EXISTS "allow_admin_all" ON public.about_contacts;
CREATE POLICY "allow_admin_all" ON public.about_contacts
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 5. recruit_notices
-- ============================================================================
DROP POLICY IF EXISTS "allow_admin_all" ON public.recruit_notices;
CREATE POLICY "allow_admin_all" ON public.recruit_notices
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 6. member_profiles
-- ============================================================================
DROP POLICY IF EXISTS "allow_admin_all" ON public.member_profiles;
CREATE POLICY "allow_admin_all" ON public.member_profiles
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 7. activities (핵심 문제)
-- ============================================================================
DROP POLICY IF EXISTS "allow_admin_all" ON public.activities;
CREATE POLICY "allow_admin_all" ON public.activities
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 8. studies (핵심 문제)
-- ============================================================================
DROP POLICY IF EXISTS "allow_admin_all" ON public.studies;
CREATE POLICY "allow_admin_all" ON public.studies
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 9. study_posts
-- ============================================================================
DROP POLICY IF EXISTS "allow_admin_all" ON public.study_posts;
CREATE POLICY "allow_admin_all" ON public.study_posts
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 10. tags
-- ============================================================================
DROP POLICY IF EXISTS "allow_admin_all" ON public.tags;
CREATE POLICY "allow_admin_all" ON public.tags
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 11. study_post_tags
-- ============================================================================
DROP POLICY IF EXISTS "allow_admin_all" ON public.study_post_tags;
CREATE POLICY "allow_admin_all" ON public.study_post_tags
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 12. study_members
-- ============================================================================
DROP POLICY IF EXISTS "allow_admin_all" ON public.study_members;
CREATE POLICY "allow_admin_all" ON public.study_members
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- Verification query (run after applying migration)
-- ============================================================================
-- SELECT
--   tablename,
--   policyname,
--   cmd,
--   qual as "USING",
--   with_check as "WITH_CHECK",
--   CASE
--     WHEN with_check IS NULL THEN '❌ WITH_CHECK 없음'
--     ELSE '✅ WITH_CHECK 있음'
--   END as "상태"
-- FROM pg_policies
-- WHERE policyname = 'allow_admin_all'
-- ORDER BY tablename;

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON POLICY "allow_admin_all" ON public.activities IS
  'Allow admins to perform all operations. Requires is_admin() to return true for both USING and WITH CHECK.';

COMMENT ON POLICY "allow_admin_all" ON public.studies IS
  'Allow admins to perform all operations. Requires is_admin() to return true for both USING and WITH CHECK.';
