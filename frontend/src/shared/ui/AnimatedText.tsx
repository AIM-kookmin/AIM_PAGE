'use client'

import { motion, Variants } from 'framer-motion'
import { cn } from './cn'

interface AnimatedTextProps {
  text: string
  className?: string
  type?: 'words' | 'chars'
  delay?: number
  staggerDelay?: number
}

export default function AnimatedText({
  text,
  className,
  type = 'words',
  delay = 0,
  staggerDelay = 0.05,
}: AnimatedTextProps) {
  const words = text.split(' ')

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: staggerDelay, delayChildren: delay * i },
    }),
  }

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  }

  if (type === 'chars') {
    return (
      <motion.div
        className={cn('overflow-hidden', className)}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {Array.from(text).map((char, index) => (
          <motion.span variants={child} key={index} className="inline-block">
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn('flex flex-wrap overflow-hidden', className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className="mr-1.5 inline-block">
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}
