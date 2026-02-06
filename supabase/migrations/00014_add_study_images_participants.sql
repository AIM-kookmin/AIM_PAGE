-- ============================================================================
-- Migration: Add images and participants fields to studies table
-- Description: Support multiple images and participant names for studies
-- ============================================================================

-- Add images array and participants array columns
ALTER TABLE public.studies
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS participants TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS link TEXT,
  ADD COLUMN IF NOT EXISTS content TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_studies_images ON public.studies USING GIN (images);

-- Add comments
COMMENT ON COLUMN public.studies.images IS '스터디 이미지 URL 배열 (최대 10개)';
COMMENT ON COLUMN public.studies.participants IS '참여 멤버 이름 배열';
COMMENT ON COLUMN public.studies.link IS '외부 링크 (블로그, 노션 등)';
COMMENT ON COLUMN public.studies.content IS '스터디 내용 설명';
