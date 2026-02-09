-- ============================================================================
-- 진단 1: is_admin() 함수 정의 확인
-- ============================================================================
-- 이 쿼리는 현재 적용된 is_admin() 함수의 정의를 보여줍니다
-- dev와 prod에서 각각 실행하여 차이를 비교하세요
-- ============================================================================

SELECT
  p.proname as "함수명",
  pg_get_functiondef(p.oid) as "함수_전체_정의",
  CASE
    WHEN pg_get_functiondef(p.oid) LIKE '%COALESCE%' THEN '✅ NULL 처리 있음 (00023 적용됨)'
    WHEN pg_get_functiondef(p.oid) LIKE '%auth.uid() IS NOT NULL%' THEN '⚠️  00019 버전 (모든 인증 사용자)'
    WHEN pg_get_functiondef(p.oid) LIKE '%IN (''운영진'', ''관리자'', ''회장'')%' THEN '⚠️  00020 버전 (NULL 처리 없음)'
    WHEN pg_get_functiondef(p.oid) LIKE '%position = ''운영진''%' THEN '❌ 00018 버전 (운영진만)'
    ELSE '❓ 알 수 없는 버전'
  END as "버전_상태"
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'is_admin';
