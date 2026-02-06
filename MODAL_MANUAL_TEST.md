# Modal 수동 테스트 가이드

## 자동화 테스트 실행

```bash
cd frontend
npm test -- Modal.test.tsx
```

## 브라우저 콘솔 테스트

개발자 도구(F12) → Console 탭에서 다음 스크립트를 실행하세요:

### 1. Body Scroll Lock 확인

모달을 연 후:
```javascript
// Body overflow 확인
console.log('Body overflow:', document.body.style.overflow)
// 결과: "hidden" 이어야 함

// Padding 확인 (스크롤바 보정)
console.log('Body padding-right:', document.body.style.paddingRight)
// 결과: "Xpx" (스크롤바 너비)
```

### 2. Modal 구조 확인

```javascript
// Modal이 body의 직접 자식인지 확인
const modal = document.querySelector('.fixed.inset-0')
console.log('Modal parent:', modal?.parentElement.tagName)
// 결과: "BODY" 이어야 함

// Modal container 확인
const modalContainer = document.querySelector('[style*="maxHeight"]')
console.log('Modal maxHeight:', modalContainer?.style.maxHeight)
// 결과: "calc(100vh - 2rem)" 이어야 함
```

### 3. 스크롤 영역 확인

```javascript
// Content 영역 찾기
const content = document.querySelector('.overflow-auto')
console.log('Content element:', content)
console.log('Content maxHeight:', content?.style.maxHeight)
// 결과: "100%" 이어야 함

// 스크롤 가능 여부 확인
console.log('Can scroll:', {
  scrollHeight: content?.scrollHeight,
  clientHeight: content?.clientHeight,
  isScrollable: content?.scrollHeight > content?.clientHeight
})
// 결과: isScrollable이 true면 스크롤 가능
```

### 4. 배경 스크롤 잠금 확인

```javascript
// Overlay에 overflow-y-auto가 없는지 확인
const overlay = document.querySelector('.fixed.inset-0')
console.log('Overlay classes:', overlay?.className)
console.log('Has overflow-y-auto:', overlay?.classList.contains('overflow-y-auto'))
// 결과: false 이어야 함
```

### 5. 전체 체크 스크립트

```javascript
function checkModal() {
  const results = {
    bodyLocked: document.body.style.overflow === 'hidden',
    modalInBody: document.querySelector('.fixed.inset-0')?.parentElement?.tagName === 'BODY',
    hasScrollArea: !!document.querySelector('.overflow-auto'),
    overlayNoScroll: !document.querySelector('.fixed.inset-0')?.classList.contains('overflow-y-auto'),
    contentMaxHeight: document.querySelector('.overflow-auto')?.style.maxHeight === '100%',
  }

  console.table(results)

  const allPass = Object.values(results).every(v => v === true)
  console.log(allPass ? '✅ 모든 테스트 통과!' : '❌ 일부 테스트 실패')

  return results
}

// 실행
checkModal()
```

## 시각적 테스트

### 1. 모달 열기
- `/admin/activities-management` 접속
- "새 활동 추가" 버튼 클릭
- ✅ 모달이 열림

### 2. 배경 스크롤 잠금
- 모달이 열린 상태에서
- 마우스 휠을 스크롤해보기
- ✅ 배경이 스크롤되지 않아야 함

### 3. 모달 내부 스크롤
- 모달 내부를 마우스 휠로 스크롤
- ✅ 모달 내용이 스크롤되어야 함
- ✅ 스크롤바가 보여야 함

### 4. 상단 잘림 확인
- 모달 상단 (제목)이 보이는지 확인
- ✅ 제목이 잘리지 않고 완전히 보여야 함

### 5. 하단 확인
- 모달 끝까지 스크롤
- ✅ 푸터 버튼들이 보여야 함

### 6. 모달 닫기
- "취소" 버튼 클릭 또는 배경 클릭
- ✅ 모달이 닫힘
- ✅ 배경 스크롤이 다시 작동함

## 문제 발생 시

### A. 배경이 스크롤됨
```javascript
// Body 스타일 확인
console.log(document.body.style.overflow)
// "hidden"이 아니면 문제
```

### B. 모달 내부 스크롤 안됨
```javascript
// Content 영역 확인
const content = document.querySelector('.overflow-auto')
console.log({
  exists: !!content,
  maxHeight: content?.style.maxHeight,
  scrollHeight: content?.scrollHeight,
  clientHeight: content?.clientHeight,
})
```

### C. 상단이 잘림
```javascript
// Overlay alignment 확인
const overlay = document.querySelector('.fixed.inset-0')
console.log('Has items-start:', overlay?.classList.contains('items-start'))
// true여야 함
```

### D. Portal이 작동 안함
```javascript
// Modal의 부모 확인
const modal = document.querySelector('.fixed.inset-0')
console.log('Parent:', modal?.parentElement)
// <body>여야 함, 다른 div면 Portal 실패
```

## 예상 결과

모든 테스트가 통과하면:
- ✅ Body scroll locked: true
- ✅ Modal in body: true
- ✅ Has scroll area: true
- ✅ Overlay no scroll: true
- ✅ Content max height: true

## 자동화 테스트 결과 확인

```bash
npm test -- Modal.test.tsx --coverage
```

모든 테스트가 PASS여야 합니다.

---

**문제가 발생하면 위 스크립트 실행 결과를 공유해주세요!**
