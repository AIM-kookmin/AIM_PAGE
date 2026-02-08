-- ============================================================================
-- Fix Public Data Access Permissions
-- ============================================================================
-- This migration fixes three security/privacy issues:
-- 1. activities table missing is_active column
-- 2. member_profiles allowing pending/rejected users to be public
-- 3. recruit_notices exposing all notices including closed ones
-- ============================================================================

-- ============================================================================
-- 1. activities 테이블에 is_active 컬럼 추가
-- ============================================================================

ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_activities_is_active ON public.activities(is_active);

-- updated_at 트리거 추가
DROP TRIGGER IF EXISTS set_updated_at ON public.activities;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 2. RLS 정책 수정: activities
-- ============================================================================

DROP POLICY IF EXISTS "allow_public_read" ON public.activities;
CREATE POLICY "allow_public_read_active" ON public.activities
  FOR SELECT USING (is_active = true);

-- ============================================================================
-- 3. RLS 정책 수정: member_profiles
-- ============================================================================

DROP POLICY IF EXISTS "allow_public_read" ON public.member_profiles;
CREATE POLICY "allow_public_read_active" ON public.member_profiles
  FOR SELECT USING (is_public = true AND status = 'active');

-- ============================================================================
-- 4. RLS 정책 수정: recruit_notices
-- ============================================================================

DROP POLICY IF EXISTS "allow_public_read" ON public.recruit_notices;
CREATE POLICY "allow_public_read_active" ON public.recruit_notices
  FOR SELECT USING (is_open = true);

-- ============================================================================
-- 5. 기존 데이터 업데이트
-- ============================================================================

-- 모든 기존 활동을 공개로 설정
UPDATE public.activities SET is_active = true WHERE is_active IS NULL;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON COLUMN public.activities.is_active IS 'Whether the activity is publicly visible';
COMMENT ON POLICY "allow_public_read_active" ON public.activities IS 'Allow public read access to active activities only';
COMMENT ON POLICY "allow_public_read_active" ON public.member_profiles IS 'Allow public read access to active public profiles only';
COMMENT ON POLICY "allow_public_read_active" ON public.recruit_notices IS 'Allow public read access to open recruit notices only';
