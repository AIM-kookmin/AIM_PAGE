# 비밀번호 재설정 가이드

모든 사용자의 비밀번호를 이메일의 @ 앞부분으로 재설정하는 방법입니다.

## 📋 스크립트 설명

`backend/scripts/reset-passwords.ts` 스크립트는:
- 모든 사용자를 조회합니다
- 각 사용자의 이메일에서 @ 앞부분을 추출합니다
- 해당 부분을 비밀번호로 설정합니다 (bcrypt 해시)
- 예: `aim2024@kookmin.ac.kr` → 비밀번호: `aim2024`

## 🚀 실행 방법

### 방법 1: Railway Shell 사용 (권장)

1. **Railway 대시보드 접속**
   - [Railway](https://railway.app) → 프로젝트 선택
   - 백엔드 서비스 선택

2. **Shell 열기**
   - 서비스 → **Shell** 탭 클릭
   - 또는 **Connect** → **Shell** 선택

3. **스크립트 실행**
   ```bash
   cd /app
   DATABASE_URL="${{Postgres.DATABASE_URL}}" npx ts-node scripts/reset-passwords.ts
   ```

### 방법 2: 로컬에서 Railway 데이터베이스에 연결

1. **Railway Public URL 확인**
   - Railway 대시보드 → PostgreSQL 서비스 → Variables 탭
   - `DATABASE_PUBLIC_URL` 복사

2. **로컬에서 실행**
   ```bash
   cd backend
   DATABASE_URL="postgresql://postgres:password@xxx.railway.app:5432/railway" npx ts-node scripts/reset-passwords.ts
   ```

### 방법 3: Railway CLI 사용

1. **Railway CLI 설치** (없는 경우)
   ```bash
   npm i -g @railway/cli
   ```

2. **로그인**
   ```bash
   railway login
   ```

3. **프로젝트 연결**
   ```bash
   cd backend
   railway link
   ```

4. **스크립트 실행**
   ```bash
   railway run npx ts-node scripts/reset-passwords.ts
   ```

## 📝 실행 예시

```
🔍 모든 사용자 조회 중...
📊 총 78명의 사용자를 찾았습니다.

✅ aim2024@kookmin.ac.kr (Admin): 비밀번호를 "aim2024"로 변경했습니다.
✅ user1@kookmin.ac.kr (User 1): 비밀번호를 "user1"로 변경했습니다.
✅ user2@kookmin.ac.kr (User 2): 비밀번호를 "user2"로 변경했습니다.
...

📈 완료: 성공 78건, 실패 0건

✨ 모든 작업이 완료되었습니다.
```

## ⚠️ 주의사항

1. **백업**: 실행 전에 데이터베이스 백업을 권장합니다
2. **테스트**: 먼저 테스트 계정으로 확인해보세요
3. **알림**: 모든 사용자에게 비밀번호가 변경되었음을 알려주세요

## 🔍 확인 방법

비밀번호가 제대로 변경되었는지 확인:

```bash
# Railway Shell에서
cd /app
DATABASE_URL="${{Postgres.DATABASE_URL}}" npx prisma studio
```

또는 프론트엔드에서 로그인 테스트:
- 이메일: `aim2024@kookmin.ac.kr`
- 비밀번호: `aim2024`

## 🐛 문제 해결

### "Cannot find module" 에러

스크립트가 Railway에 배포되지 않았을 수 있습니다. Git에 커밋하고 푸시하세요:

```bash
git add backend/scripts/reset-passwords.ts
git commit -m "Add password reset script"
git push
```

Railway가 자동으로 재배포됩니다.

### "DATABASE_URL is not set" 에러

환경 변수가 제대로 설정되지 않았습니다. Railway Shell에서는 `${{Postgres.DATABASE_URL}}`을 사용하세요.

### "Permission denied" 에러

Railway Shell에서 실행 권한이 없을 수 있습니다. `npx`를 사용하면 해결됩니다.

