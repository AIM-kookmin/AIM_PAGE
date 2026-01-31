# AIM 웹사이트 리뉴얼 계획

> Reference: [Noomo Agency](https://noomoagency.com/)

## 디자인 컨셉

| 요소 | Noomo | AIM 적용 |
|------|-------|----------|
| 테마 | Dark, Premium | Dark + Modern Violet |
| 느낌 | Creative Agency | AI Tech Club |
| 타이포 | Large, Bold | 동일 |
| 애니메이션 | Scroll-triggered, Smooth | 동일 |
| 인터랙션 | WebGL, 3D | Subtle animations (단계적) |

---

## 페이지 구조

### 1. 메인 페이지 (`/`)

#### Hero Section
- [ ] 전체 화면 Hero (100vh)
- [ ] 대형 타이포그래피 헤드라인
- [ ] 애니메이션 배경 (Gradient blob 또는 particle)
- [ ] 스크롤 힌트 인디케이터

```
"At AIM, we explore AI together—
learning, building, and pushing boundaries."
```

#### About Preview
- [ ] 동아리 한 줄 소개
- [ ] "Learn More" CTA → `/about`

#### Activities Section
- [ ] 서비스 리스트 스타일 (Noomo의 Services 참고)
```
스터디 그룹
프로젝트 팀
대회 참가
세미나/워크샵
논문 리딩
```

#### Members Marquee
- [ ] 로고 마키 → 멤버 프로필 카드 슬라이더
- [ ] 무한 스크롤 애니메이션

#### Achievements Section
- [ ] 아코디언/확장 가능한 수상 목록
- [ ] 연도별 정리
```
대회명 | 수상내역 | 연도
```

#### Testimonials (선택)
- [ ] 선배/졸업생 후기
- [ ] 카드 슬라이더

#### Studies Preview
- [ ] 최근 스터디 포스트 3-4개
- [ ] "View All" → `/studies`

#### CTA Section
- [ ] 모집 공고 연결
- [ ] 큰 텍스트 + 버튼
```
"Ready to become a Monster?"
```

#### Footer
- [ ] 멀티 컬럼 레이아웃
- [ ] 소셜 링크 (GitHub, Instagram 등)
- [ ] 연락처

---

### 2. 소개 페이지 (`/about`)
- [ ] 동아리 스토리
- [ ] 미션/비전
- [ ] 연혁 타임라인
- [ ] 운영진 소개

### 3. 부원 페이지 (`/members`)
- [ ] 기수별 필터
- [ ] 카드 그리드 + 호버 효과
- [ ] 프로필 상세 모달 또는 페이지

### 4. 활동 페이지 (`/activities`)
- [ ] 카테고리 필터 (스터디, 프로젝트, 대회 등)
- [ ] 갤러리 스타일 그리드
- [ ] 이미지 라이트박스

### 5. 스터디 페이지 (`/studies`)
- [ ] 블로그 스타일 목록
- [ ] 태그 필터
- [ ] 상세 페이지 (마크다운 렌더링)

### 6. 모집 페이지 (`/recruit`)
- [ ] 현재 모집 공고
- [ ] FAQ 섹션
- [ ] 지원 폼 또는 외부 링크

---

## 핵심 컴포넌트

### 새로 만들어야 할 것

| 컴포넌트 | 설명 | 우선순위 |
|----------|------|----------|
| `HeroSection` | 전체화면 Hero + 애니메이션 | 🔴 높음 |
| `MarqueeSlider` | 무한 스크롤 슬라이더 | 🟡 중간 |
| `Accordion` | 확장 가능한 리스트 | 🟡 중간 |
| `ScrollReveal` | 스크롤 트리거 애니메이션 | 🔴 높음 |
| `TestimonialCard` | 후기 카드 | 🟢 낮음 |
| `TimelineSection` | 연혁 타임라인 | 🟡 중간 |
| `ContactForm` | 문의 폼 | 🟢 낮음 |

### 필요한 라이브러리

```bash
npm install framer-motion    # 애니메이션
npm install @studio-freight/lenis  # 스무스 스크롤 (선택)
npm install embla-carousel-react   # 캐러셀 (선택)
```

---

## 애니메이션 가이드

### Scroll Reveal
```tsx
// Framer Motion 예시
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
  Content
</motion.div>
```

### Stagger Children
```tsx
// 순차적으로 나타나는 효과
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}
```

---

## 구현 순서

### Phase 1: 기반 작업
1. [ ] Framer Motion 설치 및 설정
2. [ ] ScrollReveal 래퍼 컴포넌트 생성
3. [ ] 전역 스무스 스크롤 (선택)

### Phase 2: 메인 페이지 리뉴얼
1. [ ] Hero Section 재설계
2. [ ] Activities 리스트 스타일
3. [ ] Members 마키/슬라이더
4. [ ] Achievements 아코디언
5. [ ] Footer 재설계

### Phase 3: 서브 페이지
1. [ ] About 페이지 스토리텔링
2. [ ] Members 페이지 그리드
3. [ ] Activities 갤러리
4. [ ] Studies 블로그 스타일

### Phase 4: 인터랙션 강화
1. [ ] 페이지 전환 애니메이션
2. [ ] 호버 효과 개선
3. [ ] 로딩 상태 개선
4. [ ] 커스텀 커서 (선택)

---

## 참고 자료

- [Noomo Agency](https://noomoagency.com/) - 메인 레퍼런스
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Awwwards](https://www.awwwards.com/) - 추가 영감

---

## 현재 상태 vs 목표

| 항목 | 현재 | 목표 |
|------|------|------|
| Hero | 기본 텍스트 | 풀스크린 + 애니메이션 |
| 애니메이션 | 최소 | Scroll-triggered |
| 레이아웃 | 카드 그리드 | 섹션별 다양한 스타일 |
| 인터랙션 | 기본 호버 | 풍부한 마이크로인터랙션 |
| 스크롤 | 기본 | 스무스 스크롤 |
