/** Logical canvas dimensions; renderers may scale these to any display size. */
export const BOARD_WIDTH = 720
export const BOARD_HEIGHT = 820

/** Stable participant colors, shared by the arena and roster. */
export const BALL_COLORS = ['#b8f36c', '#6edff6', '#f4bf75', '#c5a0fa', '#fb8eab', '#83e2bf', '#96b6ff', '#f1e887']

/** A name is identified independently of its spelling, so duplicates can play. */
export interface Participant {
  id: string
  name: string
  color: string
}

/** Mutable physical state of one participant. */
export interface Ball extends Participant {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  eliminated: boolean
  trail: Array<{ x: number; y: number }>
}

/** hit decays from one to zero and can drive a bumper's impact glow. */
export interface Bumper {
  x: number
  y: number
  radius: number
  hit: number
}

/** A rotating capsule with a fixed eight-pixel collision radius. */
export interface Bar {
  x: number
  y: number
  length: number
  angle: number
}

/** Events are emitted once, immediately after the corresponding physical change. */
export interface GameEvent {
  type: 'collision' | 'elimination' | 'winner' | 'sudden-death'
  participant?: Participant
  x: number
  y: number
}

/** The complete game state; eliminated is ordered from first exit to runner-up. */
export interface Simulation {
  balls: Ball[]
  bumpers: Bumper[]
  bars: Bar[]
  elapsed: number
  finished: boolean
  winner: Participant | null
  eliminated: Participant[]
  suddenDeath: boolean
  gateWidth: number
  intensity: 'normal' | 'chaos'
}

const WALL = 36
const FLOOR = 766
const BALL_RADIUS = 10
const BUMPER_LAYOUT = [
  { x: 190, y: 290, radius: 35 },
  { x: 530, y: 290, radius: 35 },
  { x: 360, y: 395, radius: 45 },
  { x: 170, y: 495, radius: 31 },
  { x: 550, y: 495, radius: 31 },
]
const BAR_LENGTHS = [184, 184]

/** Accept line breaks and commas, retaining duplicate names and all entries. */
export function parseNames(input: string): string[] {
  return input.split(/[\r\n,]+/).map((name) => name.trim()).filter(Boolean)
}

function visibleLength(value: string): number {
  // Older browsers can still validate names without requiring a polyfill.
  const Segmenter = (Intl as typeof Intl & {
    Segmenter?: new (locale: string, options: { granularity: 'grapheme' }) => {
      segment: (input: string) => Iterable<unknown>
    }
  }).Segmenter
  return Segmenter
    ? Array.from(new Segmenter('ko', { granularity: 'grapheme' }).segment(value)).length
    : Array.from(value).length
}

/** Return a user-facing validation error without truncating the supplied roster. */
export function validateNames(names: string[]): string | null {
  if (names.length < 2) return '참가자 이름을 2명 이상 입력해 주세요.'
  if (names.length > 40) return '한 번에 최대 40명까지 참가할 수 있어요.'
  if (names.some((name) => !name.trim())) return '비어 있는 참가자 이름을 확인해 주세요.'
  if (names.some((name) => visibleLength(name.trim()) > 20)) return '이름은 한 명당 20자 이내로 입력해 주세요.'
  return null
}

/** Assign unique IDs within a round; equal names remain separate participants. */
export function createParticipants(names: string[]): Participant[] {
  return names.map((name, index) => ({
    id: `player-${index + 1}`,
    name: name.trim(),
    color: BALL_COLORS[index % BALL_COLORS.length],
  }))
}

/**
 * Create a fresh round with shuffled launch positions and independent velocities.
 * A supplied random function makes a replay deterministic; it must return [0, 1).
 * Invalid rosters throw instead of silently excluding participants.
 */
export function createSimulation(
  participants: Participant[],
  intensity: 'normal' | 'chaos',
  random: () => number = Math.random,
): Simulation {
  const error = validateNames(participants.map((participant) => participant.name))
  if (error) throw new RangeError(error)
  if (new Set(participants.map((participant) => participant.id)).size !== participants.length) {
    throw new RangeError('참가자 ID는 중복될 수 없어요.')
  }

  const shuffled = [...participants]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
  }
  const columns = Math.min(participants.length, 8)
  const balls = shuffled.map((participant, index) => ({
    ...participant,
    x: 90 + (index % columns) * (540 / Math.max(columns - 1, 1)),
    y: 75 + Math.floor(index / columns) * 32,
    vx: (random() - 0.5) * 260,
    vy: 70 + random() * 130,
    radius: BALL_RADIUS,
    eliminated: false,
    trail: [],
  }))

  return {
    balls,
    bumpers: BUMPER_LAYOUT.map((bumper) => ({ ...bumper, hit: 0 })),
    bars: [
      { x: 230, y: 622, length: BAR_LENGTHS[0], angle: -0.3 },
      { x: 490, y: 622, length: BAR_LENGTHS[1], angle: 0.3 },
    ],
    elapsed: 0,
    finished: false,
    winner: null,
    eliminated: [],
    suddenDeath: false,
    gateWidth: 0,
    intensity,
  }
}

