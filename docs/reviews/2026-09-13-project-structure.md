# 프로젝트·페이지 구조 검토

검토 대상: `D:\develop\AIM_PAGE`, `AIM-kookmin/AIM_PAGE`의 `dev` (`5e238c2`).
원격에는 `main`이 없으며 사용자가 `dev` 대상 PR을 선택했다.

## 구조와 페이지 지도

Next.js 14 App Router 프런트엔드와 Supabase로 구성된다. 별도 백엔드는 제거되어
있고 FSD는 부분 적용 상태다. 공개 데이터 페이지는 서버에서 조회한 뒤
`*Client.tsx`에 전달한다. 관리자 CRUD는 서버 레이아웃에서 접근을 확인하고
클라이언트에서 RLS가 적용되는 Supabase를 호출한다.

| 경로 | 역할 / 접근 |
| --- | --- |
| `/` | 동아리 소개, 활동, 연혁, 모집 CTA |
| `/about`, `/members`, `/activities` | 공개 소개·부원·활동 목록 |
| `/studies` | 공개 스터디 목록 및 상세 모달 |
| `/studies/[id]` | 공개된 **스터디 포스트** 상세. 스터디 자체의 ID와 다름 |
| `/news`, `/recruit` | 공개 뉴스와 모집 공고·FAQ |
| `/login`, `/register` | Google OAuth 로그인과 가입 신청 |
| `/pending` | 로그인한 회원의 승인 상태 확인 |
| `/profile` | 승인된 회원의 본인 프로필 |
| `/admin` | 관리자 대시보드 |
| `/admin/{about,member,activities,studies,news,recruit}-management` | 관리자 CRUD |
| `/auth/callback` | OAuth 코드 교환, 회원 상태에 따른 이동 |
| `/api/admin/members` | 서버에서 관리자 확인 후 계정 생성·삭제 |
| `/api/images/[...path]` | Storage 공개/서명 URL로 이동 |

## 확인된 문제와 수정

| 문제 | 영향 | 수정 |
| --- | --- | --- |
| 본인 프로필 RLS가 직책·승인 상태 변경을 제한하지 않음 | 직접 API 호출로 권한 변경 가능. `is_admin()`도 승인 여부를 확인하지 않았음 | `00027` 마이그레이션에 권한 필드 보호 트리거와 승인 상태 검사 추가. 본인 프로필 저장에서 직책 제외, API에서도 승인 상태 확인 |
| Supabase 리다이렉트 응답에서 쿠키 누락 | 세션 갱신·거절 계정 로그아웃이 브라우저에 반영되지 않을 수 있음 | 갱신/삭제 쿠키를 새 응답에 복사하고 캐시 방지 |
| 전역 AuthProvider에서 페이지 강제 이동 | 가입 대기 회원이 공개 페이지를 보는 중에도 이동됨 | Provider는 인증/UI 상태만 제공. 보호 경로와 가입 페이지가 이동을 담당 |
| 인증 콜백 안에서 DB 요청, 오래된 관리자 조회 응답 | 인증 잠금 대기 및 로그아웃 후 오래된 권한 표시 가능 | 콜백 밖으로 조회를 지연하고 세션 변경 순서로 결과 무효화 |
| 로그인 후 원래 목적지 유실 | `/admin/news-management` 진입 후 로그인하면 홈으로 이동 | `next`를 미들웨어 → 로그인 → OAuth 콜백까지 전달, 내부 경로 검증 |
| 조회 오류와 미가입을 동일 취급 | DB 장애 시 가입 페이지로 잘못 이동 | 조회 오류와 프로필 부재를 구분 |
| 잘못된 스터디 작성자 FK 조회 | 포스트 상세가 조회 실패 후 “없음”으로 표시 | `author_id`는 `auth.users.id`이므로 프로필의 `user_id`로 별도 조회. 타입과 회원 삭제 필터도 정정 |
| 상세 페이지의 클라이언트 조회·오류/404 경계 부재 | 초기 로딩 증가, 실패 복구 어려움 | 포스트 서버 렌더링·메타데이터, ID 검증, 미존재 처리, 공통 오류/404 UI |
| 뉴스 `index.ts`에서 서버 조회까지 내보냄 | 클라이언트 import가 쿠키 모듈을 포함할 가능성 | `server.ts`로 분리, 서버 모듈에 `server-only` 적용 |
| 뉴스 테이블 타입 누락 | CRUD에 `any` 우회 사용 | Database 계약 보완, `any` 제거 |
| 관리자 메뉴 복제·모바일 뉴스 메뉴 누락 | 화면 크기에 따라 가능한 관리 기능이 달라짐 | 한 메뉴 목록을 모바일·데스크톱에서 공유, 포커스/스크롤 관리 |
| 관리자 화면에도 전역 부드러운 스크롤 적용, ticker 정리 누락 | 불필요한 전역 효과 및 Strict Mode 재등록 누적 | 공개 레이아웃으로 한정, GSAP ticker cleanup |
| 동일 Notification 3개와 다른 페이지 컴포넌트 참조 | 페이지 간 결합과 수정 중복 | `shared/ui/Notification.tsx` 하나로 통합 |
| Next 14에 Next 15 전용 설정·과거 NextAuth secret 공개 설정 | 설정 경고, 불필요한 비밀값 번들 삽입 경로 | 사용하지 않는 Prisma 옵션과 NextAuth `env` 항목 제거 |
| 과거 백엔드 설정·문서·Git 추적 캐시 | 잘못된 실행 안내와 불필요한 변경 파일 | Supabase 환경 예제, shared 설정, App Router/FSD/브랜치 문서 정리. tsbuildinfo 추적 해제 |
| CI 브랜치가 main/develop이고 실패를 무시 | dev/prod PR 검사가 빠지고 실패가 통과로 보임 | 실제 브랜치 적용, 오류 무시 제거, Jest/DB 검증 추가, 비밀값 없는 빌드 설정 |
| 기존 모달 테스트의 고정 높이 가정 | 반응형 변경 이후 테스트 실패 | 현재 반응형 높이 제약을 검증하도록 수정 |

