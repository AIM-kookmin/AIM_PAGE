-- ============================================================================
-- Fix is_admin() function to handle NULL values properly
-- ============================================================================
-- Issue: is_admin() was returning NULL when user has no profile or position,
-- causing RLS policies to fail and reject INSERT/UPDATE operations (400 errors)
--
-- Solution: Use COALESCE to ensure function always returns boolean (never NULL)
-- ============================================================================

-- Drop and recreate the function with NULL handling
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT position IN ('운영진', '관리자', '회장')
      FROM public.member_profiles
      WHERE user_id = auth.uid()
    ),
    false  -- Return false instead of NULL when no matching record or NULL position
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure authenticated users can execute this function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Update function comment
COMMENT ON FUNCTION public.is_admin() IS
  'Returns true if authenticated user has position 운영진, 관리자, or 회장. '
  'Returns false (not NULL) if user has no profile or different position.';

-- ============================================================================
-- Verification query (run in Supabase SQL Editor to test)
-- ============================================================================
-- SELECT
--   auth.uid() as user_id,
--   public.is_admin() as is_admin_result,
--   CASE
--     WHEN public.is_admin() IS NULL THEN 'ERROR: Still returning NULL!'
--     WHEN public.is_admin() = true THEN 'Admin access granted'
--     WHEN public.is_admin() = false THEN 'No admin access'
--   END as status
-- FROM member_profiles
-- WHERE user_id = auth.uid();
