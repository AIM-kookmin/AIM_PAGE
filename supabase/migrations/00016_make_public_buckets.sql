-- ============================================================================
-- Migration: Make Activities and Studies Buckets Public
-- Description: Update storage buckets to allow public read access for public-facing content
-- ============================================================================

-- Drop all existing policies for activities and studies buckets
DROP POLICY IF EXISTS "Authenticated users can upload activity images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view activity images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete activity images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload study images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view study images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete study images" ON storage.objects;

-- Update activities bucket to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'activities';

-- Update studies bucket to be public (create if doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('studies', 'studies', true)
ON CONFLICT (id)
DO UPDATE SET public = true;

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
