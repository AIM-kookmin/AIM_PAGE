-- ============================================================================
-- 진단 6: 환경 비교 체크리스트
-- ============================================================================
-- dev와 prod에서 각각 실행하여 결과를 비교하세요
-- ============================================================================

SELECT
  'is_admin() 함수 버전' as "항목",
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname = 'is_admin'
        AND pg_get_functiondef(p.oid) LIKE '%COALESCE%'
    ) THEN '✅ 최신 (00023 - COALESCE 있음)'
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname = 'is_admin'
        AND pg_get_functiondef(p.oid) LIKE '%auth.uid() IS NOT NULL%'
    ) THEN '⚠️  00019 (모든 인증 사용자 허용)'
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname = 'is_admin'
    ) THEN '⚠️  이전 버전 (NULL 처리 없음)'
    ELSE '❌ 함수 없음'
  END as "상태"

UNION ALL

SELECT
  'activities INSERT 정책' as "항목",
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'activities'
        AND cmd IN ('ALL', 'INSERT')
    ) THEN '✅ 존재함'
    ELSE '❌ 없음 - INSERT 불가능!'
  END as "상태"

UNION ALL

SELECT
  'RLS 활성화 상태' as "항목",
  CASE
    WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'activities')
    THEN '✅ 활성화됨'
    ELSE '❌ 비활성화됨'
  END as "상태"

UNION ALL

SELECT
  'member_profiles 레코드 수' as "항목",
  COUNT(*)::text || '명' as "상태"
FROM public.member_profiles

UNION ALL

SELECT
  '관리자 권한 보유자 수' as "항목",
  COUNT(*)::text || '명' as "상태"
FROM public.member_profiles
WHERE position IN ('운영진', '관리자', '회장');
