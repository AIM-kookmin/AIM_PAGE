-- ============================================================================
-- Storage Bucket 및 정책 진단
-- ============================================================================
-- Dev와 Prod에서 각각 실행하여 결과 비교
-- ============================================================================

-- ============================================================================
-- 1. 버킷 설정 확인
-- ============================================================================
SELECT
  '=== 버킷 설정 ===' as "섹션";

SELECT
  id as "버킷_ID",
  name as "버킷_이름",
  CASE
    WHEN public THEN '✅ Public'
    ELSE '❌ Private'
  END as "공개_여부",
  file_size_limit as "파일크기제한",
  allowed_mime_types as "허용_MIME_타입",
  created_at as "생성일"
FROM storage.buckets
WHERE id IN ('activities', 'studies', 'members')
ORDER BY id;

-- ============================================================================
-- 2. Storage 정책 확인 (핵심!)
-- ============================================================================
SELECT
  '=== Storage 정책 ===' as "섹션";

SELECT
  policyname as "정책명",
  CASE cmd
    WHEN 'SELECT' THEN '조회'
    WHEN 'INSERT' THEN '업로드'
    WHEN 'UPDATE' THEN '수정'
    WHEN 'DELETE' THEN '삭제'
    WHEN 'ALL' THEN '모두'
  END as "명령",
  roles as "역할",
  CASE
    WHEN qual IS NOT NULL THEN '✅'
    ELSE '❌'
  END as "USING",
  CASE
    WHEN with_check IS NOT NULL THEN '✅'
    ELSE '❌'
  END as "WITH_CHECK",
  CASE
    WHEN with_check IS NULL AND cmd IN ('INSERT', 'UPDATE')
    THEN '🚨 업로드 불가!'
    ELSE '✅ 정상'
  END as "상태"
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (
    qual LIKE '%activities%' OR
    qual LIKE '%studies%' OR
    with_check LIKE '%activities%' OR
    with_check LIKE '%studies%'
  )
ORDER BY policyname;

-- ============================================================================
-- 3. Storage 정책 상세 (버킷별)
-- ============================================================================
SELECT
  '=== Activities 버킷 정책 ===' as "섹션";

SELECT
  policyname as "정책명",
  cmd as "명령",
  qual as "USING_조건",
  with_check as "WITH_CHECK_조건"
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (qual LIKE '%activities%' OR with_check LIKE '%activities%')
ORDER BY cmd;

SELECT
  '=== Studies 버킷 정책 ===' as "섹션";

SELECT
  policyname as "정책명",
  cmd as "명령",
  qual as "USING_조건",
  with_check as "WITH_CHECK_조건"
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (qual LIKE '%studies%' OR with_check LIKE '%studies%')
ORDER BY cmd;

-- ============================================================================
-- 4. 버킷 생성 여부 확인
-- ============================================================================
SELECT
  '=== 버킷 존재 여부 ===' as "섹션";

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'activities')
    THEN '✅ activities 버킷 존재'
    ELSE '❌ activities 버킷 없음'
  END as "activities",
  CASE
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'studies')
    THEN '✅ studies 버킷 존재'
    ELSE '❌ studies 버킷 없음'
  END as "studies",
  CASE
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'members')
    THEN '✅ members 버킷 존재'
    ELSE '❌ members 버킷 없음'
  END as "members";

-- ============================================================================
-- 5. 업로드 권한 테스트 (시뮬레이션)
-- ============================================================================
SELECT
  '=== 업로드 권한 체크 ===' as "섹션";

-- Activities 버킷 INSERT 정책 체크
WITH activities_insert_policies AS (
  SELECT COUNT(*) as policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND cmd IN ('INSERT', 'ALL')
    AND with_check LIKE '%activities%'
)
SELECT
  CASE
    WHEN policy_count > 0
    THEN '✅ activities 업로드 정책 있음 (' || policy_count || '개)'
    ELSE '❌ activities 업로드 정책 없음'
  END as "activities_업로드"
FROM activities_insert_policies;

-- Studies 버킷 INSERT 정책 체크
WITH studies_insert_policies AS (
  SELECT COUNT(*) as policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND cmd IN ('INSERT', 'ALL')
    AND with_check LIKE '%studies%'
)
SELECT
  CASE
    WHEN policy_count > 0
    THEN '✅ studies 업로드 정책 있음 (' || policy_count || '개)'
    ELSE '❌ studies 업로드 정책 없음'
  END as "studies_업로드"
FROM studies_insert_policies;

-- ============================================================================
-- 6. 요약 (가장 중요)
-- ============================================================================
SELECT
  '=== 🎯 Storage 진단 요약 ===' as "섹션";

WITH bucket_check AS (
  SELECT
    (SELECT public FROM storage.buckets WHERE id = 'activities') as activities_public,
    (SELECT public FROM storage.buckets WHERE id = 'studies') as studies_public,
    EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'activities') as activities_exists,
    EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'studies') as studies_exists
),
policy_check AS (
  SELECT
    COUNT(*) FILTER (WHERE cmd IN ('INSERT', 'ALL') AND with_check LIKE '%activities%') as activities_upload_policies,
    COUNT(*) FILTER (WHERE cmd IN ('INSERT', 'ALL') AND with_check LIKE '%studies%') as studies_upload_policies
  FROM pg_policies
  WHERE schemaname = 'storage' AND tablename = 'objects'
)
SELECT
  CASE
    WHEN bc.activities_exists AND bc.activities_public AND pc.activities_upload_policies > 0
    THEN '✅ activities: 정상'
    WHEN NOT bc.activities_exists
    THEN '❌ activities: 버킷 없음'
    WHEN NOT bc.activities_public
    THEN '⚠️  activities: Private (00016 미적용?)'
    WHEN pc.activities_upload_policies = 0
    THEN '❌ activities: 업로드 정책 없음'
    ELSE '❓ activities: 알 수 없는 상태'
  END as "activities_상태",
  CASE
    WHEN bc.studies_exists AND bc.studies_public AND pc.studies_upload_policies > 0
    THEN '✅ studies: 정상'
    WHEN NOT bc.studies_exists
    THEN '❌ studies: 버킷 없음'
    WHEN NOT bc.studies_public
    THEN '⚠️  studies: Private (00016 미적용?)'
    WHEN pc.studies_upload_policies = 0
    THEN '❌ studies: 업로드 정책 없음'
    ELSE '❓ studies: 알 수 없는 상태'
  END as "studies_상태"
FROM bucket_check bc, policy_check pc;
