-- ============================================================================
-- 진단 5: INSERT 시뮬레이션 (실제 삽입은 안 함)
-- ============================================================================
-- activities 테이블에 INSERT가 가능한지 RLS 정책을 직접 평가합니다
-- 실제 데이터는 삽입하지 않습니다
-- ============================================================================

WITH policy_check AS (
  SELECT
    public.is_admin() as can_insert,
    CASE
      WHEN public.is_admin() IS NULL THEN
        '❌ FAILED: is_admin()이 NULL 반환 - RLS 정책이 INSERT를 거부합니다'
      WHEN public.is_admin() = false THEN
        '❌ FAILED: is_admin()이 FALSE - 관리자 권한이 필요합니다'
      WHEN public.is_admin() = true THEN
        '✅ PASSED: INSERT 가능합니다'
    END as result
)
SELECT
  can_insert as "is_admin_결과",
  result as "INSERT_가능_여부",
  '활동 추가 버튼을 눌렀을 때 이 결과에 따라 성공/실패가 결정됩니다' as "설명"
FROM policy_check;
