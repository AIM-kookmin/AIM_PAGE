-- ============================================================================
-- Allow public access to studies with status='recruiting'
-- ============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "allow_public_read_active" ON public.studies;

-- Recreate with recruiting status included
CREATE POLICY "allow_public_read_active" ON public.studies
  FOR SELECT USING (
    visibility = 'public' AND
    (status = 'active' OR status = 'completed' OR status = 'recruiting')
  );

-- Add comment
COMMENT ON POLICY "allow_public_read_active" ON public.studies IS 'Allow public read access to public studies that are active, completed, or recruiting';
