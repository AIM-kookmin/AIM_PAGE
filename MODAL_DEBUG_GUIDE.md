# Modal 스크롤 디버깅 가이드

## 1단계: 디버그 컴포넌트 추가

**파일:** `frontend/src/app/admin/activities-management/page.tsx`

파일 상단에 import 추가:
```tsx
import { ModalDebug } from '@/shared/ui/ModalDebug'
```

return 문 시작 부분에 컴포넌트 추가:
```tsx
return (
  <div className="min-h-screen p-8">
    {/* 임시 디버그 컴포넌트 */}
    <ModalDebug />

    {/* 기존 코드 */}
    <div className="max-w-7xl mx-auto">
      ...
```

## 2단계: 브라우저에서 확인

1. **개발 서버 재시작**
   ```bash
   cd frontend
   npm run dev
   ```

2. **페이지 접속**
   - `http://localhost:3000/admin/activities-management`
   - 강력 새로고침: `Ctrl + Shift + R`

3. **"🔍 Test Modal Scroll" 버튼 클릭**

## 3단계: 개발자 도구로 확인

### A. Console 에러 확인
```
F12 → Console 탭
```

**확인할 것:**
- 빨간색 에러 메시지가 있는지?
- Portal 관련 경고가 있는지?
- React 에러가 있는지?

### B. DOM 구조 확인
```
F12 → Elements 탭
```

**확인할 것:**
1. `<body>` 태그 직접 클릭
2. 자식 요소 중에 `<div class="fixed inset-0 ...">`가 있는지?
3. 이 div가 `<body>`의 **직접 자식**인지?

**올바른 구조:**
```html
<body>
  <div id="__next">...</div>
  <!-- Portal로 렌더링된 Modal (body의 직접 자식) -->
  <div class="fixed inset-0 bg-black/60 ...">
    <div class="bg-gray-800 ...">
      <!-- 모달 내용 -->
    </div>
  </div>
</body>
```

**잘못된 구조:**
```html
<body>
  <div id="__next">
    <div class="some-wrapper">
      <div class="fixed inset-0 ...">  ← 이러면 안됨!
        <!-- 모달이 중첩되어 있으면 Portal 실패 -->
      </div>
    </div>
  </div>
</body>
```

### C. CSS 스타일 확인

**모달 Content 영역 검사:**
1. Elements 탭에서 스크롤 영역 div 클릭
2. Computed 탭 확인
3. 다음 값들 확인:

```
overflow-y: auto  ✓
flex: 1 1 0%     ✓
height: (계산된 값)  ← 이게 있어야 함
max-height: 90vh  ✓
```

### D. 스크롤 이벤트 테스트

**Console에서 실행:**
```javascript
// 스크롤 가능한 div 찾기
const scrollDiv = document.querySelector('.overflow-y-auto')
console.log('Scroll div:', scrollDiv)
console.log('Height:', scrollDiv?.offsetHeight)
console.log('Scroll Height:', scrollDiv?.scrollHeight)
console.log('Can scroll:', scrollDiv?.scrollHeight > scrollDiv?.offsetHeight)
```

**예상 결과:**
```
Scroll div: <div class="overflow-y-auto flex-1 ...">
Height: 500 (예시)
Scroll Height: 2000 (예시)
Can scroll: true  ← 이게 true여야 스크롤 가능
```

## 4단계: 문제 패턴별 해결책

### 문제 1: Portal이 body의 직접 자식이 아님
**증상:** DOM에서 Modal이 중첩되어 있음

**해결책:**
```tsx
// Modal.tsx 확인
return typeof window !== 'undefined'
  ? createPortal(modalContent, document.body)  // ← 이게 맞나요?
  : null
```

### 문제 2: Content div의 높이가 계산되지 않음
**증상:** `height: auto` 또는 높이 값 없음

**해결책:** Modal container에 `max-h-[90vh]` 확인
```tsx
<div className="... max-h-[90vh] flex flex-col">
```

### 문제 3: overflow-y-auto가 적용되지 않음
**증상:** Computed에서 `overflow-y: visible` 또는 `hidden`

**해결책:** 다른 CSS가 override하는지 확인
```bash
# Tailwind가 제대로 빌드되었는지 확인
cd frontend
npm run build
```

### 문제 4: Flexbox가 작동하지 않음
**증상:** Content가 `flex-1`인데 공간을 차지하지 않음

**해결책:**
```tsx
// Parent에 flex 선언 확인
<div className="flex flex-col">  ← 이게 있어야 함
  <div className="flex-1">       ← 자식
```

### 문제 5: Body scroll lock이 작동 안함
**증상:** 모달 열었는데 배경도 스크롤됨

**Console에서 확인:**
```javascript
console.log('Body overflow:', document.body.style.overflow)
// "hidden"이어야 함
```

## 5단계: 결과 공유

다음 정보를 공유해주세요:

1. **Console 에러:**
   ```
   복사해서 붙여넣기
   ```

2. **DOM 구조:**
   - Modal이 body의 직접 자식인가요? (예/아니오)
   - Screenshot 첨부 가능

3. **CSS Computed 값:**
   ```
   overflow-y: ?
   height: ?
   scrollHeight: ?
   ```

4. **스크롤 테스트 결과:**
   ```javascript
   Can scroll: true/false
   ```

## 6단계: 임시 해결책 (최후의 수단)

만약 Portal도 안되면, 인라인 스타일로 강제:

```tsx
<div
  style={{
    overflowY: 'scroll',
    maxHeight: '70vh',
    minHeight: '200px'
  }}
>
  {children}
</div>
```

---

**위 단계들을 실행하고 결과를 알려주세요!**
