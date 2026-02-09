// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Supabase client
jest.mock('@/shared/api/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signInWithOAuth: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
}))

// Mock GSAP
jest.mock('gsap', () => ({
  registerPlugin: jest.fn(),
  fromTo: jest.fn(),
  context: jest.fn(() => ({
    revert: jest.fn(),
  })),
}))

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {},
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    p: 'p',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
  },
  AnimatePresence: ({ children }) => children,
  useScroll: () => ({
    scrollYProgress: { get: () => 0 },
  }),
  useTransform: () => ({ get: () => 0 }),
  useInView: () => true,
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock Three.js components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div>{children}</div>,
  useFrame: jest.fn(),
  useThree: () => ({
    camera: {},
    gl: {},
    scene: {},
  }),
}))

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Stars: () => null,
}))

// Mock ParticleBackground
jest.mock('@/shared/ui/ParticleBackground', () => ({
  ParticleBackground: () => <div data-testid="particle-background" />,
}))

// Mock ScrollReveal
jest.mock('@/shared/ui/ScrollReveal', () => {
  const ScrollReveal = ({ children }) => children
  ScrollReveal.displayName = 'ScrollReveal'
  return { __esModule: true, default: ScrollReveal }
})

// Mock Lenis
jest.mock('lenis/react', () => ({
  ReactLenis: ({ children }) => children,
  useLenis: () => null,
}))

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
