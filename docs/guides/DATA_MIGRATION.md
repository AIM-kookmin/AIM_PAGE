# 데이터 마이그레이션 가이드

로컬 데이터베이스의 데이터를 Railway 프로덕션 데이터베이스로 옮기는 방법입니다.

## 📋 사전 준비

1. **Railway PostgreSQL Public URL 확인**
   - Railway 대시보드 → PostgreSQL 서비스 → Variables 탭
   - `DATABASE_PUBLIC_URL` 복사 (예: `postgresql://postgres:password@xxx.railway.app:5432/railway`)

2. **로컬 데이터베이스 URL 확인**
   - 로컬 `.env` 파일의 `DATABASE_URL` 확인
   - 또는 Docker를 사용한다면: `postgresql://aimpage:aimpage123@localhost:5432/aim_page`

---

## 방법 1: PostgreSQL 덤프/복원 (권장) ⭐

가장 완전하고 안전한 방법입니다. 모든 데이터와 스키마를 그대로 복사합니다.

### 1단계: 로컬 데이터베이스 덤프

```bash
# 로컬 데이터베이스 덤프
pg_dump "postgresql://aimpage:aimpage123@localhost:5432/aim_page" \
  --format=custom \
  --file=aim_page_backup.dump

# 또는 일반 SQL 형식으로
pg_dump "postgresql://aimpage:aimpage123@localhost:5432/aim_page" \
  --file=aim_page_backup.sql
```

> **참고**: `pg_dump`가 설치되어 있지 않다면:
> - macOS: `brew install postgresql`
> - Ubuntu/Debian: `sudo apt-get install postgresql-client`
> - Windows: PostgreSQL 설치 시 함께 설치됨

### 2단계: Railway 데이터베이스로 복원

```bash
# Railway Public URL 사용
pg_restore \
  --dbname="postgresql://postgres:password@xxx.railway.app:5432/railway" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  aim_page_backup.dump

# 또는 SQL 파일인 경우
psql "postgresql://postgres:password@xxx.railway.app:5432/railway" < aim_page_backup.sql
```

> **주의**: 
> - `--clean`: 기존 데이터를 삭제하고 새로 생성
> - `--if-exists`: 객체가 없어도 에러 없이 진행
> - `--no-owner`, `--no-privileges`: Railway에서는 필요 없음

### 3단계: 확인

```bash
# Railway 데이터베이스 연결 확인
psql "postgresql://postgres:password@xxx.railway.app:5432/railway" \
  -c "SELECT COUNT(*) FROM \"User\";"
```

---

## 방법 2: Prisma Studio 사용 (수동 복사)

소량의 데이터나 특정 테이블만 옮길 때 유용합니다.

### 1단계: 로컬 Prisma Studio 실행

```bash
cd backend
DATABASE_URL="postgresql://aimpage:aimpage123@localhost:5432/aim_page" npx prisma studio
```

브라우저에서 `http://localhost:5555` 접속

### 2단계: Railway Prisma Studio 실행

새 터미널에서:

```bash
cd backend
DATABASE_URL="postgresql://postgres:password@xxx.railway.app:5432/railway" npx prisma studio --port 5556
```

브라우저에서 `http://localhost:5556` 접속

### 3단계: 데이터 복사

1. 로컬 Prisma Studio에서 데이터 확인
2. Railway Prisma Studio에서 수동으로 데이터 입력
3. 또는 JSON으로 export 후 import

---

## 방법 3: Prisma를 사용한 스크립트 (선택적)

특정 테이블만 선택적으로 옮기고 싶을 때 사용합니다.

### 스크립트 생성

`backend/scripts/migrate-data.ts` 파일 생성:

