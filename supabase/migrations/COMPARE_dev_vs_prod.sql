-- ============================================================================
-- Dev vs Prod 환경 비교 쿼리
-- ============================================================================
-- Dev와 Prod SQL Editor에서 각각 실행하여 결과를 비교하세요
-- ============================================================================

-- ============================================================================
-- 1. is_admin() 함수 정의 비교
-- ============================================================================
SELECT
  '=== is_admin() 함수 정의 ===' as "섹션",
  pg_get_functiondef(p.oid) as "함수_정의"
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'is_admin';

-- ============================================================================
-- 2. RLS 정책 비교 (핵심 테이블)
-- ============================================================================
SELECT
  '=== RLS 정책 상태 ===' as "섹션";

SELECT
  tablename as "테이블",
  policyname as "정책명",
  cmd as "명령",
  CASE
    WHEN qual IS NOT NULL THEN '✅'
    ELSE '❌'
  END as "USING",
  CASE
    WHEN with_check IS NOT NULL THEN '✅'
    ELSE '❌'
  END as "WITH_CHECK",
  CASE
    WHEN with_check IS NULL AND cmd IN ('ALL', 'INSERT', 'UPDATE')
    THEN '🚨 INSERT/UPDATE 불가!'
    ELSE '✅ 정상'
  END as "상태"
FROM pg_policies
WHERE tablename IN ('about_sections', 'activities', 'studies', 'member_profiles')
  AND policyname = 'allow_admin_all'
ORDER BY tablename;

-- ============================================================================
-- 3. 테이블 컬럼 비교
-- ============================================================================
SELECT
  '=== 테이블 구조 ===' as "섹션";

SELECT
  table_name as "테이블",
  column_name as "컬럼",
  data_type as "타입",
  is_nullable as "NULL가능",
  column_default as "기본값"
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('activities', 'studies', 'member_profiles')
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- 4. 제약 조건 비교
-- ============================================================================
SELECT
  '=== 제약 조건 ===' as "섹션";

SELECT
  tc.table_name as "테이블",
  tc.constraint_name as "제약명",
  tc.constraint_type as "타입"
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('activities', 'studies', 'member_profiles')
ORDER BY tc.table_name, tc.constraint_type;

-- ============================================================================
-- 5. 인덱스 비교
-- ============================================================================
SELECT
  '=== 인덱스 ===' as "섹션";

SELECT
  schemaname as "스키마",
  tablename as "테이블",
  indexname as "인덱스명"
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('activities', 'studies', 'member_profiles')
ORDER BY tablename, indexname;

-- ============================================================================
-- 6. 트리거 비교
-- ============================================================================
SELECT
  '=== 트리거 ===' as "섹션";

SELECT
  event_object_table as "테이블",
  trigger_name as "트리거명",
  event_manipulation as "이벤트",
  action_statement as "액션"
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('activities', 'studies', 'member_profiles')
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- 7. Storage 정책 비교
-- ============================================================================
SELECT
  '=== Storage 정책 ===' as "섹션";

SELECT
  name as "버킷명",
  public as "공개여부",
  file_size_limit as "파일크기제한",
  allowed_mime_types as "허용타입"
FROM storage.buckets
ORDER BY name;

-- ============================================================================
-- 요약 (가장 중요)
-- ============================================================================
SELECT
  '=== 🎯 핵심 체크리스트 ===' as "섹션";

WITH policy_check AS (
  SELECT
    COUNT(*) FILTER (WHERE with_check IS NULL AND cmd IN ('ALL', 'INSERT', 'UPDATE')) as missing_with_check,
    COUNT(*) as total_admin_policies
  FROM pg_policies
  WHERE policyname = 'allow_admin_all'
),
function_check AS (
  SELECT
    CASE
      WHEN pg_get_functiondef(p.oid) LIKE '%COALESCE%' THEN true
      ELSE false
    END as has_coalesce
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' AND p.proname = 'is_admin'
)
SELECT
  CASE
    WHEN pc.missing_with_check > 0
    THEN '❌ ' || pc.missing_with_check || '개 정책에 WITH_CHECK 없음 (00024 필요)'
    ELSE '✅ 모든 정책에 WITH_CHECK 있음'
  END as "RLS_정책_상태",
  CASE
    WHEN fc.has_coalesce
    THEN '✅ is_admin()에 NULL 처리 있음'
    ELSE '❌ is_admin()에 NULL 처리 없음 (00023 필요)'
  END as "함수_상태",
  CASE
    WHEN pc.missing_with_check = 0 AND fc.has_coalesce
    THEN '🎉 완벽! 문제 없음'
    ELSE '⚠️  수정 필요'
  END as "전체_상태"
FROM policy_check pc, function_check fc;
