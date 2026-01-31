'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' | 'diagonal'

const directions: Direction[] = ['up', 'down', 'left', 'right', 'fade', 'scale', 'diagonal']

const variants = {
  up: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  down: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  left: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  right: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
  },
  diagonal: {
    initial: { x: '50%', y: '50%', opacity: 0 },
    animate: { x: 0, y: 0, opacity: 1 },
    exit: { x: '-50%', y: '-50%', opacity: 0 },
  },
}

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [direction, setDirection] = useState<Direction>('fade')
  const transitionIndex = useRef(0)

  useEffect(() => {
    transitionIndex.current = (transitionIndex.current + 1) % directions.length
    setDirection(directions[transitionIndex.current])
  }, [pathname])

  const currentVariant = variants[direction]

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={currentVariant.initial}
        animate={currentVariant.animate}
        exit={currentVariant.exit}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