function participantOf(ball: Ball): Participant {
  return { id: ball.id, name: ball.name, color: ball.color }
}

function collideCircle(ball: Ball, bumper: Bumper, boost: number, events: GameEvent[]) {
  if (bumper.radius <= 0) return
  const dx = ball.x - bumper.x
  const dy = ball.y - bumper.y
  const distance = Math.hypot(dx, dy)
  const radius = ball.radius + bumper.radius
  if (distance >= radius) return
  const nx = distance > 0.001 ? dx / distance : 0
  const ny = distance > 0.001 ? dy / distance : -1
  ball.x = bumper.x + nx * (radius + 0.1)
  ball.y = bumper.y + ny * (radius + 0.1)
  const approach = ball.vx * nx + ball.vy * ny
  if (approach >= 0) return
  ball.vx -= (approach * 2.02 - boost) * nx
  ball.vy -= (approach * 2.02 - boost) * ny
  bumper.hit = 1
  events.push({ type: 'collision', participant: participantOf(ball), x: ball.x, y: ball.y })
}

function collideBar(ball: Ball, bar: Bar, angularSpeed: number, events: GameEvent[]) {
  if (bar.length <= 0) return
  const cosine = Math.cos(bar.angle)
  const sine = Math.sin(bar.angle)
  const projection = Math.max(-bar.length / 2, Math.min(bar.length / 2,
    (ball.x - bar.x) * cosine + (ball.y - bar.y) * sine))
  const closestX = bar.x + projection * cosine
  const closestY = bar.y + projection * sine
  const dx = ball.x - closestX
  const dy = ball.y - closestY
  const distance = Math.hypot(dx, dy)
  const radius = ball.radius + 8
  if (distance >= radius) return
  const nx = distance > 0.001 ? dx / distance : -sine
  const ny = distance > 0.001 ? dy / distance : cosine
  ball.x = closestX + nx * (radius + 0.1)
  ball.y = closestY + ny * (radius + 0.1)
  const surfaceVx = -projection * sine * angularSpeed
  const surfaceVy = projection * cosine * angularSpeed
  const approach = (ball.vx - surfaceVx) * nx + (ball.vy - surfaceVy) * ny
  if (approach >= 0) return
  ball.vx -= approach * 1.9 * nx
  ball.vy -= approach * 1.9 * ny
  events.push({ type: 'collision', participant: participantOf(ball), x: ball.x, y: ball.y })
}

function collideBalls(balls: Ball[]) {
  for (let first = 0; first < balls.length; first += 1) {
    const a = balls[first]
    if (a.eliminated) continue
    for (let second = first + 1; second < balls.length; second += 1) {
      const b = balls[second]
      if (b.eliminated) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const distance = Math.hypot(dx, dy)
      const diameter = a.radius + b.radius
      if (distance >= diameter) continue
      const nx = distance > 0.001 ? dx / distance : 1
      const ny = distance > 0.001 ? dy / distance : 0
      const overlap = (diameter - distance + 0.1) / 2
      a.x -= nx * overlap
      a.y -= ny * overlap
      b.x += nx * overlap
      b.y += ny * overlap
      const approach = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
      if (approach >= 0) continue
      const impulse = approach * 0.95
      a.vx += impulse * nx
      a.vy += impulse * ny
      b.vx -= impulse * nx
      b.vy -= impulse * ny
    }
  }
}

