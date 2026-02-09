-- ============================================================================
-- 진단 2: activities 테이블 RLS 정책 확인
-- ============================================================================
-- activities 테이블의 모든 RLS 정책을 확인합니다
-- INSERT 정책이 제대로 있는지 확인하세요
-- ============================================================================

SELECT
  schemaname as "스키마",
  tablename as "테이블",
  policyname as "정책명",
  CASE cmd
    WHEN 'ALL' THEN '모든 작업'
    WHEN 'SELECT' THEN '조회만'
    WHEN 'INSERT' THEN '생성만'
    WHEN 'UPDATE' THEN '수정만'
    WHEN 'DELETE' THEN '삭제만'
  END as "적용_명령",
  qual as "USING_조건",
  with_check as "WITH_CHECK_조건",
  CASE
    WHEN cmd IN ('ALL', 'INSERT') AND qual LIKE '%is_admin%' THEN '✅ INSERT 정책 있음 (is_admin 필요)'
    WHEN cmd = 'SELECT' THEN 'ℹ️  조회 전용'
    ELSE '⚠️  확인 필요'
  END as "진단"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'activities'
ORDER BY
  CASE cmd
    WHEN 'ALL' THEN 1
    WHEN 'INSERT' THEN 2
    WHEN 'SELECT' THEN 3
    ELSE 4
  END;
