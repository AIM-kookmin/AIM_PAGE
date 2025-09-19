# 동아리 웹사이트 프로젝트 설계안 (plan.md)

## 0. 프로젝트 개요
- 목적: 동아리 외부 홍보 및 내부 부원 관리/활동 공유
- 프론트엔드: Next.js (App Router, TypeScript)
- 백엔드: Next.js API Routes (초기 모놀리식)
- DB: Supabase 무료 티어(PostgreSQL, 500MB)
- 스토리지: AWS S3 (이미지 업로드/관리), CloudFront(옵션)
- 인증: NextAuth.js (Google OAuth + Email/Password)
- 배포: Vercel(무료) 또는 AWS Amplify Hosting
- 규모: 동아리 부원 수십 명 + 게스트 방문

---

## 1. 기능 정의

### 게스트(비로그인 사용자)
- 메인 페이지: 동아리 소개, 최근 활동/수상 하이라이트
- 동아리 소개 및 부원 공개 프로필 보기
- 동아리 역사 타임라인
- 단체 활동/세미나/전시/봉사 등 기록 보기
- 수상 경력 및 실적 보기
- 스터디 활동 공개 글 보기
- 모집 안내 확인

### 로그인 사용자(동아리 부원)
- 프로필 관리: 프로필 사진, 한 줄 소개, SNS/링크 수정
- 스터디 글 CRUD: 초안 저장, 발행, 수정, 삭제
- 외부 블로그 글(velog, tistory 등) 링크 첨부 및 본문 일부 가져오기
- 본인 활동/글 관리용 대시보드 접근

### 운영진(선택적)
- 단체 활동, 수상 경력, 동아리 역사 CRUD
- 모집 안내 공고 등록/수정
- 외부 글 삭제 요청 처리

---

## 2. 데이터 모델 (Prisma Schema 요약)
```prisma
model User { id String @id @default(cuid()); email String @unique; name String?; role String @default("member"); profile MemberProfile?; posts StudyPost[]; createdAt DateTime @default(now()); updatedAt DateTime @updatedAt }
model MemberProfile { id String @id @default(cuid()); userId String @unique; displayName String; oneLiner String?; avatarKey String?; links Json?; isPublic Boolean @default(true); user User @relation(fields: [userId], references: [id]) }
model Study { id String @id @default(cuid()); title String; description String?; visibility String @default("public"); createdBy String; createdAt DateTime @default(now()); posts StudyPost[] }
model StudyPost { id String @id @default(cuid()); studyId String; authorId String; title String; contentMd String; coverKey String?; status String @default("draft"); tags StudyPostTag[]; createdAt DateTime @default(now()); updatedAt DateTime @updatedAt }
model Tag { id String @id @default(cuid()); name String @unique; posts StudyPostTag[] }
model StudyPostTag { postId String; tagId String; @@id([postId, tagId]) }
model Activity { id String @id @default(cuid()); title String; category String; date DateTime; description String?; galleryKeys Json? }
model Award { id String @id @default(cuid()); title String; issuer String?; date DateTime; team Json?; description String?; link String? }
model HistoryEvent { id String @id @default(cuid()); year Int; month Int?; title String; description String? }
model RecruitNotice { id String @id @default(cuid()); title String; bodyMd String; startAt DateTime; endAt DateTime; isOpen Boolean @default(false); externalFormUrl String? }
model MediaAsset { id String @id @default(cuid()); ownerUserId String; postId String?; s3Key String; mime String; width Int?; height Int?; bytes Int?; createdAt DateTime @default(now()) }
model ExternalArticleCache { url String @id; title String?; excerpt String?; contentMd String?; images Json?; updatedAt DateTime @updatedAt }
```

---

## 3. S3 설계

### 버킷 프리픽스 규칙
```
users/{userId}/avatar/{yyyy}/{mm}/{hash}.{ext}
users/{userId}/posts/{postId}/{yyyy}/{mm}/{hash}.{ext}
users/{userId}/temp/{uuid}.{ext}
public/activities/{activityId}/{hash}.{ext}
```

