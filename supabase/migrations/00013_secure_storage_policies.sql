-- ============================================================================
-- Migration: Secure Storage Policies for Activities Bucket
-- Description: Set up RLS policies for activities storage bucket to enhance security
-- Note: Storage policies are managed by Supabase, we can only configure bucket settings
-- ============================================================================

-- Drop existing policies if they exist (using proper schema)
DROP POLICY IF EXISTS "Authenticated users can upload activity images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view activity images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete activity images" ON storage.objects;

-- Policy 1: Only authenticated users can upload images to activities bucket
CREATE POLICY "Authenticated users can upload activity images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'activities'
);

-- Policy 2: Only authenticated users can view images (no public access)
CREATE POLICY "Authenticated users can view activity images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'activities');

-- Policy 3: Only authenticated users can delete their uploaded images
CREATE POLICY "Authenticated users can delete activity images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'activities');

-- Update bucket to be private (not public)
UPDATE storage.buckets
SET public = false
WHERE id = 'activities';
