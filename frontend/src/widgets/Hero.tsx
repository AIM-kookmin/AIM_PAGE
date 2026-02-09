'use client'

import { useRef, memo, useMemo } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'

const ParticleBackground = dynamic(
  () => import('@/shared/ui/ParticleBackground').then(mod => ({ default: mod.ParticleBackground })),
  { ssr: false }
)

interface HeroData {
  badge?: string
  title: string
  subtitle: string
  description: string
}

const ScrollIndicator = memo(function ScrollIndicator() {
  return (
    <motion.div 
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8, duration: 0.6 }}
    >
      <span className="text-white/40 text-sm tracking-widest uppercase">Scroll</span>
      <motion.div
        className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2"
        animate={{ borderColor: ['rgba(255,255,255,0.2)', 'rgba(139,92,246,0.4)', 'rgba(255,255,255,0.2)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          className="w-1.5 h-1.5 bg-violet-400 rounded-full"
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  )
})

interface HeroProps {
  data?: HeroData
}

function Hero({ data }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  // Memoize data processing
  const { badge, description, titleLetters, subtitleWords } = useMemo(() => {
    const badgeText = data?.badge || '국민대학교 AI 동아리'
    const titleText = data?.title || 'AIM'
    const subtitleText = data?.subtitle || 'AI Monsters'
    const descText = data?.description || '함께 코딩하고, 학습하며, 세상을 바꿀 AI 프로젝트를 만들어갑니다.'

    return {
      badge: badgeText,
      description: descText,
      titleLetters: titleText.split(''),
      subtitleWords: subtitleText.split(' ')
    }
  }, [data])

  return (
    <section 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
    >
      <ParticleBackground className="z-0" />
      
      <motion.div 
        className="relative z-10 h-full flex flex-col items-center justify-center px-4"
        style={{ opacity, scale, y }}
      >
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: 'backOut' }}
        >
          <span className="inline-block px-4 py-2 text-sm font-medium text-violet-400 border border-violet-500/30 rounded-full bg-violet-500/10 backdrop-blur-sm">
            {badge}
          </span>
        </motion.div>

        <h1 className="text-center mb-8">
          <span className="block text-7xl md:text-9xl lg:text-[12rem] font-black tracking-tighter">
            {titleLetters.map((letter, i) => (
              <motion.span
                key={`title-${i}`}
                className="inline-block bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent"
                initial={{
                  opacity: 0,
                  x: i % 2 === 0 ? -100 : 100,
                  y: i === 1 ? -50 : 0,
                  rotate: (i - 1) * 15
                }}
                whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  delay: 0.2 + i * 0.15,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                {letter}
              </motion.span>
            ))}
          </span>
          
          <span className="block text-2xl md:text-4xl lg:text-5xl font-bold text-white/80 tracking-wide mt-4">
            {subtitleWords.map((word, i) => (
              <motion.span
                key={`subtitle-${i}`}
                className="inline-block mr-4 last:mr-0"
                initial={{
                  opacity: 0,
                  x: i === 0 ? -50 : 50,
                  scale: 0.8
                }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  delay: 0.8 + i * 0.2,
                  duration: 0.6,
                  ease: 'easeOut'
                }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          className="text-lg md:text-xl text-white/60 max-w-2xl text-center mb-12 leading-relaxed whitespace-pre-line"
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {description}
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 1.4, duration: 0.6, ease: 'easeOut' }}
          >
            <Link 
              href="/about"
              className="group relative block px-8 py-4 bg-white text-black rounded-xl font-bold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10">동아리 알아보기</span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-200 to-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 1.5, duration: 0.6, ease: 'easeOut' }}
          >
            <Link
              href="/recruit"
              className="block px-8 py-4 rounded-xl border border-white/20 text-white font-bold backdrop-blur-sm hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            >
              모집 공고
            </Link>
          </motion.div>
        </div>

        <ScrollIndicator />
      </motion.div>
    </section>
  )
}

Hero.displayName = 'Hero'

export default memo(Hero)
