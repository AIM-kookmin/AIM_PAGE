# UI/UX 전면 개편 계획서

## 1. 현재 문제점 분석

### 1.1 "LLM이 짠 코드" 증상
| 문제 | 설명 | 예시 |
|------|------|------|
| **플랫한 디자인** | 단순 배경색 적용, 깊이감 없음 | `bg-gray-800` 단독 사용 |
| **일관성 없는 간격** | 컴포넌트마다 다른 padding/margin | `p-4`, `p-6`, `px-8` 혼재 |
| **과도한 그라디언트** | 의미 없는 `from-cyan-400 to-pink-500` 남발 | 모든 프로필에 동일 그라디언트 |
| **기본 Tailwind 색상** | 커스텀 없이 `blue-500`, `gray-700` 그대로 사용 | 브랜드 아이덴티티 부재 |
| **정적인 UI** | 호버/클릭 피드백 없음, 페이지 전환 애니메이션 없음 | 버튼 클릭 시 변화 없음 |
| **단조로운 레이아웃** | 단순 세로 나열, Bento Grid 미활용 | `flex-col gap-4` 반복 |
| **타이포그래피 무신경** | 폰트 크기/굵기 계층 불명확 | 모든 텍스트가 비슷해 보임 |

### 1.2 개선 목표
- **"사람이 디자인한 것 같은"** 세련되고 일관된 UI
- **2024-2025 트렌드** 반영: Glassmorphism, Bento Grid, Micro-interactions
- **브랜드 아이덴티티** 강화: AIM 로고 색상과 조화

---

## 2. 디자인 컨셉: "Cyber Glass"

### 2.1 핵심 키워드
- **Glassmorphism**: 반투명 유리 질감, backdrop-blur
- **Neon Glow**: 주요 요소에 은은한 발광 효과
- **Dark Mode First**: 검은 배경 + 높은 대비
- **Minimal but Rich**: 단순하지만 질감과 깊이감 있는

### 2.2 영감 레퍼런스
- Linear.app (깔끔한 다크 UI)
- Vercel Dashboard (모던 테크 느낌)
- Apple Vision Pro UI (Glassmorphism)
- Stripe Docs (정보 계층 구조)

---

## 3. 색상 팔레트 정제

### 3.1 Primary Palette (기존 유지 + 정제)
```
┌─────────────────────────────────────────────────────────┐
│  BACKGROUND LAYER                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  bg-black (#000000)                              │   │
│  │  + subtle noise texture                          │   │
│  │  + optional grid pattern (white/[0.02])          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  SURFACE LAYER (Cards, Modals)                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  bg-white/5 (#FFFFFF 5% opacity)                 │   │
│  │  + backdrop-blur-xl                              │   │
│  │  + border border-white/10                        │   │
│  │  + rounded-2xl                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ACCENT COLORS                                          │
│  ● Primary:   #00BFFF (Deep Sky Blue)                  │
│  ● Secondary: #FF4081 (Pink Accent)                    │
│  ● Accent:    #FFD700 (Gold - 수상/하이라이트)          │
│  ● Success:   #10B981 (Emerald)                        │
│  ● Warning:   #F59E0B (Amber)                          │
│  ● Error:     #EF4444 (Red)                            │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Tailwind Config 확장
```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: '#00BFFF',
          50: '#E6F9FF',
          100: '#CCF3FF',
          200: '#99E7FF',
          300: '#66DBFF',
          400: '#33CFFF',
          500: '#00BFFF',  // Main
          600: '#0099CC',
          700: '#007399',
          800: '#004D66',
          900: '#002633',
        },
        secondary: {
          DEFAULT: '#FF4081',
          // ... shades
        },
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          hover: 'rgba(255, 255, 255, 0.08)',
          active: 'rgba(255, 255, 255, 0.12)',
        },
      },
      // Glow Effects
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0, 191, 255, 0.3)',
        'glow-secondary': '0 0 20px rgba(255, 64, 129, 0.3)',
        'glow-sm': '0 0 10px rgba(0, 191, 255, 0.2)',
      },
      // Backdrop Blur
      backdropBlur: {
        xs: '2px',
      },
      // Animation
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 191, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 191, 255, 0.5)' },
        },
      },
    },
  },
}
```

---

## 4. 컴포넌트 가이드라인

### 4.1 Card (Glass Card)
```tsx
// Before (LLM Style)
<div className="bg-gray-800 rounded-lg p-4 border border-gray-700">

// After (Cyber Glass)
<div className="
  bg-white/5 
  backdrop-blur-xl 
  border border-white/10 
  rounded-2xl 
  p-6
  hover:bg-white/8 
  hover:border-white/20
  hover:shadow-glow-sm
  transition-all duration-300
">
```

### 4.2 Button (Primary)
```tsx
// Before
<button className="bg-cyan-500 text-white px-4 py-2 rounded">

// After
<button className="
  relative
  bg-primary-500 
  text-white 
  px-6 py-3 
  rounded-xl
  font-medium
  overflow-hidden
  transition-all duration-300
  hover:bg-primary-400
  hover:shadow-glow-primary
  active:scale-[0.98]
  before:absolute before:inset-0 
  before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
  before:translate-x-[-200%] hover:before:translate-x-[200%]
  before:transition-transform before:duration-700
">
```

### 4.3 Input (Focus Ring)
```tsx
// Before
<input className="bg-gray-700 border border-gray-600 rounded px-4 py-2">

