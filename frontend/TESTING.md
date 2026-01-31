# Testing Guide

이 프로젝트는 Jest와 React Testing Library를 사용한 테스트 환경이 구축되어 있습니다.

## 📦 설치된 라이브러리

- **Jest**: JavaScript 테스트 프레임워크
- **React Testing Library**: React 컴포넌트 테스팅 라이브러리
- **@testing-library/jest-dom**: Jest DOM 확장 matcher
- **@testing-library/user-event**: 사용자 이벤트 시뮬레이션

## 🧪 테스트 실행

```bash
# 모든 테스트 실행
npm test

# Watch 모드로 테스트 실행 (파일 변경 시 자동 재실행)
npm run test:watch

# 커버리지 리포트와 함께 실행
npm run test:coverage
```

## 📁 테스트 파일 구조

테스트 파일은 `__tests__` 디렉토리에 위치하거나 `.test.tsx` / `.spec.tsx` 확장자를 사용합니다.

```
src/
├── widgets/
│   ├── Hero.tsx
│   └── __tests__/
│       └── Hero.test.tsx
├── shared/
│   └── ui/
│       ├── Button.tsx
│       └── __tests__/
│           └── Button.test.tsx
```

## ✅ 작성된 테스트

### 위젯 컴포넌트
- `Hero.test.tsx` - Hero 섹션 테스트
- `ActivitiesSection.test.tsx` - 활동 섹션 테스트
- `AchievementsTimeline.test.tsx` - 성과 타임라인 테스트

### Shared UI 컴포넌트
- `Button.test.tsx` - 버튼 컴포넌트 테스트
- `cn.test.ts` - className 유틸리티 함수 테스트

## 🔧 테스트 설정

### `jest.config.js`
- Next.js와 통합된 Jest 설정
- TypeScript 지원
- 경로 alias (`@/*`) 매핑
- 커버리지 임계값: 50%

### `jest.setup.js`
주요 Mock 설정:
- Next.js Router
- Supabase Client
- GSAP
- Framer Motion
- ResizeObserver
- Three.js (@react-three/fiber, @react-three/drei)

## 📝 테스트 작성 예시

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## 🚫 Pre-commit Hook

이 프로젝트는 Husky와 lint-staged를 사용하여 **커밋 전 자동 테스트**를 실행합니다.

### 작동 방식

1. `git add`로 파일을 staging
2. `git commit` 시도
3. **자동 실행**:
   - ESLint로 코드 검사 및 자동 수정
   - 변경된 파일과 관련된 테스트만 실행
4. 테스트가 모두 통과하면 커밋 완료
5. 테스트 실패 시 커밋 중단

### 설정 파일

#### `.husky/pre-commit`
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

cd frontend
npx lint-staged
```

#### `.lintstagedrc.js`
```javascript
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],
}
```

### 테스트 실패 시 대처 방법

커밋이 차단되었을 때:

1. **테스트 확인**:
   ```bash
   npm test
   ```

2. **실패한 테스트 수정**:
   - 코드 로직 수정
   - 또는 테스트 케이스 업데이트

3. **다시 커밋 시도**:
   ```bash
   git add .
   git commit -m "fix: ..."
   ```

### Pre-commit Hook 비활성화 (권장하지 않음)

긴급한 경우에만 사용:
```bash
git commit --no-verify -m "message"
```

## 📊 커버리지 목표

현재 설정된 최소 커버리지:
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

커버리지 확인:
```bash
npm run test:coverage
```

## 🐛 일반적인 문제 해결

### 1. Mock이 작동하지 않는 경우
`jest.setup.js`에서 해당 모듈의 mock을 추가하세요.

### 2. "Cannot find module" 에러
`jest.config.js`의 `moduleNameMapper`에서 경로 alias가 올바르게 설정되었는지 확인하세요.

### 3. 비동기 테스트 타임아웃
```tsx
it('async test', async () => {
  const result = await screen.findByText('Loaded')
  expect(result).toBeInTheDocument()
}, 10000) // 타임아웃 10초로 증가
```

## 📚 참고 자료

- [Jest 공식 문서](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