```typescript
import { PrismaClient } from '@prisma/client'

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.LOCAL_DATABASE_URL || 'postgresql://aimpage:aimpage123@localhost:5432/aim_page'
    }
  }
})

const railwayPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.RAILWAY_DATABASE_URL
    }
  }
})

async function migrateUsers() {
  const users = await localPrisma.user.findMany({
    include: { profile: true }
  })
  
  for (const user of users) {
    await railwayPrisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        profile: user.profile ? {
          create: {
            displayName: user.profile.displayName,
            studentId: user.profile.studentId,
            position: user.profile.position,
            department: user.profile.department,
            year: user.profile.year,
            generation: user.profile.generation,
            bio: user.profile.bio,
            oneLiner: user.profile.oneLiner,
            avatarKey: user.profile.avatarKey,
            links: user.profile.links,
            isPublic: user.profile.isPublic,
          }
        } : undefined
      }
    })
  }
  
  console.log(`✅ Migrated ${users.length} users`)
}

async function migrateActivities() {
  const activities = await localPrisma.activity.findMany()
  
  for (const activity of activities) {
    await railwayPrisma.activity.upsert({
      where: { id: activity.id },
      update: {},
      create: activity
    })
  }
  
  console.log(`✅ Migrated ${activities.length} activities`)
}

async function main() {
  try {
    await migrateUsers()
    await migrateActivities()
    // 필요한 다른 테이블들도 추가
  } catch (error) {
    console.error('Migration error:', error)
  } finally {
    await localPrisma.$disconnect()
    await railwayPrisma.$disconnect()
  }
}

main()
```

### 실행

```bash
cd backend
LOCAL_DATABASE_URL="postgresql://aimpage:aimpage123@localhost:5432/aim_page" \
RAILWAY_DATABASE_URL="postgresql://postgres:password@xxx.railway.app:5432/railway" \
npx ts-node scripts/migrate-data.ts
```

---

## 방법 4: CSV Export/Import (특정 테이블만)

특정 테이블만 CSV로 내보내고 가져오는 방법입니다.

### Export (로컬)

```bash
# PostgreSQL에서 CSV로 내보내기
psql "postgresql://aimpage:aimpage123@localhost:5432/aim_page" \
  -c "\COPY \"User\" TO 'users.csv' WITH CSV HEADER"

psql "postgresql://aimpage:aimpage123@localhost:5432/aim_page" \
  -c "\COPY \"MemberProfile\" TO 'profiles.csv' WITH CSV HEADER"
```

### Import (Railway)

```bash
# Railway로 가져오기
psql "postgresql://postgres:password@xxx.railway.app:5432/railway" \
  -c "\COPY \"User\" FROM 'users.csv' WITH CSV HEADER"

psql "postgresql://postgres:password@xxx.railway.app:5432/railway" \
  -c "\COPY \"MemberProfile\" FROM 'profiles.csv' WITH CSV HEADER"
```

---

## 🔍 데이터 확인

마이그레이션 후 데이터가 제대로 옮겨졌는지 확인:

```bash
# Railway 데이터베이스 연결
psql "postgresql://postgres:password@xxx.railway.app:5432/railway"

# 테이블 목록 확인
\dt

# 각 테이블의 데이터 개수 확인
SELECT 'User' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'MemberProfile', COUNT(*) FROM "MemberProfile"
UNION ALL
SELECT 'Activity', COUNT(*) FROM "Activity"
UNION ALL
SELECT 'RecruitNotice', COUNT(*) FROM "RecruitNotice";
```

---

## ⚠️ 주의사항

1. **백업**: 마이그레이션 전에 Railway 데이터베이스도 백업하세요
2. **ID 충돌**: 기존 데이터가 있다면 ID 충돌이 발생할 수 있습니다
3. **외래 키**: 관계가 있는 테이블은 순서대로 마이그레이션하세요
4. **파일 업로드**: S3나 로컬 파일 스토리지의 파일은 별도로 복사해야 합니다

---

## 🚀 빠른 시작 (방법 1 사용)

```bash
# 1. 로컬 덤프
pg_dump "postgresql://aimpage:aimpage123@localhost:5432/aim_page" \
  --format=custom \
  --file=aim_page_backup.dump

# 2. Railway로 복원 (DATABASE_PUBLIC_URL 사용)
pg_restore \
  --dbname="YOUR_RAILWAY_DATABASE_PUBLIC_URL" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  aim_page_backup.dump

# 3. 확인
psql "YOUR_RAILWAY_DATABASE_PUBLIC_URL" \
  -c "SELECT COUNT(*) FROM \"User\";"
```

---

## 📝 문제 해결

### "relation does not exist" 에러

스키마가 먼저 생성되어 있어야 합니다:

```bash
cd backend
DATABASE_URL="YOUR_RAILWAY_DATABASE_PUBLIC_URL" npx prisma db push
```

### "permission denied" 에러

`--no-owner`와 `--no-privileges` 플래그를 사용하세요.

### 연결 타임아웃

Railway의 `DATABASE_PUBLIC_URL`을 사용하고 있는지 확인하세요. 내부 URL(`postgres.railway.internal`)은 로컬에서 접근할 수 없습니다.

