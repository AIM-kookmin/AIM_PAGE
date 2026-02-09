-- ============================================================================
-- 진단 4: 모든 사용자의 권한 상태 확인
-- ============================================================================
-- prod 환경의 모든 사용자가 어떤 권한을 가지고 있는지 확인합니다
-- ============================================================================

SELECT
  display_name as "이름",
  position as "직책",
  status as "상태",
  is_public as "공개여부",
  CASE
    WHEN position IS NULL THEN '❌ 직책 없음 (NULL)'
    WHEN position IN ('운영진', '관리자', '회장') THEN '✅ 관리자 가능'
    ELSE '⚠️  일반 부원: ' || position
  END as "권한_상태",
  created_at as "생성일",
  updated_at as "수정일"
FROM public.member_profiles
ORDER BY
  CASE
    WHEN position = '회장' THEN 1
    WHEN position = '관리자' THEN 2
    WHEN position = '운영진' THEN 3
    WHEN position IS NULL THEN 999
    ELSE 4
  END,
  created_at DESC;
