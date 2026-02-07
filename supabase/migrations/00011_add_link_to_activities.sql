-- ============================================================================
-- Migration: Add Link Field to Activities Table
-- Description: Add external link field for activity posts
-- ============================================================================

-- Add link column to activities table
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS link TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.activities.link IS '외부 링크 URL (블로그, 노션 등)';
