# AIM: AI Monsters - 동아리 웹사이트

국민대학교 AI 동아리 AIM의 공식 웹사이트입니다.

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Architecture**: Feature-Sliced Design (FSD)
- **Deployment**: Vercel
- **Design System**: Modern Violet Theme

## 프로젝트 구조

```
├── frontend/                 # Next.js 프론트엔드
│   └── src/
│       ├── app/             # Next.js App Router
│       │   ├── (public)/    # 공개 페이지
│       │   ├── admin/       # 관리자 페이지
│       │   └── providers/   # Context Providers
│       ├── shared/          # 공용 모듈
│       │   ├── api/         # Supabase 클라이언트
│       │   └── ui/          # 공용 컴포넌트
│       ├── entities/        # 엔티티 (멤버 등)
│       ├── widgets/         # 위젯 (네비게이션 등)
│       └── types/           # TypeScript 타입
├── supabase/
│   └── migrations/          # DB 마이그레이션
└── docs/                    # 문서
    ├── guides/              # 가이드 문서
    ├── plans/               # 계획 문서
    └── design/              # 디자인 시스템
```

## 시작하기

### 1. 의존성 설치
```bash
cd frontend
npm install
```

### 2. 환경 변수 설정
`frontend/.env.local` 생성:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 접속
- http://localhost:3000

## 주요 기능

### 공개 페이지
- 메인 페이지 및 동아리 소개
- 부원 목록
- 활동 및 스터디 기록
- 모집 공고

### 회원 기능
- Google OAuth 로그인
- 승인제 회원가입
- 프로필 관리

### 관리자 기능
- 회원 승인/거절
- 소개 페이지 관리
- 모집 공고 관리
- 활동/스터디 관리

## 배포 워크플로우

```
origin/dev → fork/dev → fork/prod
   (개발)      (Preview)   (Production)
```

| 환경 | 브랜치 | Supabase | 도메인 |
|------|--------|----------|--------|
| Dev | `dev` | aim-dev | Preview URL |
| Prod | `prod` | aim-prod | aim-kookmin.com |

자세한 내용은 [배포 가이드](./docs/guides/DEPLOYMENT_WORKFLOW.md) 참고.

## 문서

- [FSD 구조](./docs/architecture/FSD_STRUCTURE.md)
- [디자인 시스템](./docs/design/DESIGN_SYSTEM.md)
- [배포 워크플로우](./docs/guides/DEPLOYMENT_WORKFLOW.md)
- [Supabase 마이그레이션](./docs/plans/SUPABASE_MIGRATION.md)

## 라이센스

MIT License
