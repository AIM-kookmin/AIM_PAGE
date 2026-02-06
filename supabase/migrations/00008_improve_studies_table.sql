-- ============================================================================
-- Migration: Improve Studies Table
-- Description: Add comprehensive fields for study group management
-- ============================================================================

-- Add missing columns to studies table
ALTER TABLE public.studies
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS current_members INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_recruiting BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS schedule TEXT,
  ADD COLUMN IF NOT EXISTS meeting_type TEXT DEFAULT 'offline',
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS syllabus TEXT,
  ADD COLUMN IF NOT EXISTS prerequisites TEXT,
  ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_studies_category ON public.studies(category);
CREATE INDEX IF NOT EXISTS idx_studies_status ON public.studies(status);
CREATE INDEX IF NOT EXISTS idx_studies_is_recruiting ON public.studies(is_recruiting);
CREATE INDEX IF NOT EXISTS idx_studies_order ON public.studies("order" DESC);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS set_studies_updated_at ON public.studies;
CREATE TRIGGER set_studies_updated_at
  BEFORE UPDATE ON public.studies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Update RLS policies for better visibility control
DROP POLICY IF EXISTS "allow_public_read" ON public.studies;

CREATE POLICY "allow_public_read_active" ON public.studies
  FOR SELECT USING (
    visibility = 'public' AND
    (status = 'active' OR status = 'completed')
  );

CREATE POLICY "allow_member_read_all" ON public.studies
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      visibility = 'public' OR
      EXISTS (
        SELECT 1 FROM public.study_members
        WHERE study_members.study_id = studies.id
          AND study_members.member_id = auth.uid()
      )
    )
  );

-- Add comments for documentation
COMMENT ON TABLE public.studies IS '스터디 그룹 관리 (ML, DL, 알고리즘 등)';
COMMENT ON COLUMN public.studies.title IS '스터디 이름';
COMMENT ON COLUMN public.studies.description IS '스터디 설명 (마크다운 지원)';
COMMENT ON COLUMN public.studies.category IS '카테고리 (ml, dl, algorithm, paper, project, etc.)';
COMMENT ON COLUMN public.studies.status IS '상태 (active, completed, cancelled, recruiting)';
COMMENT ON COLUMN public.studies.start_date IS '시작일';
COMMENT ON COLUMN public.studies.end_date IS '종료일';
COMMENT ON COLUMN public.studies.max_members IS '최대 인원';
COMMENT ON COLUMN public.studies.current_members IS '현재 인원';
COMMENT ON COLUMN public.studies.is_recruiting IS '모집 중 여부';
COMMENT ON COLUMN public.studies.difficulty IS '난이도 (beginner, intermediate, advanced)';
COMMENT ON COLUMN public.studies.schedule IS '일정 (예: 매주 화/목 19:00-21:00)';
COMMENT ON COLUMN public.studies.meeting_type IS '진행 방식 (offline, online, hybrid)';
COMMENT ON COLUMN public.studies.cover_url IS '커버 이미지 URL';
COMMENT ON COLUMN public.studies.syllabus IS '커리큘럼/강의 계획';
COMMENT ON COLUMN public.studies.prerequisites IS '선수 조건';
COMMENT ON COLUMN public.studies.visibility IS '공개 범위 (public, private, members_only)';
