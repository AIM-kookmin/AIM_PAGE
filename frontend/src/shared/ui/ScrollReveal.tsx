'use client'

import { motion, useInView, UseInViewOptions } from 'framer-motion'
import { useRef, ReactNode } from 'react'
import { cn } from './cn'

type Direction = 'up' | 'down' | 'left' | 'right'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  direction?: Direction
  delay?: number
  duration?: number
  threshold?: number
  once?: boolean
}

export default function ScrollReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: threshold } as UseInViewOptions)

  const getVariants = () => {
    const distance = 30
    const variants = {
      hidden: { opacity: 0, x: 0, y: 0 },
      visible: { opacity: 1, x: 0, y: 0 },
    }

    switch (direction) {
      case 'up':
        variants.hidden.y = distance
        break
      case 'down':
        variants.hidden.y = -distance
        break
      case 'left':
        variants.hidden.x = distance
        break
      case 'right':
        variants.hidden.x = -distance
        break
    }

    return variants
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={getVariants()}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