// After
<input className="
  w-full
  bg-white/5 
  border border-white/10 
  rounded-xl 
  px-4 py-3
  text-white
  placeholder:text-white/40
  focus:outline-none 
  focus:border-primary-500/50
  focus:ring-2 focus:ring-primary-500/20
  focus:bg-white/8
  transition-all duration-200
">
```

### 4.4 Navigation (Sticky + Blur)
```tsx
<nav className="
  fixed top-0 left-0 right-0 z-50
  bg-black/80 
  backdrop-blur-xl 
  border-b border-white/5
">
```

### 4.5 Badge (Status)
```tsx
// Pending
<span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">

// Active
<span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">

// Admin
<span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400 border border-primary-500/30">
```

---

## 5. 레이아웃 패턴

### 5.1 Bento Grid (Dashboard/Admin)
```
┌─────────────────┬─────────┬─────────┐
│                 │         │         │
│   큰 카드       │  작은1  │  작은2  │
│   (2x2)         │         │         │
│                 ├─────────┴─────────┤
│                 │                   │
├─────────────────┤    중간 카드      │
│                 │                   │
│   작은3         ├───────────────────┤
│                 │       작은4       │
└─────────────────┴───────────────────┘
```

```tsx
<div className="grid grid-cols-4 gap-4 auto-rows-[180px]">
  <div className="col-span-2 row-span-2">큰 카드</div>
  <div className="col-span-1">작은1</div>
  <div className="col-span-1">작은2</div>
  <div className="col-span-1 row-span-2">작은3</div>
  <div className="col-span-2">중간 카드</div>
  <div className="col-span-1">작은4</div>
</div>
```

### 5.2 Section Spacing
- 섹션 간: `py-24` (96px)
- 섹션 내 요소 간: `space-y-8` (32px)
- 카드 내부: `p-6` (24px)
- 버튼 그룹: `gap-3` (12px)

---

## 6. 타이포그래피

### 6.1 Font Stack
```css
/* globals.css */
:root {
  --font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### 6.2 Scale
| Role | Class | Size | Weight |
|------|-------|------|--------|
| Hero Title | `text-5xl md:text-7xl font-bold tracking-tight` | 48-72px | 700 |
| Section Title | `text-3xl font-bold` | 30px | 700 |
| Card Title | `text-xl font-semibold` | 20px | 600 |
| Body | `text-base text-white/80` | 16px | 400 |
| Caption | `text-sm text-white/60` | 14px | 400 |
| Label | `text-xs font-medium uppercase tracking-wider text-white/40` | 12px | 500 |

---

## 7. 마이크로 인터랙션

### 7.1 Page Transitions
```tsx
// 페이지 진입 시 fade-in + slide-up
<main className="animate-fade-in">

// 리스트 아이템은 stagger 효과
{items.map((item, i) => (
  <div 
    key={item.id}
    className="animate-slide-up"
    style={{ animationDelay: `${i * 100}ms` }}
  >
))}
```

### 7.2 Button Feedback
- Hover: scale(1.02), glow effect
- Active: scale(0.98)
- Loading: spinner + disabled state

### 7.3 Card Hover
- Border brightness 증가
- 미세한 translateY(-2px)
- Glow shadow 추가

---

## 8. 구현 로드맵

### Phase 1: Foundation (Day 1-2)
- [ ] `tailwind.config.ts` 확장 (색상, 애니메이션)
- [ ] `globals.css` 기본 스타일 재정의
- [ ] Noise texture 추가 (선택)

### Phase 2: Core Components (Day 3-4)
- [ ] `shared/ui/Card.tsx` 리팩토링
- [ ] `shared/ui/Button.tsx` 리팩토링
- [ ] `shared/ui/Input.tsx` 신규 또는 리팩토링
- [ ] `shared/ui/Badge.tsx` 리팩토링

### Phase 3: Layout & Navigation (Day 5)
- [ ] `widgets/PublicNavigation.tsx` 개선
- [ ] `widgets/AdminNavigation.tsx` 개선
- [ ] Footer 컴포넌트 추가

### Phase 4: Pages (Day 6-8)
- [ ] 메인 페이지 (`/`)
- [ ] 로그인 페이지 (`/login`)
- [ ] 회원가입 페이지 (`/register`)
- [ ] 멤버 페이지 (`/members`)
- [ ] 관리자 대시보드 (`/admin`)

### Phase 5: Polish (Day 9-10)
- [ ] 페이지 전환 애니메이션
- [ ] 로딩 스켈레톤
- [ ] 반응형 최적화 (Mobile)
- [ ] 접근성 검토 (WCAG)

---

## 9. 체크리스트 (자가 검증)

구현 후 아래 항목을 확인:

- [ ] 모든 카드가 Glass 스타일인가? (bg-white/5 + backdrop-blur)
- [ ] 버튼 호버 시 glow 효과가 있는가?
- [ ] Input 포커스 시 primary 색상 링이 보이는가?
- [ ] 섹션 간격이 일관적인가? (py-24)
- [ ] 폰트 계층이 명확한가? (Hero > Section > Card > Body)
- [ ] 페이지 진입 시 fade-in 애니메이션이 있는가?
- [ ] 모바일에서도 깨지지 않는가?
- [ ] Primary 색상(#00BFFF)이 일관되게 사용되는가?
