# Supabase 마이그레이션 계획

## 개요

Railway (Express + Prisma + PostgreSQL) → Supabase (Auth + DB + Storage) 이전

### 환경 구성
- **Development**: `aim-page-dev` Supabase 프로젝트
- **Production**: `aim-page-prod` Supabase 프로젝트

### 예상 소요 시간
- Phase 1 (환경 설정): 1일
- Phase 2 (인증 마이그레이션): 2-3일
- Phase 3 (DB 마이그레이션): 2-3일
- Phase 4 (Storage 마이그레이션): 1일
- Phase 5 (테스트 및 배포): 2일
- **총: 8-10일**

---

## Phase 1: 환경 설정 (1일)

### 1.1 Supabase 프로젝트 생성
```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결 (이미 생성된 경우)
supabase link --project-ref <dev-project-ref>
```

### 1.2 프로젝트 구조
```
aim-page/
├── supabase/
│   ├── config.toml           # Supabase 설정
│   ├── migrations/           # DB 마이그레이션
│   │   ├── 00001_initial_schema.sql
│   │   └── 00002_rls_policies.sql
│   ├── seed.sql              # 초기 데이터
│   └── functions/            # Edge Functions (필요시)
├── frontend/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts     # 브라우저용
│   │   │   ├── server.ts     # 서버용 (SSR)
│   │   │   └── middleware.ts # 미들웨어
│   │   └── ...
│   └── ...
└── ...
```

### 1.3 환경 변수 설정

**frontend/.env.local (dev)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # 서버 전용
```

**frontend/.env.production (prod)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://yyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJyyy...
SUPABASE_SERVICE_ROLE_KEY=eyJyyy...
```

### 1.4 패키지 설치
```bash
cd frontend
npm install @supabase/supabase-js @supabase/ssr
```

---

## Phase 2: 인증 마이그레이션 (2-3일)

### 2.1 Supabase Auth 설정

**Supabase Dashboard에서:**
1. Authentication → Providers → Email 활성화
2. Authentication → Providers → Google 설정
3. Authentication → Providers → Kakao 설정 (선택)
4. Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (dev) / `https://your-domain.com` (prod)
   - Redirect URLs: 위와 동일 + `/auth/callback`

### 2.2 Supabase 클라이언트 설정

**frontend/lib/supabase/client.ts**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**frontend/lib/supabase/server.ts**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

**frontend/middleware.ts**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 세션 갱신
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### 2.3 Auth Context 수정

**frontend/contexts/AuthContext.tsx** (새 버전)
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // 세션 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // user_metadata 또는 profiles 테이블에서 role 확인
  const isAdmin = user?.user_metadata?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAdmin,
      signInWithEmail,
      signInWithGoogle,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### 2.4 Auth Callback 라우트

**frontend/app/auth/callback/route.ts**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
```

### 2.5 기존 사용자 마이그레이션

```sql
-- 기존 users 테이블 데이터를 Supabase Auth로 이전
-- Supabase Dashboard > SQL Editor에서 실행

-- 1. profiles 테이블 생성 (auth.users 확장)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. 정책 설정
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## Phase 3: 데이터베이스 마이그레이션 (2-3일)

### 3.1 스키마 변환 (Prisma → SQL)

**supabase/migrations/00001_initial_schema.sql**
```sql
-- Member Profiles (auth.users 확장)
CREATE TABLE public.member_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  student_id TEXT,
  position TEXT,
  department TEXT,
  year TEXT,
  generation INT,
  bio TEXT,
  one_liner TEXT,
  avatar_url TEXT,
  links JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Studies
CREATE TABLE public.studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'public',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Posts
CREATE TABLE public.study_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  study_id UUID REFERENCES public.studies(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  cover_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags
CREATE TABLE public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Study Post Tags (다대다)
CREATE TABLE public.study_post_tags (
  post_id UUID REFERENCES public.study_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Activities
CREATE TABLE public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  gallery_urls JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recruit Notices
CREATE TABLE public.recruit_notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  is_open BOOLEAN DEFAULT false,
  external_form_url TEXT,
  target_audience TEXT,
  recruit_count TEXT,
  recruit_method TEXT,
  short_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- About Sections
CREATE TABLE public.about_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  "order" INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- About Activities
CREATE TABLE public.about_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  "order" INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- About History
CREATE TABLE public.about_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "order" INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- About Contacts
CREATE TABLE public.about_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  "order" INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_study_posts_author ON public.study_posts(author_id);
CREATE INDEX idx_study_posts_study ON public.study_posts(study_id);
CREATE INDEX idx_study_posts_status ON public.study_posts(status);
CREATE INDEX idx_member_profiles_user ON public.member_profiles(user_id);
```

### 3.2 RLS 정책

**supabase/migrations/00002_rls_policies.sql**
```sql
-- Enable RLS on all tables
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruit_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_contacts ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.member_profiles
    WHERE user_id = auth.uid()
    AND position = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Member Profiles
CREATE POLICY "Public profiles viewable by all" ON public.member_profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own profile" ON public.member_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.member_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.member_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can do anything on profiles" ON public.member_profiles
  FOR ALL USING (is_admin());

-- Study Posts
CREATE POLICY "Published posts viewable by all" ON public.study_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can view own posts" ON public.study_posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can insert posts" ON public.study_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts" ON public.study_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts" ON public.study_posts
  FOR DELETE USING (auth.uid() = author_id);

-- Activities (공개 읽기, 관리자만 수정)
CREATE POLICY "Activities viewable by all" ON public.activities
  FOR SELECT USING (true);

CREATE POLICY "Admins can modify activities" ON public.activities
  FOR ALL USING (is_admin());

-- Recruit Notices (공개 읽기, 관리자만 수정)
CREATE POLICY "Recruit notices viewable by all" ON public.recruit_notices
  FOR SELECT USING (true);

CREATE POLICY "Admins can modify recruit notices" ON public.recruit_notices
  FOR ALL USING (is_admin());

-- About 테이블들 (공개 읽기, 관리자만 수정)
CREATE POLICY "About sections viewable by all" ON public.about_sections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can modify about sections" ON public.about_sections
  FOR ALL USING (is_admin());

-- (about_activities, about_history, about_contacts도 동일 패턴)
```