## 검증

프런트엔드에서 순서대로 실행한다. `type-check`와 `build`는 같은 `.next/types`
파일을 사용하므로 동시에 실행하지 않는다.

```bash
npm ci
npm run lint
npm run type-check
npm test -- --runInBand
npm run test:db
npm run build
```

- Jest: 12 suites, 141 passed, 기존 1 skipped.
- PGlite PostgreSQL: 14 passed. 실제 마이그레이션 SQL을 실행하고 RLS/트리거로
  본인 수정·권한 변경 거절·가입·관리자 승인·service-role 작업을 검증했다.
- TypeScript 및 프로덕션 빌드 통과. 기존 미사용 변수/Hook 의존성 경고는 남아 있다.
- 포스트 상세 초기 JS: 같은 로컬 빌드 기준 약 532KB → 96KB.
- Edge/Playwright 로컬 프로덕션 브라우저 확인: 공개/인증/404 경로 11개,
  보호 경로 4개의 로그인 이동 및 `next` 보존, 375px 모바일 메뉴→뉴스 이동,
  가로 넘침 없음, 브라우저 실행 예외 없음.
- 현재 `.env.local`의 Supabase 호스트가 `ENOTFOUND`로 연결되지 않았다.
  `/about`, `/members`, `/activities`, `/studies`, `/news`에서는 추가한 오류 복구
  화면을 확인했다. **실제 데이터의 정상 렌더링 검증은 완료하지 못했다.**
  정상 Supabase 환경 변수로 다시 확인해야 한다. 홈/모집의 기존 기본값·빈 목록
  동작은 DB 연결 성공을 뜻하지 않는다.
- App Router 스트리밍 후의 오류/미존재 UI는 HTTP 200으로 전달될 수 있다.
  존재하지 않는 일반 경로는 HTTP 404로 확인했다.
- 실제 Google 로그인 및 운영 계정 CRUD는 실행하지 않았다.

## DB 적용

`supabase/migrations/00027_protect_member_permissions.sql`은 리뷰 및 배포용 파일이다.
이번 작업에서 실제 Supabase에는 적용하지 않았다. 권한 보호는 이 SQL을 해당
환경에 적용해야 완성된다. 검증된 `dev` DB부터 적용한 뒤 일반 회원의 프로필
저장, 신규 가입, 운영진의 승인/직책 변경을 확인하고 운영 환경으로 진행한다.

기존 마이그레이션에는 `00021`, `00022`의 중복 번호, 진단 SQL, 과거 전체 직책
갱신 SQL이 섞여 있다. 이미 배포된 이력을 임의로 재번호 부여하거나 전체 재실행하지
않았다. 실제 `schema_migrations` 이력을 먼저 대조한 뒤 별도 정리해야 한다.

## 후속 개선 범위

- 관리자 일부 페이지가 매우 크고 데이터 로딩·폼·미리보기·알림 상태를 함께 가진다.
  도메인별 `features`/`entities`로 단계적으로 추출할 수 있다.
- 공개 서버 조회가 쿠키 클라이언트를 사용해 `revalidate = 60`만으로 ISR이 되지
  않는다. 익명 캐시 도입은 공개 데이터 범위와 갱신 정책을 함께 설계해야 한다.
- `types/database.ts`와 `types/supabase.ts`는 아직 수동 계약이 섞여 있다. 실제 DB
  스키마에서 생성하는 단일 계약으로 이전하는 작업이 남아 있다.
- 기존 의존성의 보안 업데이트와 린트 경고 정리는 별도 업그레이드 검증이 필요하다.

## 구현 기준

- [Next.js 14 서버/클라이언트 구성](https://nextjs.org/docs/14/app/building-your-application/rendering/composition-patterns)
- [Next.js 14 env 설정의 번들 동작](https://nextjs.org/docs/14/pages/api-reference/next-config-js/env)
- [Supabase SSR 쿠키 갱신](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase 인증 상태 이벤트](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
