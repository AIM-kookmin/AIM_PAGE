'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ArrowDown, ArrowUpRight, AudioLines, Check, ChevronRight, CircleHelp, Flame, Pause, Play, RotateCcw, Trophy, Users, Volume2, VolumeX, Zap } from 'lucide-react'
import { createParticipants, createSimulation, parseNames, stepSimulation, validateNames, type Participant, type Simulation } from '../model/pinball'
import { PinballAudio } from '../model/audio'
import { drawPinball, type Spark } from './drawPinball'
import styles from './PinballGame.module.css'

type Phase = 'idle' | 'countdown' | 'running' | 'paused' | 'finished'
interface Scoreboard {
  elapsed: number
  remaining: number
  eliminated: Participant[]
  winner: Participant | null
  suddenDeath: boolean
}

const EMPTY_SCORE: Scoreboard = { elapsed: 0, remaining: 0, eliminated: [], winner: null, suddenDeath: false }
const DEMO_NAMES = '민준, 서연, 도윤, 지우, 하준, 수빈, 시우, 하린'

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
}

function snapshot(simulation: Simulation): Scoreboard {
  return { elapsed: simulation.elapsed, remaining: simulation.balls.length - simulation.eliminated.length, eliminated: [...simulation.eliminated], winner: simulation.winner, suddenDeath: simulation.suddenDeath }
}

