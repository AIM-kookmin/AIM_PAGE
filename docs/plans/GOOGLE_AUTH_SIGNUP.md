# 구글 로그인 및 승인제 회원가입 기획서

## 1. 개요
동아리 멤버 관리를 위해 **Google OAuth** 기반의 로그인을 도입하고, 신규 가입자는 관리자의 **승인**을 거쳐야 활동할 수 있는 시스템을 구축한다.

## 2. 사용자 시나리오 (User Flow)

### 2.1 신규 가입자 (New User)
1. **로그인 시도**: 로그인 페이지에서 "Google로 계속하기" 클릭
2. **구글 인증**: Google 계정 선택 및 인증
3. **프로필 확인 (자동)**: 시스템이 해당 구글 이메일로 등록된 `member_profiles`가 있는지 확인
4. **회원가입 페이지 이동**: 프로필이 없으므로 `/register` 페이지로 리다이렉트
   - 구글 이메일, 이름(display_name)은 자동 입력됨 (수정 가능)
5. **추가 정보 입력**: 학번, 학과, 기수, 연락처 등 입력 후 "가입 요청" 클릭
6. **대기 상태**: "가입 승인 대기 중입니다" 안내 페이지 표시

### 2.2 승인 대기자 (Pending User)
1. **로그인 시도**: Google 로그인
2. **상태 확인**: `status`가 `pending`임을 확인
3. **대기 안내**: 메인 페이지 진입 불가, 대기 안내 페이지로 리다이렉트 (로그아웃 버튼 포함)

### 2.3 승인된 멤버 (Active Member)
1. **로그인 시도**: Google 로그인
2. **접속 성공**: 메인 페이지 또는 대시보드로 이동

### 2.4 관리자 (Admin)
1. **가입 요청 확인**: 관리자 페이지 > 멤버 관리 > "가입 요청" 탭 확인
2. **승인/거절**: 신청자 정보를 확인하고 "승인" 또는 "거절" 처리
   - **승인**: `status` -> `active` (로그인 가능)
   - **거절**: `status` -> `rejected` (재가입 필요 또는 영구 거절)

## 3. 데이터베이스 변경 사항

### `member_profiles` 테이블
`status` 컬럼을 추가하여 멤버의 승인 상태를 관리한다.

```sql
-- ENUM 타입 생성 (PostgreSQL)
CREATE TYPE member_status AS ENUM ('pending', 'active', 'rejected');

-- 컬럼 추가
ALTER TABLE member_profiles 
ADD COLUMN status member_status DEFAULT 'pending';

-- 기존 멤버들은 모두 active로 설정
UPDATE member_profiles SET status = 'active';
```

## 4. UI/UX 설계

### 4.1 로그인 페이지 (`/login`)
- 기존 이메일/비밀번호 폼 유지 (관리자용 등)
- **Google 로그인 버튼**을 최상단에 강조하여 배치
- 디자인: Google 브랜드 가이드라인 준수 (흰색/파란색 버튼 + 로고)

### 4.2 회원가입 페이지 (`/register`)
- **진입 조건**: 인증된 세션이 있지만 프로필이 없는 경우
- **입력 폼**:
  - 이메일 (Read-only, 구글 계정 연동)
  - 이름 (Google Profile에서 가져오되 수정 가능)
  - 학번 (필수)
  - 학과 (필수)
  - 기수 (필수, 숫자)
  - 전화번호 (선택)
  - 자기소개 (선택)

### 4.3 멤버 관리 페이지 (`/admin/member-management`)
- **탭(Tab) UI 도입**:
  - [활동 멤버] (기존 목록)
  - [가입 요청] (status = 'pending' 필터링)
- **가입 요청 목록 액션**:
  - [승인] 버튼: 초록색, 즉시 active 처리
  - [거절] 버튼: 빨간색, rejected 처리 및 데이터 삭제(선택적)

## 5. 개발 로드맵

1. **DB 마이그레이션**: `status` 컬럼 추가
2. **Auth 기능 구현**: Google OAuth 연동, Callback 처리
3. **UI 구현**: 로그인, 회원가입, 대기 페이지
4. **Admin 구현**: 가입 요청 탭 및 승인 로직
