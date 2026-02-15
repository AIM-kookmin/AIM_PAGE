# AIM (AI Monsters) - 동아리 웹사이트

국민대학교 AI 동아리 AIM의 공식 웹사이트입니다.

> **Live**: [aim-kookmin.com](https://aim-kookmin.com)
> **Preview**: Vercel Preview (dev branch)

---

## 📋 목차

- [기술 스택](#기술-스택)
- [주요 기능](#주요-기능)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [개발 가이드](#개발-가이드)
- [배포 워크플로우](#배포-워크플로우)
- [문서](#문서)

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion, GSAP
- **Smooth Scroll**: Lenis
- **Architecture**: Feature-Sliced Design (FSD)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Storage**: Supabase Storage
- **RLS**: Row Level Security

### Deployment
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions + Vercel
- **Domain**: aim-kookmin.com

### Design
- **Theme**: Modern Violet/Indigo Dark Mode
- **Style**: Glassmorphism, Subtle Glow Effects
- **Inspiration**: Linear.app, Vercel Dashboard

---

## ✨ 주요 기능

### 🌐 Public Pages

#### 메인 페이지
- Hero 섹션 (GSAP 애니메이션)
- 활동 섹션 (스크롤 트리거)
- **컴팩트 멤버 섹션** (최대 8명 표시, 가로 레이아웃)
- 성과 타임라인
- CTA 섹션

#### 소개 페이지
- 동아리 소개 섹션
- 활동 영역 (6가지)
- 연혁 타임라인
- **Contact 섹션** (아이콘 기반, 이메일 복사 기능)

#### 멤버 페이지
- 전체 부원 목록 (기수별 필터)
- **소셜 링크** (LinkedIn, GitHub, Instagram, Blog)
- 가로 레이아웃 카드 (4열 그리드)

#### 활동 페이지
- 활동 기록 목록 (카테고리별)
- 상세 모달 (이미지 캐러셀)
- 외부 링크 연동

#### 스터디 페이지
- 스터디 목록 (상태별)
- **4단계 난이도 시스템** (입문, 중급, 심화, 응용)
- 상세 모달 (참여 멤버, 기간, 설명)

#### 모집 페이지
- 모집 공고 목록
- 마감일 카운트다운
- 지원 링크

### 🔐 인증 & 회원

#### Google OAuth 로그인
- 이메일/비밀번호 제거 (보안 강화)
- Google 계정으로 간편 로그인
- 자동 리디렉션 (상태별)

#### 승인제 회원가입
- 회원 정보 입력 (학번, 학부, 기수, 자기소개)
- 관리자 승인 대기
- 승인 후 프로필 활성화

#### 프로필 관리
- 표시 이름, 직책, 학부, 기수
- 한 줄 소개
- **소셜 링크** 관리 (4개)
- 프로필 사진 업로드

### 🔧 관리자 기능

#### 회원 관리
- 가입 신청 승인/거절
- 회원 목록 조회
- 권한 관리 (일반/관리자)

#### 콘텐츠 관리
- **소개 페이지**: 섹션, 활동, 연혁, 연락처 관리
- **모집 공고**: 생성, 수정, 삭제, 순서 변경
- **활동 기록**: 이미지 업로드, 카테고리 설정
- **스터디**: 난이도 설정, 참여 멤버 관리

---

## 📁 프로젝트 구조

```
AIM_PAGE/
├── frontend/                    # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── (public)/       # 공개 페이지
│   │   │   │   ├── page.tsx           # 메인 페이지
│   │   │   │   ├── HomeClient.tsx     # 메인 클라이언트
│   │   │   │   ├── about/             # 소개
│   │   │   │   ├── members/           # 부원
│   │   │   │   ├── activities/        # 활동
│   │   │   │   ├── studies/           # 스터디
│   │   │   │   ├── recruit/           # 모집
│   │   │   │   ├── login/             # 로그인
│   │   │   │   ├── register/          # 회원가입
│   │   │   │   ├── profile/           # 프로필
│   │   │   │   └── pending/           # 승인 대기
│   │   │   ├── admin/          # 관리자 페이지
│   │   │   │   ├── member-management/
│   │   │   │   ├── about-management/
│   │   │   │   ├── recruit-management/
│   │   │   │   ├── activities-management/
│   │   │   │   └── studies-management/
│   │   │   └── providers/      # Context Providers
│   │   ├── widgets/            # 위젯 (Header, Footer, Hero, etc.)
│   │   ├── features/           # 기능 (AuthByEmail, etc.)
│   │   ├── entities/           # 엔티티 (User, etc.)
│   │   ├── shared/             # 공용 모듈
│   │   │   ├── api/            # Supabase 클라이언트
│   │   │   ├── ui/             # UI 컴포넌트
│   │   │   └── lib/            # 유틸리티
│   │   └── types/              # TypeScript 타입
│   ├── public/                 # 정적 파일
│   ├── tailwind.config.ts      # Tailwind 설정
│   └── package.json
├── supabase/
│   └── migrations/             # DB 마이그레이션
├── docs/                       # 문서
│   ├── architecture/           # FSD 구조
│   ├── design/                 # 디자인 시스템
│   ├── guides/                 # 가이드
│   └── plans/                  # 계획 문서
├── CLAUDE.md                   # AI 개발 가이드
├── AGENTS.md                   # OMC 에이전트 문서
└── README.md
```

### Feature-Sliced Design (FSD)

계층 구조 (상위 → 하위만 import 가능):

```
app       → widgets, features, entities, shared
widgets   → features, entities, shared
features  → entities, shared
entities  → shared
shared    → (no imports)
```

자세한 내용: [FSD 구조 문서](./docs/architecture/FSD_STRUCTURE.md)

---

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/JoonSimJoon/AIM_PAGE.git
cd AIM_PAGE
```

### 2. 환경 변수 설정

`frontend/.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
```

### 3. 의존성 설치

```bash
cd frontend
npm install
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 💻 개발 가이드

### 명령어 (frontend 디렉토리에서 실행)

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm start            # 프로덕션 서버
npm run lint         # ESLint 체크
npm run type-check   # TypeScript 타입 체크
npm test             # Jest 테스트
npm run test:watch   # 테스트 감시 모드
npm run test:coverage # 커버리지 리포트
```

### Git Hooks (Husky)

**Pre-commit:**
- ESLint auto-fix (staged files)
- TypeScript type check
- Prettier formatting

**Commit Message:**
- Conventional Commits 형식 권장
- 예: `feat:`, `fix:`, `docs:`, `chore:`

### 코드 스타일

- **TypeScript**: Strict mode
- **Formatting**: Prettier
- **Linting**: ESLint + Next.js config
- **Naming**: camelCase (변수/함수), PascalCase (컴포넌트)

### 디자인 가이드라인

- **Color Palette**: Violet/Indigo (#8b5cf6, #6366f1)
- **Background**: Pure Black (#000000)
- **Glass Effect**: `bg-white/[0.02] backdrop-blur-xl border border-white/10`
- **Hover Glow**: `hover:shadow-glow-primary`
- **Animation**: Framer Motion (scroll-triggered), GSAP (complex)

자세한 내용: [디자인 시스템](./docs/design/DESIGN_SYSTEM.md)

---

## 🔄 배포 워크플로우

### 브랜치 전략

```
origin/dev → fork/dev (Preview) → fork/prod (Production)
```

### 리모트 구성

- **origin**: `JoonSimJoon/AIM_PAGE` + `AIM-kookmin/AIM_PAGE` (dual push)
- **fork**: `AIM-kookmin/AIM_PAGE` (Vercel 연결)

### 배포 프로세스

#### 1. 개발 (Dev Branch)

```bash
# 작업 완료 후
git add .
git commit -m "feat: 새 기능 추가"
git push origin dev  # 양쪽 저장소에 push
```

자동으로 Vercel Preview 배포 (fork/dev)

#### 2. 프로덕션 배포 (Prod Branch)

1. GitHub에서 PR 생성: `dev` → `prod` (AIM-kookmin 저장소)
2. PR 리뷰 및 승인
3. PR 머지
4. Vercel 자동 배포 → aim-kookmin.com

### 환경별 설정

| 환경 | 브랜치 | Supabase | 도메인 | Revalidate |
|------|--------|----------|--------|------------|
| Development | `dev` | aim-dev | Vercel Preview | 60s |
| Production | `prod` | aim-prod | aim-kookmin.com | 60s |

자세한 내용: [배포 워크플로우](./docs/guides/DEPLOYMENT_WORKFLOW.md)

---

## 📚 문서

### Architecture
- [FSD 구조](./docs/architecture/FSD_STRUCTURE.md) - Feature-Sliced Design 가이드

### Design
- [디자인 시스템](./docs/design/DESIGN_SYSTEM.md) - 색상, 타이포그래피, 컴포넌트

### Guides
- [배포 워크플로우](./docs/guides/DEPLOYMENT_WORKFLOW.md) - Git 전략 및 배포 프로세스
- [데이터 마이그레이션](./docs/guides/DATA_MIGRATION.md) - DB 마이그레이션 가이드

### Plans
- [웹사이트 리뉴얼](./docs/plans/WEBSITE_RENEWAL.md) - 디자인 리뉴얼 로드맵

### Database
- [마이그레이션 가이드](./docs/database/MIGRATION_GUIDE.md) - Supabase 마이그레이션

---

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request to `dev` branch

---

## 📝 라이센스

MIT License

---

## 🔗 링크

- **Website**: [aim-kookmin.com](https://aim-kookmin.com)
- **GitHub**: [AIM-kookmin/AIM_PAGE](https://github.com/AIM-kookmin/AIM_PAGE)
- **Contact**: aim.club@kookmin.ac.kr

---

**Built with ❤️ by AIM (AI Monsters)**
