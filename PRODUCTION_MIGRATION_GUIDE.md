# Production 마이그레이션 가이드

## ⚠️ 현재 상황

Production 데이터베이스에서 다음 오류 발생:
```
column studies.start_date does not exist
```

**원인**: `00008_improve_studies_table.sql` 마이그레이션이 production DB에 적용되지 않음

## 📦 적용 필요한 마이그레이션

다음 마이그레이션들이 production에 적용되어야 합니다:

1. **00008_improve_studies_table.sql** ⭐ (start_date 추가)
2. **00009_improve_study_posts_table.sql** (study_posts 개선)
3. **00010_add_study_members_table.sql** (study_members 테이블 생성)
4. **00011_add_link_to_activities.sql** (활동 링크 필드)
5. **00012_remove_year_from_member_profiles.sql** (멤버 프로필 정리)
6. **00013_secure_storage_policies.sql** (스토리지 보안)
7. **00014_add_study_images_participants.sql** (스터디 이미지/참여자)
8. **00015_remove_studies_category.sql** (카테고리 제거)
9. **00016_make_public_buckets.sql** (버킷 공개 설정)
10. **00017_update_studies_rls_policy.sql** ⭐ (RLS 정책 업데이트)

**✅ 마이그레이션 의존성 해결됨** - 올바른 순서로 적용되도록 수정 완료

## 🚀 적용 방법

### 1단계: Access Token 설정

```bash
# Supabase 대시보드에서 토큰 생성
# https://supabase.com/dashboard/account/tokens

export SUPABASE_ACCESS_TOKEN=<your-token>
```

### 2단계: Production 마이그레이션 실행

```bash
# 안전한 프로덕션 마이그레이션 스크립트 실행
./apply-migrations-prod.sh
```

스크립트는 다음을 수행합니다:
- ⚠️ 확인 프롬프트 표시
- 🔗 Production Supabase 프로젝트 연결
- 📋 적용 대기 중인 마이그레이션 확인
- ⚡ 마이그레이션 적용
- ✅ 스키마 검증

### 3단계: 검증

마이그레이션 적용 후:

```bash
# Production 사이트 확인
# https://aim-kookmin.com/studies

# 오류가 사라졌는지 확인
```

## 🔒 안전 수칙

### 백업 확인
Supabase는 자동으로 백업을 수행하지만, 중요한 데이터가 있다면:
1. Supabase Dashboard → Database → Backups 확인
2. 필요시 수동 백업 실행

### 롤백 계획
문제 발생 시:
1. Supabase Dashboard → Database → Backups
2. 최근 백업으로 복원

### 단계별 적용 (옵션)
리스크를 최소화하려면 한 번에 하나씩:

```bash
# 1. 프로젝트 연결
supabase link --project-ref gttkvtlkjdusbortnbiz

# 2. 특정 마이그레이션만 적용 (수동)
# Supabase Dashboard → SQL Editor에서 직접 실행

# 3. 전체 적용
supabase db push
```

## 📊 예상 영향

### studies 테이블
- 새 컬럼 추가: start_date, end_date, status, difficulty, 등
- 기존 데이터는 영향 없음 (모두 NULL 허용 또는 기본값 있음)

### study_posts 테이블
- 새 컬럼 추가: excerpt, read_time, view_count, published_at
- 자동 트리거 추가 (excerpt, read_time 자동 계산)

### study_members 테이블
- 새 테이블 생성 (비어있는 상태로 시작)

### RLS Policies
- studies 접근 제어 강화
- storage 보안 정책 업데이트

## ⏱️ 예상 소요 시간

- 적용 시간: 약 5-10초
- 다운타임: 없음 (무중단 마이그레이션)

## 🐛 트러블슈팅

### "already linked" 오류
```bash
supabase link --project-ref gttkvtlkjdusbortnbiz
```

### "permission denied" 오류
- SUPABASE_ACCESS_TOKEN 권한 확인
- 토큰 재생성 필요할 수 있음

### 마이그레이션 충돌
- Supabase Dashboard에서 현재 스키마 확인
- 필요시 충돌하는 테이블/컬럼 수동 삭제

## ✅ 완료 체크리스트

- [ ] Access Token 설정
- [ ] Production 백업 확인
- [ ] `./apply-migrations-prod.sh` 실행
- [ ] "yes" 입력하여 확인
- [ ] 마이그레이션 성공 메시지 확인
- [ ] Production 사이트 동작 확인 (https://aim-kookmin.com/studies)
- [ ] 콘솔 오류 없는지 확인

## 📞 문제 발생 시

1. 즉시 롤백 (Supabase Dashboard → Backups)
2. 로그 캡처 및 공유
3. #dev-emergency 채널 알림