### 라이프사이클 정책
- 원칙: temp 업로드만 7일 후 만료. S3는 `users/*/temp/` 와일드카드 미지원 → 업로드 시 `x-amz-tagging: temp=true` 태그를 넣고, 라이프사이클에서 Prefix + Tag AND 필터 사용.
- 예제 정책 파일: `s3_lifecycle.json` (아래 부록 포함)

---

## 4. API 설계
- 공개: /api/home, /api/about, /api/members, /api/history, /api/activities, /api/awards, /api/studies/posts, /api/recruit/notice, /api/extract
- 인증: /api/me, /api/me/profile, /api/studies, /api/studies/:id/posts, /api/studies/posts/:id (PUT/DELETE), /api/upload-url, /api/extract
- 운영진: /api/activities|awards|history|recruit (POST/PUT/DELETE)

---

## 5. Next.js 폴더 구조
```
/app/(public)..., /(private)..., /api..., /auth...
/lib (auth.ts, db.ts, s3.ts, extract.ts, acl.ts)
/components, /prisma/schema.prisma
```

---

## 6. 이미지 업로드 플로우
1) POST /api/upload-url → presign 발급(임시면 temp=true 태깅)
2) 클라이언트에서 PUT 업로드
3) key를 DB 저장
4) 발행 시 temp → posts/{postId}/... 로 서버 CopyObject

---

## 7. 외부 글 처리 전략
- OG 메타(링크 카드) 기본, 화이트리스트만 읽기모드 추출(Readability+Turndown), 캐시 저장, 출처 표기

---

## 8. 배포/운영 & 9. 일정 & 10. 비용
- Vercel+Supabase 무료, S3 소량 → 월 $0~5
- MVP 2주 로드맵: 세팅→공개페이지→프로필/S3→스터디CRUD→임베드→배포

---

## 부록 A) S3 라이프사이클 정책(JSON, temp=7일 + 장기보관 전환)
```json
{
  "Rules": [
    {
      "ID": "ExpireTempUploadsAfter7Days",
      "Status": "Enabled",
      "Filter": { "And": { "Prefix": "users/", "Tags": [ { "Key": "temp", "Value": "true" } ] } },
      "Expiration": { "Days": 7 }
    },
    {
      "ID": "TransitionUsersAfter90Days",
      "Status": "Enabled",
      "Filter": { "Prefix": "users/" },
      "Transitions": [ { "Days": 90, "StorageClass": "STANDARD_IA" } ]
    }
  ]
}
```

## 부록 B) 업로드 핸들러 샘플 (Next.js Route Handler, TypeScript)
```ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import crypto from "crypto";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { target, postId, mime, ext } = await req.json();
  if (!mime || !ext) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const userId = session.user.id;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const bucket = process.env.AWS_S3_BUCKET!;

  const fileName = `${crypto.randomUUID()}.${ext.replace('.', '')}`;

  const key = target === "avatar"
    ? `users/${userId}/avatar/${yyyy}/${mm}/${fileName}`
    : (target === "post" && postId)
      ? `users/${userId}/posts/${postId}/${yyyy}/${mm}/${fileName}`
      : `users/${userId}/temp/${fileName}`;

  const tagging = key.includes("/temp/") ? "temp=true" : undefined;

  const put = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: mime, ...(tagging ? { Tagging: tagging } : {}) });
  const url = await getSignedUrl(s3, put, { expiresIn: 60 });

  return NextResponse.json({ url, key });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { fromKey, toKey } = await req.json();
  if (!fromKey || !toKey) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const bucket = process.env.AWS_S3_BUCKET!;
  const copy = new CopyObjectCommand({ Bucket: bucket, CopySource: `/${bucket}/${fromKey}`, Key: toKey });
  await s3.send(copy);
  return NextResponse.json({ ok: true });
}
```
