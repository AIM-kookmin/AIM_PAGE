-- ============================================================================
-- 진단 3-2: 특정 사용자(표시명이 '관리자') 권한 테스트
-- ============================================================================
-- 표시명이 '관리자'인 사용자의 권한을 확인합니다
-- ============================================================================

WITH target_user AS (
  SELECT
    id,
    user_id,
    display_name,
    position,
    status
  FROM public.member_profiles
  WHERE display_name = '관리자'
  LIMIT 1
)
SELECT
  tu.user_id as "User_ID",
  tu.display_name as "이름",
  tu.position as "직책",
  tu.status as "상태",
  CASE
    WHEN tu.user_id IS NULL THEN '❌ "관리자"라는 이름의 사용자가 없습니다'
    WHEN tu.position IS NULL THEN '❌ 직책이 NULL'
    WHEN tu.position IN ('운영진', '관리자', '회장') THEN '✅ 이 사용자는 관리자 권한 있음'
    ELSE '❌ 일반 부원 (현재 직책: ' || tu.position || ')'
  END as "권한_상태",
  '이 사용자로 로그인하면 활동 생성이 가능해야 합니다' as "참고"
FROM target_user tu;

-- 만약 위 결과가 비어있다면, 비슷한 이름 찾기
SELECT
  '=== 비슷한 이름 목록 ===' as "구분선";

SELECT
  display_name as "표시명",
  position as "직책",
  status as "상태",
  user_id as "User_ID"
FROM public.member_profiles
WHERE display_name ILIKE '%관리%'
   OR position ILIKE '%관리%'
ORDER BY display_name;
