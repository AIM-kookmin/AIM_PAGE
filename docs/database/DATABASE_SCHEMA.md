# AIM Database Schema Documentation

## 📊 Overview

This document describes the complete database schema for the AIM (AI Monsters) website, including all tables, relationships, and business logic.

---

## 📋 Tables Summary

| Table | Purpose | Migration File |
|-------|---------|----------------|
| `activities` | 동아리 활동 기록 (대회, 세미나, 프로젝트 등) | 00004, 00007 |
| `studies` | 스터디 그룹 관리 | 00004, 00008 |
| `study_posts` | 스터디 학습 포스트 | 00004, 00009 |
| `study_members` | 스터디 그룹 멤버십 | 00010 |
| `tags` | 포스트 태그 | 00004 |
| `study_post_tags` | 포스트-태그 연결 (Many-to-Many) | 00004 |
| `about_sections` | About 페이지 섹션 | 00001 |
| `about_activities` | About 페이지 주요 활동 | 00001 |
| `about_history` | About 페이지 연혁 | 00001, 00006 |
| `about_contacts` | About 페이지 연락처 | 00001 |
| `recruit_notices` | 모집 공고 | 00001 |
| `member_profiles` | 부원 프로필 | 00003, 00005 |

---

## 🎯 Activities Table

**용도**: 동아리 활동 기록 (대회, 세미나, 워크샵, 프로젝트 등)

### Schema