function advance(state: Simulation, dt: number, events: GameEvent[]) {
  state.elapsed += dt
  const chaos = state.intensity === 'chaos'
  const suddenAt = chaos ? 26 : 32
  if (!state.suddenDeath && state.elapsed >= suddenAt) {
    state.suddenDeath = true
    events.push({ type: 'sudden-death', x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2 })
  }
  const retraction = Math.max(0, 1 - Math.max(0, state.elapsed - suddenAt) / 6)
  const fullyOpen = state.elapsed >= suddenAt + 6
  state.gateWidth = state.elapsed < 8 ? 0 : Math.min(BOARD_WIDTH, 72 + (state.elapsed - 8) * (chaos ? 22 : 18))
  if (fullyOpen) state.gateWidth = BOARD_WIDTH
  state.bumpers.forEach((bumper, index) => {
    bumper.radius = BUMPER_LAYOUT[index].radius * retraction
    bumper.hit = Math.max(0, bumper.hit - dt * 4)
  })
  state.bars.forEach((bar, index) => {
    bar.length = BAR_LENGTHS[index] * retraction
    bar.angle += (index === 0 ? 1 : -1) * (chaos ? 2.5 : 1.5) * dt
  })

  const crossings: Array<{ ball: Ball; fraction: number }> = []
  for (const ball of state.balls) {
    if (ball.eliminated) continue
    const previousY = ball.y
    ball.vy += (fullyOpen ? 640 : chaos ? 420 : 330) * dt
    ball.x += ball.vx * dt
    ball.y += ball.vy * dt

    // Side walls remain throughout sudden death; only the floor opens completely.
    if (ball.x < WALL + ball.radius) {
      ball.x = WALL + ball.radius
      ball.vx = Math.abs(ball.vx) * 0.96
    } else if (ball.x > BOARD_WIDTH - WALL - ball.radius) {
      ball.x = BOARD_WIDTH - WALL - ball.radius
      ball.vx = -Math.abs(ball.vx) * 0.96
    }
    if (ball.y < 38 + ball.radius) {
      ball.y = 38 + ball.radius
      ball.vy = Math.abs(ball.vy) * 0.9
    }

    for (const bumper of state.bumpers) collideCircle(ball, bumper, chaos ? 110 : 75, events)
    state.bars.forEach((bar, index) => {
      collideBar(ball, bar, (index === 0 ? 1 : -1) * (chaos ? 2.5 : 1.5), events)
    })

    const inDrain = Math.abs(ball.x - BOARD_WIDTH / 2) + ball.radius < state.gateWidth / 2
    if (ball.y + ball.radius > FLOOR && !inDrain && ball.y < FLOOR + ball.radius && ball.vy > 0) {
      ball.y = FLOOR - ball.radius
      ball.vy = -Math.max(Math.abs(ball.vy) * 0.92, chaos ? 540 : 470)
      // Return rails push toward the arena, keeping the action moving.
      ball.vx += ball.x < BOARD_WIDTH / 2 ? 90 : -90
      events.push({ type: 'collision', participant: participantOf(ball), x: ball.x, y: FLOOR })
    }
    const speed = Math.hypot(ball.vx, ball.vy)
    if (speed > 960) {
      ball.vx *= 960 / speed
      ball.vy *= 960 / speed
    }
    if (ball.y - ball.radius > BOARD_HEIGHT) {
      crossings.push({ ball, fraction: (BOARD_HEIGHT + ball.radius - previousY) / Math.max(0.001, ball.y - previousY) })
    }
  }
  collideBalls(state.balls)

  // Sub-frame crossing times settle close finishes; never eliminate the final ball.
  crossings.sort((a, b) => a.fraction - b.fraction)
  for (const { ball } of crossings) {
    if (state.balls.length - state.eliminated.length <= 1) break
    ball.eliminated = true
    const participant = participantOf(ball)
    state.eliminated.push(participant)
    events.push({ type: 'elimination', participant, x: ball.x, y: BOARD_HEIGHT - 15 })
  }
  if (state.balls.length - state.eliminated.length === 1) {
    const winner = state.balls.find((ball) => !ball.eliminated)!
    state.winner = participantOf(winner)
    state.finished = true
    events.push({ type: 'winner', participant: state.winner, x: winner.x, y: winner.y })
  }
}

/**
 * Advance a round in seconds, mutating state and returning newly emitted events.
 * Call at a fixed 1/60s tick. Internally subdivided to <=1/120s to avoid tunneling;
 * any delayed frame is capped at 0.1s so returning to a tab cannot skip a round.
 */
export function stepSimulation(state: Simulation, dt: number): GameEvent[] {
  if (state.finished || !Number.isFinite(dt) || dt <= 0) return []
  const events: GameEvent[] = []
  const duration = Math.min(dt, 0.1)
  const steps = Math.ceil(duration / (1 / 120))
  for (let index = 0; index < steps && !state.finished; index += 1) {
    advance(state, duration / steps, events)
  }
  for (const ball of state.balls) {
    if (ball.eliminated) continue
    ball.trail.push({ x: ball.x, y: ball.y })
    if (ball.trail.length > 12) ball.trail.shift()
  }
  return events
}