/** Name-based, client-only pinball draw with a physical last-survivor result. */
export function PinballGame() {
  const [input, setInput] = useState('')
  const [intensity, setIntensity] = useState<'normal' | 'chaos'>('normal')
  const [phase, setPhase] = useState<Phase>('idle')
  const [countdown, setCountdown] = useState(3)
  const [score, setScore] = useState<Scoreboard>(EMPTY_SCORE)
  const [roster, setRoster] = useState<Participant[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sound, setSound] = useState(false)
  const [audioMessage, setAudioMessage] = useState('')
  const [announcement, setAnnouncement] = useState('이름을 입력하고 게임을 시작해 주세요.')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [canvasAvailable, setCanvasAvailable] = useState(true)
  const [duel, setDuel] = useState(false)
  const [impact, setImpact] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nameRef = useRef<HTMLTextAreaElement>(null)
  const arenaRef = useRef<HTMLDivElement>(null)
  const simulationRef = useRef<Simulation | null>(null)
  const sparksRef = useRef<Spark[]>([])
  const audioRef = useRef<PinballAudio | null>(null)
  const countdownRef = useRef(3)
  const pausePhaseRef = useRef<'running' | 'countdown'>('running')
  const slowMotionRef = useRef({ used: false, remaining: 0 })
  const names = useMemo(() => parseNames(input), [input])
  const validation = validateNames(names)
  const entrants = useMemo(() => createParticipants(names.slice(0, 40)), [names])
  const locked = phase !== 'idle' && phase !== 'finished'
  const activeRoster = phase === 'idle' ? entrants : roster
  const eliminatedIds = new Set(score.eliminated.map(person => person.id))
  const preview = useMemo(() => {
    const people = validation === null ? createParticipants(names) : createParticipants(['AIM', 'PLAY', 'LUCK', 'YOU', 'WIN', 'GO'])
    const state = createSimulation(people, intensity, () => 0.47)
    state.balls.forEach((ball, i) => {
      ball.x = 105 + (i * 107) % 500
      ball.y = 162 + (i * 137) % 485
      ball.trail = [{ x: ball.x - 12, y: ball.y - 24 }, { x: ball.x - 5, y: ball.y - 10 }]
    })
    return state
  }, [intensity, names, validation])

  useEffect(() => {
    audioRef.current = new PinballAudio()
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(media.matches)
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => { media.removeEventListener('change', update); audioRef.current?.dispose() }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) { setCanvasAvailable(false); return }
    let frame = 0
    let previous = 0
    let accumulator = 0
    let sinceSnapshot = 0
    let width = 0
    let height = 0
    let stopped = false
    const paint = () => drawPinball(context, phase === 'idle' ? preview : simulationRef.current || preview, width, height, sparksRef.current, reducedMotion, phase === 'idle')
    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      paint()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const tick = (timestamp: number) => {
      if (stopped) return
      const delta = previous ? Math.min((timestamp - previous) / 1000, 0.05) : 0
      previous = timestamp
      const simulation = simulationRef.current
      if (phase === 'countdown') {
        const before = Math.ceil(countdownRef.current)
        countdownRef.current = Math.max(0, countdownRef.current - delta)
        const after = Math.ceil(countdownRef.current)
        if (after !== before && after > 0) { setCountdown(after); audioRef.current?.play('countdown') }
        if (countdownRef.current <= 0) {
          setAnnouncement('출발! 마지막까지 살아남은 사람이 당첨됩니다.')
          setPhase('running')
          return
        }
      } else if (phase === 'running' && simulation) {
        const slowMotion = slowMotionRef.current
        if (!slowMotion.used && simulation.balls.length - simulation.eliminated.length === 2 && simulation.elapsed > 6) {
          slowMotion.used = true
          slowMotion.remaining = reducedMotion ? 0 : 1.8
          setDuel(true)
          setAnnouncement('파이널 듀얼! 이제 단 두 명이 남았습니다.')
        }
        slowMotion.remaining = Math.max(0, slowMotion.remaining - delta)
        accumulator += delta * (slowMotion.remaining > 0 ? 0.45 : 1)
        sinceSnapshot += delta
        let importantEvent = false
        while (accumulator >= 1 / 120 && !simulation.finished) {
          const events = stepSimulation(simulation, 1 / 120)
          accumulator -= 1 / 120
          events.forEach(event => {
            audioRef.current?.play(event.type)
            if (event.type === 'collision' || event.type === 'elimination') {
              if (!reducedMotion && sparksRef.current.length < 160) {
                const count = event.type === 'elimination' ? 20 : 5
                for (let i = 0; i < count; i++) {
                  const angle = Math.random() * Math.PI * 2
                  const speed = 45 + Math.random() * 125
                  sparksRef.current.push({ x: event.x, y: event.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color: event.participant?.color || '#c4b5fd' })
                }
              }
            }
            if (event.type === 'elimination') {
              importantEvent = true
              setAnnouncement(`${event.participant?.name} 탈락. ${simulation.balls.length - simulation.eliminated.length}명 생존.`)
              setImpact(value => value + 1)
            } else if (event.type === 'sudden-death') {
              importantEvent = true
              setAnnouncement('서든데스! 장애물이 사라지고 탈락 구간이 넓어집니다.')
            }
          })
        }
        if (importantEvent || sinceSnapshot >= 0.12 || simulation.finished) {
          setScore(snapshot(simulation))
          sinceSnapshot = 0
        }
        if (simulation.finished) {
          setAnnouncement(`최종 당첨자는 ${simulation.winner?.name}입니다!`)
          setPhase('finished')
          paint()
          return
        }
      }
      sparksRef.current = sparksRef.current.filter(spark => {
        spark.x += spark.vx * delta
        spark.y += spark.vy * delta
        spark.vy += 100 * delta
        spark.life -= delta * 2
        return spark.life > 0
      })
      paint()
      if (phase === 'running' || phase === 'countdown') frame = requestAnimationFrame(tick)
    }
    if (phase === 'running' || phase === 'countdown') frame = requestAnimationFrame(tick)
    const onVisibility = () => {
      if (document.hidden && (phase === 'running' || phase === 'countdown')) {
        pausePhaseRef.current = phase
        setPhase('paused')
        setAnnouncement('다른 화면으로 이동해 게임을 일시 정지했습니다.')
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => { stopped = true; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility) }
  }, [phase, preview, reducedMotion])

  const start = () => {
    if (validation) { setError(validation); nameRef.current?.focus(); return }
    if (!canvasAvailable) return
    const people = createParticipants(names)
    const simulation = createSimulation(people, intensity)
    simulationRef.current = simulation
    sparksRef.current = []
    slowMotionRef.current = { used: false, remaining: 0 }
    countdownRef.current = 3
    setRoster(people)
    setScore(snapshot(simulation))
    setCountdown(3)
    setDuel(false)
    setError(null)
    setAnnouncement(`${people.length}명 참가. 3초 뒤 출발합니다.`)
    setPhase('countdown')
    if (sound) void audioRef.current?.enable(true).then(() => audioRef.current?.play('countdown'))
    if (window.innerWidth < 760) arenaRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  const reset = (focus = false) => {
    simulationRef.current = null
    sparksRef.current = []
    setPhase('idle')
    setScore(EMPTY_SCORE)
    setDuel(false)
    setAnnouncement('새 게임을 준비합니다. 이름과 모드를 변경할 수 있습니다.')
    if (focus) requestAnimationFrame(() => { nameRef.current?.focus(); nameRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' }) })
  }

  const togglePause = () => {
    if (phase === 'paused') {
      setPhase(pausePhaseRef.current)
      setAnnouncement('게임을 계속합니다.')
      if (sound) void audioRef.current?.enable(true)
    } else if (phase === 'running' || phase === 'countdown') {
      pausePhaseRef.current = phase
      setPhase('paused')
      setAnnouncement('게임을 일시 정지했습니다.')
    }
  }

  const toggleSound = async () => {
    const enabled = await audioRef.current?.enable(!sound)
    setSound(Boolean(enabled))
    setAudioMessage(!sound && !enabled ? '이 브라우저에서는 소리를 사용할 수 없어요. 게임은 계속할 수 있습니다.' : '')
    if (enabled) audioRef.current?.play('countdown')
  }

  const status = phase === 'idle' ? 'READY TO PLAY' : phase === 'countdown' ? 'GET READY' : phase === 'paused' ? 'PAUSED' : phase === 'finished' ? 'GAME COMPLETE' : score.suddenDeath ? 'SUDDEN DEATH' : duel ? 'FINAL DUEL' : 'LIVE IN THE ARENA'

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <div className={styles.eyebrow}><span className={styles.eyebrowDot} /> AIM ARCADE <span className={styles.eyebrowSlash}>/</span> GAME 001</div>
            <h1 className={styles.title}>PINBALL<span>SURVIVAL<span className={styles.titleStar}>✳</span></span></h1>
          </div>
          <div className={styles.intro}>
            <span className={styles.introLine} />
            <p>끝까지 튀어라.<br /><strong>마지막 행운은 누구에게?</strong></p>
            <span>이름을 넣고, 운명의 핀볼을 시작하세요.</span>
          </div>
        </header>

        <div className={styles.gameLayout}>
          <aside className={styles.console} aria-label="게임 설정">
            <div className={styles.consoleHeader}><span>PLAYER SETUP</span><span className={styles.stepNumber}>01 — 02</span></div>
            <div className={styles.setupBody}>
              <div className={styles.sectionHeading}><h2><Users size={17} /> 참가자</h2><span className={styles.count}>{names.length}<span> / 40</span></span></div>
              <label className={styles.inputLabel} htmlFor="pinball-names">한 줄에 한 명, 또는 쉼표로 구분해 주세요.</label>
              <textarea id="pinball-names" ref={nameRef} value={input} disabled={locked} onChange={event => { setInput(event.target.value); setError(null) }} placeholder={'민준\n서연\n도윤\n지우\n... 함께할 친구들의 이름'} className={styles.nameInput} rows={6} maxLength={4000} aria-describedby="pinball-input-hint pinball-error" aria-invalid={Boolean(error || (input && validation))} data-lenis-prevent />
              <div className={styles.inputMeta}><span id="pinball-input-hint">2–40명 · 이름당 최대 20자</span><button type="button" disabled={locked} onClick={() => { setInput(DEMO_NAMES); setError(null) }}>예시 넣기 <ArrowUpRight size={12} /></button></div>
              <p id="pinball-error" className={styles.error} role="alert">{error || (input && validation) || ''}</p>
              <div className={styles.modeHeading}><span className={styles.stepBadge}>02</span><h2>게임 텐션</h2></div>
              <div className={styles.modes} role="group" aria-label="게임 텐션">
                <button type="button" disabled={locked} aria-pressed={intensity === 'normal'} onClick={() => setIntensity('normal')} className={intensity === 'normal' ? styles.modeSelected : styles.mode}><Zap size={17} /><strong>클래식</strong><span>쫄깃한 한 판</span>{intensity === 'normal' && <Check size={12} className={styles.modeCheck} />}</button>
                <button type="button" disabled={locked} aria-pressed={intensity === 'chaos'} onClick={() => setIntensity('chaos')} className={intensity === 'chaos' ? styles.modeSelected : styles.mode}><Flame size={17} /><strong>카오스</strong><span>더 빠르게, 더 강하게</span>{intensity === 'chaos' && <Check size={12} className={styles.modeCheck} />}</button>
              </div>
              {locked ? <div className={styles.runningControls}><button type="button" className={styles.startButton} onClick={togglePause}>{phase === 'paused' ? <Play size={17} fill="currentColor" /> : <Pause size={17} fill="currentColor" />}{phase === 'paused' ? '계속하기' : '일시 정지'}</button><button type="button" className={styles.resetButton} onClick={() => reset()} aria-label="게임 초기화"><RotateCcw size={18} /></button></div> : <button type="button" className={styles.startButton} onClick={start} disabled={!canvasAvailable}><Play size={17} fill="currentColor" />{phase === 'finished' ? '다시 한 판' : '게임 시작'}<span>LET’S GO <ChevronRight size={13} /></span></button>}
              <p className={styles.startHint}>{locked ? '진행 중에는 참가자와 모드가 고정됩니다.' : '조작은 필요 없어요. 이름만 넣으면 준비 끝.'}</p>
            </div>
            <div className={styles.rules}>
              <h3><CircleHelp size={15} /> HOW TO PLAY</h3>
              <p><span>01</span> 이름마다 하나의 공으로 출전해요.</p>
              <p><span>02</span> 아래로 떨어지면 아쉽지만 탈락!</p>
              <p><span>03</span> <strong>마지막까지 살아남으면 당첨.</strong></p>
              <div className={styles.ruleFootnote}>장애물이 사라지는 서든데스까지,<br />끝날 때까지 끝난 게 아니니까.</div>
            </div>
          </aside>

          <section className={styles.arenaColumn} aria-label="핀볼 경기장" ref={arenaRef}>
            <div className={styles.arenaTopbar}>
              <div className={styles.arenaStatus}><span className={`${styles.statusDot} ${phase === 'running' ? styles.liveDot : ''}`} />{status}</div>
              <button type="button" className={styles.soundButton} onClick={() => void toggleSound()} aria-label={sound ? '효과음 끄기' : '효과음 켜기'} aria-pressed={sound}>{sound ? <Volume2 size={16} /> : <VolumeX size={16} />}<span>SOUND {sound ? 'ON' : 'OFF'}</span></button>
            </div>
            <div className={`${styles.cabinet} ${score.suddenDeath ? styles.dangerCabinet : ''}`}>
              <div className={styles.hud}>
                <div><span>SURVIVORS</span><strong>{phase === 'idle' ? String(names.length).padStart(2, '0') : String(score.remaining).padStart(2, '0')}<small> / {phase === 'idle' ? String(names.length).padStart(2, '0') : String(roster.length).padStart(2, '0')}</small></strong></div>
                <div className={styles.hudCenter}><span className={styles.hudDiamond}>◇</span><span>{intensity === 'chaos' ? 'CHAOS MODE' : 'CLASSIC MODE'}</span></div>
                <div className={styles.hudTime}><span>TIME</span><strong>{formatTime(score.elapsed)}</strong></div>
              </div>
              <div className={styles.stage}>
                <div className={!reducedMotion && impact > 0 && locked ? impact % 2 ? styles.impact : styles.impactAlternate : styles.canvasWrap}>
                  <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label="참가자의 공이 장애물에 튕기며 움직이는 핀볼 경기장. 생존 현황과 최종 결과는 아래 목록에서도 확인할 수 있습니다." />
                </div>
                {phase === 'idle' && <div className={styles.previewTag}><span /> ARENA PREVIEW <ArrowDown size={11} /></div>}
                {phase === 'countdown' && <div className={styles.overlay}><div className={styles.countdownLabel}>READY TO DROP</div><div key={countdown} className={styles.countdown}>{countdown}</div><p>{roster.length}개의 공, 단 하나의 행운.</p></div>}
                {phase === 'paused' && <div className={styles.overlay}><Pause size={36} className={styles.pauseIcon} /><h2 className={styles.pauseTitle}>잠깐, 숨 고르기.</h2><p>행운도 잠시 기다리는 중이에요.</p><button type="button" className={styles.overlayAction} onClick={togglePause}><Play size={16} fill="currentColor" /> 계속하기</button></div>}
                {phase === 'finished' && score.winner && <div className={`${styles.overlay} ${styles.winnerOverlay}`} data-lenis-prevent><div className={styles.winnerOrb}><Trophy size={34} /></div><span className={styles.winnerKicker}>THE LAST ONE STANDING</span><h2 className={styles.winnerName}>{score.winner.name}</h2><p className={styles.winnerCaption}>마지막까지 살아남은 오늘의 주인공!</p><div className={styles.winnerStats}><span>{roster.length}명 중 최종 생존</span><i /><span>{formatTime(score.elapsed)}</span></div><button type="button" className={styles.overlayAction} onClick={start}><RotateCcw size={16} /> 한 번 더 도전</button><button type="button" className={styles.editButton} onClick={() => reset(true)}>이름 바꾸기 <ArrowUpRight size={13} /></button><div className={styles.winnerDecoration} aria-hidden="true">WINNER</div></div>}
                {!canvasAvailable && <div className={styles.overlay}><p>이 브라우저에서 경기장을 표시할 수 없어요.<br />Canvas를 지원하는 브라우저로 열어 주세요.</p></div>}
              </div>
              <div className={styles.arenaFooter}><AudioLines size={14} /><span>{phase === 'idle' ? 'BOUNCE. SURVIVE. WIN.' : phase === 'finished' ? '행운의 주인공이 결정되었습니다.' : score.suddenDeath ? '서든데스 · 장애물 해제, 탈락 구간 확장' : duel ? '파이널 듀얼 · 두 사람의 마지막 승부' : score.elapsed >= 8 ? '게이트 오픈 · 마지막 공이 당첨됩니다.' : '8초 뒤 게이트 오픈 · 마지막 공이 당첨됩니다.'}</span><span className={styles.footerCross}>+</span></div>
            </div>
            <div className={styles.rosterPanel}>
              <div className={styles.rosterHeading}><h2>생존 현황 <span>{activeRoster.length} PLAYERS</span></h2><span className={styles.legend}><i /> 생존 <i className={styles.legendOut} /> 탈락</span></div>
              {activeRoster.length === 0 ? <p className={styles.emptyRoster}>참가자의 이름을 입력하면 이곳에 표시돼요.</p> : <ul className={styles.roster} aria-label="참가자별 생존 현황" data-lenis-prevent>{activeRoster.map((person, index) => <li key={person.id} style={{ '--player-color': person.color } as CSSProperties} className={`${styles.player} ${eliminatedIds.has(person.id) && phase !== 'idle' ? styles.playerOut : ''} ${score.winner?.id === person.id ? styles.playerWinner : ''}`}><span className={styles.playerDot} /><span>{person.name}</span><span className={styles.playerNumber}>{String(index + 1).padStart(2, '0')}</span><span className={styles.srOnly}>{phase === 'idle' ? '대기' : score.winner?.id === person.id ? '최종 당첨' : eliminatedIds.has(person.id) ? '탈락' : '생존'}</span>{score.winner?.id === person.id && <Trophy size={12} />}</li>)}</ul>}
              {score.eliminated.length > 0 && <p className={styles.latestOut}>최근 탈락 <span>{score.eliminated.slice(-3).reverse().map(person => person.name).join(' · ')}</span></p>}
            </div>
            {audioMessage && <p role="status" className={styles.audioMessage}>{audioMessage}</p>}
          </section>
        </div>
        <footer className={styles.pageFooter}><span>A LITTLE LUCK. A LOT OF SUSPENSE.</span><span>AIM ARCADE <span>©</span></span></footer>
        <p role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>{announcement}</p>
      </div>
    </div>
  )
}
