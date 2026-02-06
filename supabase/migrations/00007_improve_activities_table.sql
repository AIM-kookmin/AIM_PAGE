-- ============================================================================
-- Migration: Improve Activities Table
-- Description: Add missing fields for better activity management
-- ============================================================================

-- Add missing columns to activities table
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS participants INTEGER,
  ADD COLUMN IF NOT EXISTS organizer TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add index for ordering
CREATE INDEX IF NOT EXISTS idx_activities_order ON public.activities("order" DESC);
CREATE INDEX IF NOT EXISTS idx_activities_is_active ON public.activities(is_active);

-- Add trigger for updated_at
CREATE TRIGGER set_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.activities IS '동아리 활동 기록 (대회, 세미나, 워크샵 등)';
COMMENT ON COLUMN public.activities.title IS '활동 제목';
COMMENT ON COLUMN public.activities.category IS '카테고리 (competition, seminar, workshop, project, social)';
COMMENT ON COLUMN public.activities.date IS '활동 날짜';
COMMENT ON COLUMN public.activities.description IS '활동 상세 설명 (마크다운 지원)';
COMMENT ON COLUMN public.activities.image_url IS '대표 이미지 URL';
COMMENT ON COLUMN public.activities.gallery_urls IS '갤러리 이미지 URLs (JSON 배열)';
COMMENT ON COLUMN public.activities.is_active IS '활성화 여부 (공개/비공개)';
COMMENT ON COLUMN public.activities."order" IS '정렬 순서 (낮을수록 먼저 표시)';
COMMENT ON COLUMN public.activities.location IS '활동 장소';
COMMENT ON COLUMN public.activities.participants IS '참가자 수';
COMMENT ON COLUMN public.activities.organizer IS '주최자/담당자';
