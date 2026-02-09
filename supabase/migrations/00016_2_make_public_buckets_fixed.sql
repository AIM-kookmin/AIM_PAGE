-- ============================================================================
-- Migration: Make Activities and Studies Buckets Public (Fixed)
-- ============================================================================
-- This is a corrected version of 00016 that properly handles existing policies
-- Issue: Original 00016 had mismatched DROP/CREATE policy names
-- ============================================================================

-- ============================================================================
-- 1. Drop ALL existing policies for activities and studies buckets
-- ============================================================================
DROP POLICY IF EXISTS "Public can view activity images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view study images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload activity images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view activity images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete activity images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload study images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view study images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete study images" ON storage.objects;

-- ============================================================================
-- 2. Update buckets to be public
-- ============================================================================
-- Update activities bucket to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'activities';

-- Create or update studies bucket to be public
INSERT INTO storage.buckets (id, name, public)
VALUES ('studies', 'studies', true)
ON CONFLICT (id)
DO UPDATE SET public = true;

-- ============================================================================
-- 3. Create new policies for PUBLIC READ access
-- ============================================================================
-- Policy 1: Allow public read access to activities bucket
CREATE POLICY "Public can view activity images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'activities');

-- Policy 2: Allow public read access to studies bucket
CREATE POLICY "Public can view study images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'studies');

-- ============================================================================
-- 4. Create policies for AUTHENTICATED UPLOAD
-- ============================================================================
-- Policy 3: Only authenticated users can upload to activities
CREATE POLICY "Authenticated users can upload activity images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'activities');

-- Policy 4: Only authenticated users can upload to studies
CREATE POLICY "Authenticated users can upload study images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'studies');

-- ============================================================================
-- 5. Create policies for AUTHENTICATED DELETE
-- ============================================================================
-- Policy 5: Only authenticated users can delete from activities
CREATE POLICY "Authenticated users can delete activity images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'activities');

-- Policy 6: Only authenticated users can delete from studies
CREATE POLICY "Authenticated users can delete study images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'studies');

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON POLICY "Public can view activity images" ON storage.objects IS
  'Allow public read access to activities bucket for displaying images on public pages';

COMMENT ON POLICY "Public can view study images" ON storage.objects IS
  'Allow public read access to studies bucket for displaying images on public pages';

COMMENT ON POLICY "Authenticated users can upload activity images" ON storage.objects IS
  'Allow authenticated users to upload images to activities bucket';

COMMENT ON POLICY "Authenticated users can upload study images" ON storage.objects IS
  'Allow authenticated users to upload images to studies bucket';

-- ============================================================================
-- Verification (run after applying migration)
-- ============================================================================
-- SELECT
--   bucket_id,
--   policyname,
--   cmd,
--   roles
-- FROM pg_policies
-- WHERE schemaname = 'storage'
--   AND tablename = 'objects'
--   AND bucket_id IN ('activities', 'studies')
-- ORDER BY bucket_id, cmd;
