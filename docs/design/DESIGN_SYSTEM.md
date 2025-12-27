# AIM Design System

> **Design Philosophy**: Modern, Professional, Subtle
> **Inspiration**: Linear.app, Vercel Dashboard, Stripe
> **Last Updated**: 2025-01-27

---

## 1. Design Philosophy

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Dark Mode First** | Black background (#000) as foundation |
| **Glassmorphism** | Translucent surfaces with backdrop blur |
| **Subtle Glow** | Soft glow effects on interactive elements |
| **Typography-Driven** | Clear hierarchy through font size/weight |
| **Minimal Color** | Single accent color family, avoid rainbow |
| **Performance** | Avoid heavy animations, prefer CSS transitions |

### Anti-Patterns (DO NOT)

- Neon/overly saturated colors
- Multiple conflicting accent colors (e.g., cyan + pink everywhere)
- Heavy blur animations (`animate-blob` with `blur-[120px]`)
- Gratuitous gradients
- `animate-float` on large elements (causes jank)

---

## 2. Color Palette

### Primary Colors (Violet)

Based on Tailwind's Violet scale. Use for primary actions, links, highlights.

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#f5f3ff` | Hover backgrounds (light) |
| `primary-100` | `#ede9fe` | Subtle backgrounds |
| `primary-200` | `#ddd6fe` | Disabled states |
| `primary-300` | `#c4b5fd` | Secondary text accents |
| `primary-400` | `#a78bfa` | **Links, hover states** |
| `primary-500` | `#8b5cf6` | **Primary buttons, badges** |
| `primary-600` | `#7c3aed` | Button hover |
| `primary-700` | `#6d28d9` | Active/pressed states |
| `primary-800` | `#5b21b6` | Dark accents |
| `primary-900` | `#4c1d95` | Darkest accent |

```css
/* CSS Variable */
--aim-primary: #8b5cf6;
```

### Secondary Colors (Slate)

Neutral grays for text, borders, and subtle UI elements.

| Token | Hex | Usage |
|-------|-----|-------|
| `secondary-50` | `#f8fafc` | Light backgrounds |
| `secondary-100` | `#f1f5f9` | Card backgrounds (light mode) |
| `secondary-200` | `#e2e8f0` | Borders (light mode) |
| `secondary-300` | `#cbd5e1` | Disabled text |
| `secondary-400` | `#94a3b8` | **Placeholder text** |
| `secondary-500` | `#64748b` | **Secondary text** |
| `secondary-600` | `#475569` | Body text |
| `secondary-700` | `#334155` | Darker text |
| `secondary-800` | `#1e293b` | Card backgrounds |
| `secondary-900` | `#0f172a` | Near-black |

```css
/* CSS Variable */
--aim-secondary: #64748b;
```

### Surface Colors

Translucent white for glassmorphism effect.

| Token | Value | Usage |
|-------|-------|-------|
| `surface` | `rgba(255, 255, 255, 0.05)` | Default card/panel background |
| `surface-hover` | `rgba(255, 255, 255, 0.08)` | Hover state |
| `surface-active` | `rgba(255, 255, 255, 0.12)` | Active/selected state |

### Semantic Colors

| Purpose | Color | Hex | Usage |
|---------|-------|-----|-------|
| Success | Emerald | `#10b981` | Success badges, positive actions |
| Warning | Amber | `#f59e0b` | Warning badges, caution states |
| Error | Red | `#ef4444` | Error badges, destructive actions |
| Info | Indigo | `#818cf8` | Info badges, neutral highlights |

### Background

| Element | Color |
|---------|-------|
| Page background | `#000000` (black) |
| Card background | `rgba(255, 255, 255, 0.05)` + `backdrop-blur-xl` |
| Border | `rgba(255, 255, 255, 0.1)` |

---

## 3. Typography

### Font Stack

```css
--font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Scale

| Role | Classes | Size | Weight | Line Height |
|------|---------|------|--------|-------------|
| Hero Title | `text-5xl md:text-7xl font-bold tracking-tight` | 48-72px | 700 | 1.0 |
| Section Title | `text-3xl md:text-4xl font-bold` | 30-36px | 700 | 1.1 |
| Card Title | `text-xl font-semibold` | 20px | 600 | 1.2 |
| Body | `text-base text-white/80` | 16px | 400 | 1.5 |
| Caption | `text-sm text-white/60` | 14px | 400 | 1.4 |
| Label | `text-xs font-medium uppercase tracking-wider text-white/40` | 12px | 500 | 1.0 |

### Text Colors

| Type | Class | Usage |
|------|-------|-------|
| Primary | `text-white` | Headings, important text |
| Secondary | `text-white/80` or `text-gray-300` | Body text |
| Muted | `text-white/60` or `text-gray-400` | Captions, metadata |
| Disabled | `text-white/40` or `text-gray-500` | Disabled states |

---

## 4. Components

### Card (Glass Card)

```tsx
// Base glass card
className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 
           hover:bg-white/[0.08] hover:border-white/20 hover:shadow-glow-sm 
           transition-all duration-300"
```

### Button

#### Primary
```tsx
className="bg-primary-500 hover:bg-primary-400 text-white px-6 py-3 rounded-xl 
           font-semibold hover:shadow-glow-primary active:scale-[0.98] 
           transition-all duration-300"
```

#### Ghost
```tsx
className="bg-white/5 hover:bg-white/10 text-white border border-white/10 
           hover:border-white/20 px-6 py-3 rounded-xl font-semibold 
           transition-all duration-300"
```

#### Outline
```tsx
className="bg-transparent border-2 border-white/20 text-white px-6 py-3 rounded-xl 
           font-semibold hover:border-primary-400 hover:text-primary-400 
           hover:shadow-glow-sm transition-all duration-300"
```

### Badge

```tsx
// Primary
className="bg-primary-500/20 text-primary-400 border border-primary-500/30 
           px-3 py-1 rounded-full text-sm font-medium"

// Success
className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 
           px-3 py-1 rounded-full text-sm font-medium"

// Warning  
className="bg-amber-500/20 text-amber-400 border border-amber-500/30 
           px-3 py-1 rounded-full text-sm font-medium"

// Error
className="bg-red-500/20 text-red-400 border border-red-500/30 
           px-3 py-1 rounded-full text-sm font-medium"
```

### Input

```tsx
className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 
           text-white placeholder:text-white/40
           focus:outline-none focus:border-primary-500/50 
           focus:ring-2 focus:ring-primary-500/20 focus:bg-white/[0.08]
           transition-all duration-200"
```

### Navigation

```tsx
// Nav container
className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5"

// Nav link
className="text-white/70 hover:text-primary-400 transition-all duration-300 
           hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]"
