-- ============================================================================
-- Migration: Remove Year Field from Member Profiles
-- Description: Remove the year column from member_profiles table
-- ============================================================================

-- Remove year column from member_profiles table
ALTER TABLE public.member_profiles DROP COLUMN IF EXISTS year;

-- Add comment for documentation
COMMENT ON TABLE public.member_profiles IS '부원 프로필 정보 (학년 정보 제거됨)';
