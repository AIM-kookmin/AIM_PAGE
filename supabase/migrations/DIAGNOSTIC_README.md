# Activities 생성 오류 진단 가이드

## 문제 상황
- **dev 환경**: 활동 생성 정상 작동 ✅
- **prod 환경**: 모든 계정에서 활동 생성 실패 (400 Bad Request) ❌

## 진단 순서

### 1단계: 함수 버전 확인
```sql
-- DIAGNOSTIC_01_is_admin_function.sql 실행
```
**기대 결과**: "✅ NULL 처리 있음 (00023 적용됨)"
**문제 발견 시**: is_admin() 함수가 NULL을 반환하여 RLS 정책 실패

### 2단계: RLS 정책 확인
```sql
-- DIAGNOSTIC_02_activities_rls_policies.sql 실행
```
**확인 사항**:
- `allow_admin_all` 정책이 `FOR ALL` 또는 `FOR INSERT`로 존재하는가?
- 정책의 USING 조건에 `public.is_admin()`이 포함되어 있는가?

### 3단계: 현재 사용자 테스트
```sql
-- DIAGNOSTIC_03_current_user_test.sql 실행
```
**⚠️ 주의**: 반드시 **브라우저에서 로그인한 상태**로 실행해야 합니다!

**기대 결과**: "✅ 관리자 권한 있음 - INSERT 가능"
**문제 패턴**:
- "❌ CRITICAL: is_admin()이 NULL 반환" → 함수 수정 필요
- "❌ 관리자 권한 없음" → position 필드 확인 필요

### 4단계: 전체 사용자 권한 확인
```sql
-- DIAGNOSTIC_04_all_users_status.sql 실행
```
**확인 사항**: prod에 관리자 권한을 가진 사용자가 있는가?

### 5단계: INSERT 시뮬레이션
```sql
-- DIAGNOSTIC_05_insert_simulation.sql 실행
```
**기대 결과**: "✅ PASSED: INSERT 가능합니다"

### 6단계: 환경 비교
```sql
-- DIAGNOSTIC_06_compare_environments.sql 실행
-- dev와 prod에서 각각 실행하여 결과 비교
```

## 예상되는 문제와 해결책

### 문제 A: is_admin() 함수가 NULL 반환
**원인**: 00023 migration이 prod에 적용되지 않음
**해결**:
```bash
# Supabase CLI로 migration 적용
cd D:\develop\AIM_PAGE
supabase db push --project-ref [PROD_PROJECT_ID]
```

또는 Supabase Dashboard에서 수동 적용:
```sql
-- 00023_fix_is_admin_null_handling.sql의 내용을 복사하여 실행
```

### 문제 B: 모든 사용자의 position이 NULL 또는 '부원'
**원인**: migration 00021이 prod에 적용되지 않음
**해결**:
```sql
-- 임시로 특정 사용자에게 관리자 권한 부여
UPDATE public.member_profiles
SET position = '관리자'
WHERE display_name = '(소프트웨어융합대학)AIM(공용)';
```

### 문제 C: RLS 정책이 없음
**원인**: migration이 순서대로 적용되지 않음
**해결**: 전체 migration을 순서대로 재적용

## Dev와 Prod 환경 차이 확인 방법

1. **Dev 환경**에서 DIAGNOSTIC_06 실행 → 결과 저장
2. **Prod 환경**에서 DIAGNOSTIC_06 실행 → 결과 저장
3. 두 결과를 비교하여 차이점 확인

## 빠른 수정 (임시)

만약 급하게 prod를 고쳐야 한다면:

```sql
-- 1. is_admin() 함수 수정
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT position IN ('운영진', '관리자', '회장')
      FROM public.member_profiles
      WHERE user_id = auth.uid()
    ),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 현재 로그인한 사용자에게 관리자 권한 부여 (본인 이름으로 변경)
UPDATE public.member_profiles
SET position = '관리자'
WHERE user_id = auth.uid();
```

## 실행 방법

1. Supabase Dashboard 접속
2. 프로젝트 선택 (dev 또는 prod)
3. SQL Editor 메뉴 선택
4. 위 SQL 파일들을 순서대로 실행
5. 결과를 비교하여 문제 파악
