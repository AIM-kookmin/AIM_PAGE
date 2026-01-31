'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' | 'diagonal'

const variants = {
  up: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  },
  down: {
    initial: { y: -50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  },
  left: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
  },
  right: {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
  },
  diagonal: {
    initial: { x: 30, y: 30, opacity: 0 },
    animate: { x: 0, y: 0, opacity: 1 },
  },
}

const pathToDirection: Record<string, Direction> = {
  '/': 'scale',
  '/about': 'right',
  '/members': 'left',
  '/activities': 'up',
  '/studies': 'down',
  '/recruit': 'diagonal',
  '/login': 'fade',
  '/register': 'fade',
  '/profile': 'scale',
  '/pending': 'fade',
}

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const direction = useMemo(() => {
    if (!pathname) return 'fade'
    
    const baseDirection = pathToDirection[pathname]
    if (baseDirection) return baseDirection
    
    if (pathname.startsWith('/studies/')) return 'up'
    
    return 'fade'
  }, [pathname])

  const currentVariant = variants[direction]

  return (
    <motion.div
      initial={currentVariant.initial}
      animate={currentVariant.animate}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