### 3.3 타입 생성

```bash
# Supabase 타입 자동 생성
supabase gen types typescript --project-id <project-ref> > frontend/types/supabase.ts
```

### 3.4 API 클라이언트 교체

**frontend/lib/supabase/queries.ts**
```typescript
import { createClient } from './client'
import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']

// Study Posts
export async function getPublishedPosts() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('study_posts')
    .select(`
      *,
      author:member_profiles!author_id(display_name, avatar_url),
      tags:study_post_tags(tag:tags(name))
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getPostById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('study_posts')
    .select(`
      *,
      author:member_profiles!author_id(display_name, avatar_url),
      tags:study_post_tags(tag:tags(name))
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Members
export async function getPublicMembers() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('is_public', true)

  if (error) throw error
  return data
}

// Activities
export async function getActivities() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

// Recruit
export async function getActiveRecruit() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('recruit_notices')
    .select('*')
    .eq('is_open', true)
    .gte('end_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error  // PGRST116 = no rows
  return data
}
```

---

## Phase 4: Storage 마이그레이션 (1일)

### 4.1 Supabase Storage 버킷 생성

```sql
-- SQL Editor에서 실행
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('posts', 'posts', true),
  ('activities', 'activities', true);
```

### 4.2 Storage 정책

```sql
-- Avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Posts
CREATE POLICY "Post images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posts');

CREATE POLICY "Authors can upload post images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'posts' AND auth.uid() IS NOT NULL);
```

### 4.3 업로드 유틸리티

**frontend/lib/supabase/storage.ts**
```typescript
import { createClient } from './client'

export async function uploadAvatar(userId: string, file: File) {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path)

  return publicUrl
}

export async function uploadPostImage(file: File) {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('posts')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('posts')
    .getPublicUrl(data.path)

  return publicUrl
}
```

### 4.4 S3 → Supabase Storage 데이터 이전

```typescript
// scripts/migrate-storage.ts
// 기존 S3 이미지를 Supabase Storage로 복사
```

---

## Phase 5: 테스트 및 배포 (2일)

### 5.1 개발 환경 테스트 체크리스트

- [ ] 이메일/비밀번호 로그인
- [ ] Google 소셜 로그인
- [ ] 회원가입 + 이메일 도메인 검증
- [ ] 프로필 조회/수정
- [ ] 스터디 글 CRUD
- [ ] 이미지 업로드
- [ ] 관리자 기능 (멤버 관리, 콘텐츠 관리)
- [ ] 공개 페이지 (about, activities, recruit)

### 5.2 데이터 마이그레이션 (prod)

```bash
# 1. 기존 DB 데이터 export
pg_dump -h <railway-host> -U <user> -d <db> --data-only > data.sql

# 2. Supabase prod로 import
psql -h <supabase-host> -U postgres -d postgres < data.sql
```

### 5.3 배포 순서

1. **Vercel 환경 변수 업데이트** (prod)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **프론트엔드 배포**
   ```bash
   git push origin main  # Vercel 자동 배포
   ```

3. **Railway 백엔드 종료** (마이그레이션 완료 후)

### 5.4 롤백 계획

- Vercel에서 이전 배포로 롤백 가능
- Railway 백엔드는 마이그레이션 완료 확인 전까지 유지
- 최소 1주일 병행 운영 후 Railway 종료

---

## 삭제 대상 (마이그레이션 완료 후)

```
backend/                    # Express 백엔드 전체
├── src/
├── prisma/
└── ...

frontend/
├── lib/
│   ├── api-client.ts      # Supabase 쿼리로 대체
│   ├── api-config.ts      # 삭제
│   └── api.ts             # 삭제
└── app/api/               # Next.js API routes (대부분 삭제)
```

---

## 체크리스트 요약

### Phase 1: 환경 설정
- [ ] Supabase 프로젝트 생성 (dev, prod)
- [ ] supabase CLI 설정
- [ ] 패키지 설치 (@supabase/supabase-js, @supabase/ssr)
- [ ] 환경 변수 설정

### Phase 2: 인증
- [ ] Supabase 클라이언트 설정 (client, server, middleware)
- [ ] AuthContext 수정
- [ ] 로그인/회원가입 페이지 수정
- [ ] OAuth 콜백 라우트
- [ ] 소셜 로그인 설정 (Google, Kakao)

### Phase 3: 데이터베이스
- [ ] 스키마 마이그레이션 SQL 작성
- [ ] RLS 정책 설정
- [ ] 타입 생성
- [ ] API 클라이언트 (쿼리 함수) 작성
- [ ] 기존 컴포넌트에서 API 호출 교체

### Phase 4: Storage
- [ ] 버킷 생성
- [ ] Storage 정책 설정
- [ ] 업로드 유틸리티 작성
- [ ] 기존 S3 데이터 이전

### Phase 5: 배포
- [ ] 개발 환경 테스트
- [ ] 프로덕션 데이터 마이그레이션
- [ ] Vercel 환경 변수 업데이트
- [ ] 배포 및 검증
- [ ] Railway 종료