```

---

## 5. Effects

### Box Shadows (Glow)

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-glow-primary` | `0 0 20px rgba(139, 92, 246, 0.35)` | Primary button hover |
| `shadow-glow-secondary` | `0 0 20px rgba(100, 116, 139, 0.25)` | Secondary elements |
| `shadow-glow-sm` | `0 0 10px rgba(139, 92, 246, 0.2)` | Subtle glow |

### Animations

| Name | Duration | Usage |
|------|----------|-------|
| `fade-in` | 0.5s | Page/section entrance |
| `slide-up` | 0.5s | Cards, list items entrance |
| `glow-pulse` | 2s infinite | Active/highlighted elements |

### Keyframes

```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.35); }
  50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5); }
}
```

---

## 6. Spacing

### Section Spacing

| Between | Value |
|---------|-------|
| Sections | `py-24` (96px) |
| Section header to content | `mb-16` (64px) |
| Cards in grid | `gap-6` or `gap-8` (24-32px) |

### Component Internal

| Element | Value |
|---------|-------|
| Card padding | `p-6` (24px) |
| Button padding | `px-6 py-3` |
| Input padding | `px-4 py-3` |

---

## 7. Border Radius

| Size | Value | Usage |
|------|-------|-------|
| `rounded-xl` | 12px | Buttons, inputs |
| `rounded-2xl` | 16px | Cards, modals |
| `rounded-full` | 9999px | Badges, avatars |

---

## 8. Background Patterns

### Static Gradient Blobs (Performance-Safe)

```tsx
<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
  <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[80px]" />
  <div className="absolute top-[30%] right-[-15%] w-[40%] h-[40%] bg-indigo-600/15 rounded-full blur-[60px]" />
  <div className="absolute bottom-[-10%] left-[30%] w-[45%] h-[45%] bg-violet-500/10 rounded-full blur-[70px]" />
</div>
```

**DO NOT USE:**
- `animate-blob` (CPU intensive)
- `blur-[100px]+` (GPU intensive)
- Multiple overlapping blur effects

---

## 9. Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

---

## 10. Migration Checklist

When updating pages to the new design system:

### Colors to Replace

| Old | New |
|-----|-----|
| `cyan-400/500/600` | `primary-400/500/600` (violet) |
| `pink-400/500/600` | `purple-400/500/600` or remove |
| `from-cyan-* to-pink-*` | `from-violet-* to-indigo-*` |

### Classes to Replace

| Old | New |
|-----|-----|
| `bg-gray-800` | `bg-white/5 backdrop-blur-xl` |
| `border-gray-700` | `border-white/10` |
| `hover:text-cyan-400` | `hover:text-primary-400` |
| `bg-cyan-500` | `bg-primary-500` |
| `shadow-cyan-*` | `shadow-glow-primary` |

### Animations to Remove/Replace

| Remove | Replace With |
|--------|--------------|
| `animate-blob` | Static blur blobs |
| `animate-float` | Remove or use sparingly |
| `blur-[100px]+` | `blur-[60-80px]` max |

---

## 11. File References

| File | Purpose |
|------|---------|
| `frontend/tailwind.config.ts` | Tailwind theme extensions |
| `frontend/src/app/globals.css` | CSS variables, base styles |
| `frontend/src/shared/ui/` | Reusable UI components |

---

## 12. Quick Reference

### Most Used Classes

```tsx
// Glass card
"bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"

// Primary button
"bg-primary-500 hover:bg-primary-400 text-white rounded-xl hover:shadow-glow-primary"

// Text hierarchy
"text-white"           // Heading
"text-white/80"        // Body
"text-white/60"        // Muted

// Hover glow on text
"hover:text-primary-400 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]"

// Gradient text
"bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"
```