```sql
CREATE TABLE public.activities (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  image_url TEXT,
  gallery_urls JSONB,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  location TEXT,
  participants INTEGER,
  organizer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `title` | TEXT | Yes | 활동 제목 (예: "2024 AI 해커톤") |
| `category` | TEXT | Yes | 카테고리: competition, seminar, workshop, project, social |
| `date` | DATE | Yes | 활동 날짜 |
| `description` | TEXT | No | 상세 설명 (마크다운 지원) |
| `image_url` | TEXT | No | 대표 이미지 URL |
| `gallery_urls` | JSONB | No | 갤러리 이미지 URLs (JSON 배열) |
| `is_active` | BOOLEAN | No | 공개 여부 (기본: true) |
| `order` | INTEGER | No | 정렬 순서 (낮을수록 먼저) |
| `location` | TEXT | No | 활동 장소 |
| `participants` | INTEGER | No | 참가자 수 |
| `organizer` | TEXT | No | 주최자/담당자 |
| `created_at` | TIMESTAMPTZ | No | 생성 시간 |
| `updated_at` | TIMESTAMPTZ | No | 수정 시간 |

### Indexes

```sql
CREATE INDEX idx_activities_date ON activities(date DESC);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_order ON activities("order" DESC);
CREATE INDEX idx_activities_is_active ON activities(is_active);
```

### RLS Policies

- **Public Read**: 모든 사용자가 조회 가능
- **Admin All**: 관리자는 모든 작업 가능

### Example Data

```json
{
  "title": "2024 Kaggle Competition 참가",
  "category": "competition",
  "date": "2024-05-15",
  "description": "## 대회 개요\n- 주제: 이미지 분류\n- 참가자: 5명",
  "image_url": "https://storage.../competition.jpg",
  "gallery_urls": ["url1.jpg", "url2.jpg", "url3.jpg"],
  "is_active": true,
  "order": 1,
  "location": "온라인",
  "participants": 5,
  "organizer": "김철수"
}
```

---

## 📚 Studies Table

**용도**: 스터디 그룹 관리 (ML, DL, 알고리즘, 논문 등)

### Schema

```sql
CREATE TABLE public.studies (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'active',
  visibility TEXT DEFAULT 'public',
  start_date DATE,
  end_date DATE,
  max_members INTEGER DEFAULT 10,
  current_members INTEGER DEFAULT 0,
  is_recruiting BOOLEAN DEFAULT true,
  difficulty TEXT DEFAULT 'beginner',
  schedule TEXT,
  meeting_type TEXT DEFAULT 'offline',
  cover_url TEXT,
  syllabus TEXT,
  prerequisites TEXT,
  "order" INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `title` | TEXT | Yes | 스터디 이름 |
| `description` | TEXT | No | 스터디 설명 (마크다운) |
| `category` | TEXT | No | ml, dl, algorithm, paper, project, general |
| `status` | TEXT | No | recruiting, active, completed, cancelled |
| `visibility` | TEXT | No | public, private, members_only |
| `start_date` | DATE | No | 시작일 |
| `end_date` | DATE | No | 종료일 |
| `max_members` | INTEGER | No | 최대 인원 (기본: 10) |
| `current_members` | INTEGER | No | 현재 인원 (자동 계산) |
| `is_recruiting` | BOOLEAN | No | 모집 중 여부 |
| `difficulty` | TEXT | No | beginner, intermediate, advanced |
| `schedule` | TEXT | No | 일정 (예: "매주 화/목 19:00-21:00") |
| `meeting_type` | TEXT | No | offline, online, hybrid |
| `cover_url` | TEXT | No | 커버 이미지 URL |
| `syllabus` | TEXT | No | 커리큘럼/강의 계획 (마크다운) |
| `prerequisites` | TEXT | No | 선수 조건 |
| `order` | INTEGER | No | 정렬 순서 |
| `created_by` | UUID | No | 생성자 (auth.users FK) |
| `created_at` | TIMESTAMPTZ | No | 생성 시간 |
| `updated_at` | TIMESTAMPTZ | No | 수정 시간 |

### Indexes

```sql
CREATE INDEX idx_studies_category ON studies(category);
CREATE INDEX idx_studies_status ON studies(status);
CREATE INDEX idx_studies_is_recruiting ON studies(is_recruiting);
CREATE INDEX idx_studies_order ON studies("order" DESC);
```

### RLS Policies

- **Public Read Active**: public이고 active/completed 상태만 조회 가능
- **Member Read All**: 로그인한 회원은 모든 스터디 조회 가능
- **Admin All**: 관리자는 모든 작업 가능

### Example Data

```json
{
  "title": "Deep Learning 입문 스터디",
  "description": "PyTorch를 활용한 딥러닝 기초 학습",
  "category": "dl",
  "status": "recruiting",
  "visibility": "public",
  "start_date": "2024-03-01",
  "end_date": "2024-06-30",
  "max_members": 8,
  "current_members": 5,
  "is_recruiting": true,
  "difficulty": "beginner",
  "schedule": "매주 수요일 19:00-21:00",
  "meeting_type": "hybrid",
  "syllabus": "## 커리큘럼\n1주차: PyTorch 기초\n2주차: CNN...",
  "prerequisites": "Python 기초, 선형대수 기본 지식"
}
```

---

## 📝 Study Posts Table

**용도**: 스터디 학습 포스트 (블로그 형식)

### Schema

```sql
CREATE TABLE public.study_posts (
  id UUID PRIMARY KEY,
  study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  excerpt TEXT,
  cover_url TEXT,
  status TEXT DEFAULT 'draft',
  read_time INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `study_id` | UUID | No | 스터디 그룹 FK (NULL 가능 - 일반 포스트) |
| `author_id` | UUID | Yes | 작성자 (auth.users FK) |
| `title` | TEXT | Yes | 포스트 제목 |
| `content_md` | TEXT | Yes | 마크다운 본문 |
| `excerpt` | TEXT | No | 요약문 (자동 생성 또는 수동) |
| `cover_url` | TEXT | No | 커버 이미지 URL |
| `status` | TEXT | No | draft, published, archived |
| `read_time` | INTEGER | No | 예상 읽기 시간 (분, 자동 계산) |
| `view_count` | INTEGER | No | 조회수 (기본: 0) |
| `like_count` | INTEGER | No | 좋아요 수 (기본: 0) |
| `order` | INTEGER | No | 정렬 순서 (스터디 내 순서) |
| `published_at` | TIMESTAMPTZ | No | 최초 게시 시간 (자동 설정) |
| `created_at` | TIMESTAMPTZ | No | 생성 시간 |
| `updated_at` | TIMESTAMPTZ | No | 수정 시간 |

### Auto-Generated Fields

#### Excerpt (자동 생성)
- `content_md`에서 첫 200자 추출
- 마크다운 문법 제거
- Trigger: `generate_study_post_excerpt`

#### Read Time (자동 계산)
- 단어 수 / 200 (분당 200단어 기준)
- Trigger: `calculate_study_post_read_time`

#### Published At (자동 설정)
- `status`가 `draft` → `published` 변경 시 자동 설정
- Trigger: `set_study_post_published_at`

### Indexes

```sql
CREATE INDEX idx_study_posts_author ON study_posts(author_id);
CREATE INDEX idx_study_posts_study ON study_posts(study_id);
CREATE INDEX idx_study_posts_status ON study_posts(status);
CREATE INDEX idx_study_posts_published_at ON study_posts(published_at DESC);
CREATE INDEX idx_study_posts_view_count ON study_posts(view_count DESC);
CREATE INDEX idx_study_posts_order ON study_posts("order" DESC);
```

### RLS Policies

- **Published Read**: status='published' 포스트는 모두 조회 가능
- **Own Read**: 본인 작성 포스트는 모두 조회 가능
- **Own Insert**: 본인 이름으로만 작성 가능
- **Own Update/Delete**: 본인 포스트만 수정/삭제 가능
- **Admin All**: 관리자는 모든 작업 가능

---

## 👥 Study Members Table

**용도**: 스터디 그룹 멤버십 관리

### Schema

```sql
CREATE TABLE public.study_members (
  id UUID PRIMARY KEY,
  study_id UUID REFERENCES studies(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(study_id, member_id)
);
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `study_id` | UUID | Yes | 스터디 FK |
| `member_id` | UUID | Yes | 멤버 FK (auth.users) |
| `role` | TEXT | No | leader, member |
| `status` | TEXT | No | active, inactive, completed |
| `joined_at` | TIMESTAMPTZ | No | 가입 시간 |
| `left_at` | TIMESTAMPTZ | No | 탈퇴 시간 |
| `notes` | TEXT | No | 메모 (출석, 평가 등) |

### Auto-Update Member Count

멤버 추가/삭제 시 `studies.current_members` 자동 업데이트:
- INSERT: `current_members` + 1
- DELETE: `current_members` - 1
- UPDATE (status 변경): 적절히 증감
- Trigger: `update_study_member_count_trigger`

### RLS Policies

- **Public Read Active**: status='active' 멤버만 조회 가능
- **Own Read**: 본인 멤버십은 모두 조회 가능
- **Member Insert**: 본인 이름으로만 가입 가능
- **Own Update**: 본인 멤버십만 수정 가능
- **Admin All**: 관리자는 모든 작업 가능

---

## 🏷️ Tags & Study Post Tags

### Tags Table

```sql
CREATE TABLE public.tags (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
```

### Study Post Tags (Many-to-Many)

```sql
CREATE TABLE public.study_post_tags (
  post_id UUID REFERENCES study_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

**용도**: 포스트와 태그의 다대다 관계

---

## 🔗 Relationships

```
studies (1) ──< (N) study_posts
  │                     │
  │                     └─< study_post_tags >─┐
  │                                            │
  └─< study_members                        tags (1)

member_profiles ─< study_posts (author)
member_profiles ─< study_members
```

---

## 🔐 Row Level Security (RLS)

모든 테이블에 RLS 활성화됨:

### Public Tables (모두 조회 가능)
- `activities` (is_active=true만)
- `studies` (public & active/completed만)
- `study_posts` (status='published'만)
- `tags`

### Protected Tables (본인 데이터만)
- `study_posts` (본인 작성 + published)
- `study_members` (본인 멤버십)

### Admin-Only Tables
- 모든 테이블에 `is_admin()` 함수로 관리자 전체 권한

---

## 🚀 Migration 순서

1. **00001**: about, recruit 테이블 생성
2. **00002**: RLS policies 추가
3. **00003**: members 테이블 생성
4. **00004**: studies, activities 기본 테이블
5. **00005**: member_profiles status 필드
6. **00006**: about_history category 추가
7. **00007**: activities 필드 개선 ⭐ NEW
8. **00008**: studies 필드 개선 ⭐ NEW
9. **00009**: study_posts 필드 개선 ⭐ NEW
10. **00010**: study_members 테이블 추가 ⭐ NEW

---

## 📝 Usage Examples

### Activities 관리

```typescript
// Create activity
const activity = await createActivity({
  title: "2024 AI Conference",
  category: "seminar",
  date: "2024-06-15",
  description: "# 컨퍼런스 개요\n...",
  image_url: "cover.jpg",
  location: "국민대학교",
  participants: 50
});

// Update activity
await updateActivity(id, {
  is_active: false
});
```

### Studies 관리

```typescript
// Create study
const study = await createStudy({
  title: "머신러닝 입문",
  category: "ml",
  status: "recruiting",
  max_members: 10,
  difficulty: "beginner",
  schedule: "매주 월 19:00"
});

// Join study
await joinStudy(studyId, userId);
// → studies.current_members 자동 증가
```

### Study Posts 작성

```typescript
// Create post
const post = await createStudyPost({
  study_id: studyId,
  author_id: userId,
  title: "Week 1: Linear Regression",
  content_md: "# 선형 회귀...",
  status: "draft"
});
// → excerpt, read_time 자동 생성

// Publish post
await updateStudyPost(postId, {
  status: "published"
});
// → published_at 자동 설정
```

---

## ✅ Type Safety

모든 테이블에 대한 TypeScript 타입 정의:
- `frontend/src/types/database.ts`
- Insert, Update, Select 타입 모두 정의됨

```typescript
import type { Activity, ActivityInsert, ActivityUpdate } from '@/types/database'
```

---

**Last Updated**: 2026-02-01
**Version**: 2.0 (Improved Schema)
