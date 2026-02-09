-- ============================================================================
-- 진단 3: 현재 로그인한 사용자 권한 테스트
-- ============================================================================
-- 실제로 로그인한 상태에서 실행해야 합니다
-- 브라우저에서 로그인 후 Supabase Dashboard의 SQL Editor에서 실행하세요
-- ============================================================================

WITH user_info AS (
  SELECT
    auth.uid() as user_id,
    mp.display_name,
    mp.position,
    mp.status
  FROM public.member_profiles mp
  WHERE mp.user_id = auth.uid()
),
admin_test AS (
  SELECT
    public.is_admin() as is_admin_result,
    CASE
      WHEN public.is_admin() IS NULL THEN 'NULL'
      WHEN public.is_admin() = true THEN 'TRUE'
      WHEN public.is_admin() = false THEN 'FALSE'
    END as is_admin_string
)
SELECT
  ui.user_id as "User_ID",
  ui.display_name as "이름",
  ui.position as "직책",
  ui.status as "상태",
  at.is_admin_result as "is_admin_결과",
  at.is_admin_string as "is_admin_문자열",
  CASE
    WHEN ui.user_id IS NULL THEN '❌ 로그인되지 않음'
    WHEN at.is_admin_result IS NULL THEN '❌ CRITICAL: is_admin()이 NULL 반환 - INSERT 실패 원인!'
    WHEN at.is_admin_result = false THEN '❌ 관리자 권한 없음 - INSERT 불가'
    WHEN at.is_admin_result = true THEN '✅ 관리자 권한 있음 - INSERT 가능'
    ELSE '❓ 알 수 없는 상태'
  END as "진단_결과"
FROM user_info ui
CROSS JOIN admin_test at;
