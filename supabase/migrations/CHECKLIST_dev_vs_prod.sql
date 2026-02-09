-- ============================================================================
-- Dev vs Prod 체크리스트 (간단 버전)
-- ============================================================================
-- Dev와 Prod에서 각각 실행하여 결과를 JSON으로 저장 후 비교
-- ============================================================================

WITH
-- 1. is_admin() 함수 버전 체크
function_version AS (
  SELECT
    'is_admin_function' as check_name,
    CASE
      WHEN pg_get_functiondef(p.oid) LIKE '%COALESCE%' THEN 'v3_with_coalesce'
      WHEN pg_get_functiondef(p.oid) LIKE '%auth.uid() IS NOT NULL%' THEN 'v2_all_authenticated'
      WHEN pg_get_functiondef(p.oid) LIKE '%IN (''운영진'', ''관리자'', ''회장'')%' THEN 'v1_three_positions'
      ELSE 'unknown'
    END as value
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' AND p.proname = 'is_admin'
),

-- 2. RLS WITH CHECK 상태
rls_with_check AS (
  SELECT
    'activities_with_check' as check_name,
    CASE
      WHEN with_check IS NOT NULL THEN 'exists'
      ELSE 'missing'
    END as value
  FROM pg_policies
  WHERE tablename = 'activities' AND policyname = 'allow_admin_all'

  UNION ALL

  SELECT
    'studies_with_check' as check_name,
    CASE
      WHEN with_check IS NOT NULL THEN 'exists'
      ELSE 'missing'
    END as value
  FROM pg_policies
  WHERE tablename = 'studies' AND policyname = 'allow_admin_all'

  UNION ALL

  SELECT
    'member_profiles_with_check' as check_name,
    CASE
      WHEN with_check IS NOT NULL THEN 'exists'
      ELSE 'missing'
    END as value
  FROM pg_policies
  WHERE tablename = 'member_profiles' AND policyname = 'allow_admin_all'
),

-- 3. Storage 버킷 상태
storage_buckets AS (
  SELECT
    'activities_bucket_public' as check_name,
    CASE
      WHEN public THEN 'true'
      ELSE 'false'
    END as value
  FROM storage.buckets
  WHERE id = 'activities'

  UNION ALL

  SELECT
    'studies_bucket_public' as check_name,
    CASE
      WHEN public THEN 'true'
      ELSE 'false'
    END as value
  FROM storage.buckets
  WHERE id = 'studies'
),

-- 4. Storage 정책 개수
storage_policies AS (
  SELECT
    'activities_storage_policies' as check_name,
    COUNT(*)::text as value
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND (qual LIKE '%activities%' OR with_check LIKE '%activities%')

  UNION ALL

  SELECT
    'studies_storage_policies' as check_name,
    COUNT(*)::text as value
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND (qual LIKE '%studies%' OR with_check LIKE '%studies%')
),

-- 5. 테이블 컬럼 개수
table_columns AS (
  SELECT
    'activities_columns' as check_name,
    COUNT(*)::text as value
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'activities'

  UNION ALL

  SELECT
    'studies_columns' as check_name,
    COUNT(*)::text as value
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'studies'

  UNION ALL

  SELECT
    'member_profiles_columns' as check_name,
    COUNT(*)::text as value
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'member_profiles'
),

-- 6. RLS 정책 개수
rls_policies AS (
  SELECT
    'activities_rls_policies' as check_name,
    COUNT(*)::text as value
  FROM pg_policies
  WHERE tablename = 'activities'

  UNION ALL

  SELECT
    'studies_rls_policies' as check_name,
    COUNT(*)::text as value
  FROM pg_policies
  WHERE tablename = 'studies'

  UNION ALL

  SELECT
    'member_profiles_rls_policies' as check_name,
    COUNT(*)::text as value
  FROM pg_policies
  WHERE tablename = 'member_profiles'
)

-- 모든 체크 결과 합치기
SELECT check_name, value FROM function_version
UNION ALL
SELECT check_name, value FROM rls_with_check
UNION ALL
SELECT check_name, value FROM storage_buckets
UNION ALL
SELECT check_name, value FROM storage_policies
UNION ALL
SELECT check_name, value FROM table_columns
UNION ALL
SELECT check_name, value FROM rls_policies
ORDER BY check_name;
