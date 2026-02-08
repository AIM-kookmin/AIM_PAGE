-- ============================================================================
-- Migration: Update Studies RLS Policy
-- Description: Enforce visibility restrictions now that study_members exists
-- ============================================================================

-- Drop old policy
DROP POLICY IF EXISTS "allow_member_read_all" ON public.studies;

-- Create updated policy that enforces visibility rules
CREATE POLICY "allow_member_read_all" ON public.studies
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      visibility = 'public' OR
      EXISTS (
        SELECT 1 FROM public.study_members
        WHERE study_members.study_id = studies.id
          AND study_members.member_id = auth.uid()
          AND study_members.status = 'active'
      )
    )
  );

-- Add comment
COMMENT ON POLICY "allow_member_read_all" ON public.studies IS
  'Allow authenticated users to read public studies, or studies they are members of';
