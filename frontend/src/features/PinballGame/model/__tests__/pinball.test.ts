import {
  BOARD_HEIGHT,
  createParticipants,
  createSimulation,
  parseNames,
  stepSimulation,
  validateNames,
} from '../pinball'

function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
}

describe('pinball roster', () => {
  it('accepts comma and newline input without losing duplicates or spaces within a name', () => {
    expect(parseNames('  민수, 지수\r\n민수\n\n Alex Kim ,')).toEqual(['민수', '지수', '민수', 'Alex Kim'])
    expect(parseNames('  ,\n')).toEqual([])
  })

  it('validates counts and lengths without silently discarding entries', () => {
    expect(validateNames([])).toBeTruthy()
    expect(validateNames(['하나'])).toBeTruthy()
    expect(validateNames(['하나', '둘'])).toBeNull()
    const fortyOne = parseNames(Array(41).fill('이름').join(','))
    expect(fortyOne).toHaveLength(41)
    expect(validateNames(fortyOne)).toBeTruthy()
    expect(validateNames(['가'.repeat(21), '이름'])).toBeTruthy()
    expect(validateNames(['가'.repeat(20), '이름'])).toBeNull()
    expect(validateNames(['😀'.repeat(20), '이름'])).toBeNull()
    expect(validateNames(['  ', '이름'])).toBeTruthy()
  })

  it('gives duplicate names distinct identities and refuses invalid rounds', () => {
    const players = createParticipants(['민수', '민수'])
    expect(players[0].id).not.toBe(players[1].id)
    expect(() => createSimulation(createParticipants(['하나']), 'normal')).toThrow(RangeError)
    expect(() => createSimulation([players[0], players[0]], 'normal')).toThrow(RangeError)
  })

  it('shuffles launch positions without changing the roster', () => {
    const players = createParticipants(Array.from({ length: 8 }, (_, index) => `참가자 ${index}`))
    const first = createSimulation(players, 'normal', seededRandom(1))
    const second = createSimulation(players, 'normal', seededRandom(2))
    expect(first.balls.map((ball) => ball.id)).not.toEqual(second.balls.map((ball) => ball.id))
    expect(first.balls.map((ball) => ball.id).sort()).toEqual(players.map((player) => player.id).sort())
  })
})

describe('pinball physics and completion', () => {
  it.each(['normal', 'chaos'] as const)('completes 2, 8 and 40-player %s rounds with exactly one survivor across seeds', (intensity) => {
    for (const count of [2, 8, 40]) {
      for (const seed of [1, 19, 142, 8901, 999991]) {
        const players = createParticipants(Array.from({ length: count }, (_, index) => `참가자 ${index}`))
        const state = createSimulation(players, intensity, seededRandom(seed))
        const eventIds: string[] = []
        let winnerEvents = 0
        let collisionCount = 0
        let suddenEvents = 0
        for (let frame = 0; frame < 60 * 52 && !state.finished; frame += 1) {
          const events = stepSimulation(state, 1 / 60)
          for (const event of events) {
            if (event.type === 'elimination') eventIds.push(event.participant!.id)
            if (event.type === 'winner') winnerEvents += 1
            if (event.type === 'collision') collisionCount += 1
            if (event.type === 'sudden-death') suddenEvents += 1
          }
          if (frame % 180 === 0) {
            expect(state.balls.every((ball) => [ball.x, ball.y, ball.vx, ball.vy].every(Number.isFinite))).toBe(true)
          }
        }
        expect(state.finished).toBe(true)
        expect(state.elapsed).toBeLessThan(52)
        expect(state.elapsed).toBeGreaterThan(8)
        expect(state.winner).not.toBeNull()
        expect(winnerEvents).toBe(1)
        expect(suddenEvents).toBeLessThanOrEqual(1)
        expect(collisionCount).toBeGreaterThan(0)
        expect(state.eliminated).toHaveLength(count - 1)
        expect(new Set(eventIds).size).toBe(count - 1)
        expect(state.balls.filter((ball) => !ball.eliminated)).toHaveLength(1)
        expect([...eventIds, state.winner!.id].sort()).toEqual(players.map((player) => player.id).sort())
        expect(stepSimulation(state, 1 / 60)).toEqual([])
      }
    }
  })

  it('resolves simultaneous exits in crossing order and preserves the final survivor', () => {
    const state = createSimulation(createParticipants(['먼저', '나중']), 'normal', seededRandom(3))
    state.balls.forEach((ball, index) => {
      ball.x = 350 + index * 30
      ball.y = BOARD_HEIGHT + ball.radius - (index === 0 ? 1 : 2)
      ball.vx = 0
      ball.vy = 500
    })
    const expectedWinner = state.balls[1].id
    const events = stepSimulation(state, 1 / 60)
    expect(state.winner?.id).toBe(expectedWinner)
    expect(events.filter((event) => event.type === 'elimination')).toHaveLength(1)
    expect(events.filter((event) => event.type === 'winner')).toHaveLength(1)
  })

  it('ignores invalid elapsed values and limits background-tab catch-up', () => {
    const state = createSimulation(createParticipants(['하나', '둘']), 'normal', seededRandom(4))
    for (const dt of [0, -1, Number.NaN, Infinity]) expect(stepSimulation(state, dt)).toEqual([])
    expect(state.elapsed).toBe(0)
    stepSimulation(state, 200)
    expect(state.elapsed).toBeCloseTo(0.1)
    expect(state.finished).toBe(false)
  })

  it('clears all obstacles and opens the drain during sudden death', () => {
    const state = createSimulation(createParticipants(['하나', '둘']), 'normal', seededRandom(5))
    state.elapsed = 38
    const events = stepSimulation(state, 1 / 60)
    expect(events.filter((event) => event.type === 'sudden-death')).toHaveLength(1)
    expect(state.bumpers.every((bumper) => bumper.radius === 0)).toBe(true)
    expect(state.bars.every((bar) => bar.length === 0)).toBe(true)
    expect(state.gateWidth).toBe(720)
    expect(stepSimulation(state, 1 / 60).filter((event) => event.type === 'sudden-death')).toHaveLength(0)
  })
})
