# Deployment Workflow

## Repository Structure

| Repository | Role | Branches |
|------------|------|----------|
| `origin` (내 레포) | 개발 작업 | `dev` |
| `fork` (배포용 레포) | Vercel 배포 연결 | `dev`, `prod` |

## Workflow

### 1. 개발 작업
```bash
# origin의 dev 브랜치에서 작업
git checkout dev
git add .
git commit -m "feat: ..."
git push origin dev
```

### 2. Fork 레포에 반영
1. **GitHub** → Fork 레포 페이지 이동
2. **Sync fork** 또는 **Contribute** 버튼 클릭
3. origin의 dev 변경사항을 fork의 dev로 동기화

### 3. Preview 확인
- Vercel이 fork의 `dev` 브랜치 변경 감지
- Preview 배포 자동 실행
- Preview URL에서 테스트

### 4. Production 배포
1. **GitHub** → Fork 레포에서 **Pull Request** 생성
2. `dev` → `prod` PR
3. 리뷰 후 Merge
4. Vercel이 `prod` 브랜치 변경 감지 → Production 배포

## Branch Strategy

```
origin/dev → fork/dev → fork/prod
   (개발)      (Preview)   (Production)
```

## Environment

| Branch | Vercel | Supabase | Domain |
|--------|--------|----------|--------|
| `dev` | Preview | aim-dev | dev.* / preview URL |
| `prod` | Production | aim-prod | aim-kookmin.com |

## Commands Quick Reference

```bash
# 개발 브랜치로 이동
git checkout dev

# 작업 후 push
git push origin dev

# fork 레포 remote 추가 (최초 1회)
git remote add fork https://github.com/[FORK_ACCOUNT]/[REPO_NAME].git

# fork에 직접 push가 필요한 경우
git push fork dev
```
