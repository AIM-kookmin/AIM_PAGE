import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { PinballGame } from '../PinballGame'
import { drawPinball } from '../drawPinball'
import { PinballAudio } from '../../model/audio'

jest.mock('../drawPinball', () => ({ drawPinball: jest.fn() }))
jest.mock('../../model/audio', () => ({
  PinballAudio: jest.fn().mockImplementation(() => ({
    enable: jest.fn().mockResolvedValue(true),
    play: jest.fn(),
    dispose: jest.fn(),
  })),
}))

describe('PinballGame lifecycle', () => {
  let frames: Map<number, FrameRequestCallback>
  let timestamp: number
  let frameId: number
  let hidden: boolean
  let originalVisibility: PropertyDescriptor | undefined
  let originalMatchMedia: PropertyDescriptor | undefined

  beforeEach(() => {
    frames = new Map()
    timestamp = 1000
    frameId = 0
    hidden = false
    originalVisibility = Object.getOwnPropertyDescriptor(document, 'hidden')
    originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia')
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: jest.fn(() => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() })),
    })
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      frames.set(++frameId, callback)
      return frameId
    })
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => { frames.delete(id) })
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      setTransform: jest.fn(),
    } as unknown as ReturnType<HTMLCanvasElement['getContext']>)
  })

  afterEach(() => {
    cleanup()
    jest.restoreAllMocks()
    jest.clearAllMocks()
    if (originalVisibility) Object.defineProperty(document, 'hidden', originalVisibility)
    else Reflect.deleteProperty(document, 'hidden')
    if (originalMatchMedia) Object.defineProperty(window, 'matchMedia', originalMatchMedia)
    else Reflect.deleteProperty(window, 'matchMedia')
  })

  function advance(milliseconds: number) {
    const end = timestamp + milliseconds
    while (timestamp < end) {
      timestamp = Math.min(timestamp + 20, end)
      const callbacks = Array.from(frames.values())
      frames.clear()
      if (callbacks.length) act(() => { callbacks.forEach(callback => callback(timestamp)) })
    }
  }

  function startCountdown() {
    const view = render(<PinballGame />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '민수, 지수' } })
    fireEvent.click(screen.getByRole('button', { name: /게임 시작/ }))
    expect(screen.getByText('GET READY')).toBeInTheDocument()
    return view
  }

  function displayedCountdown() {
    return screen.getByText('READY TO DROP').nextElementSibling?.textContent
  }

  it('pauses a hidden-tab countdown and resumes from the remaining time', () => {
    startCountdown()
    advance(1200)
    expect(displayedCountdown()).toBe('2')

    hidden = true
    fireEvent(document, new Event('visibilitychange'))
    expect(screen.getByText('PAUSED')).toBeInTheDocument()
    expect(frames.size).toBe(0)
    advance(30000)

    hidden = false
    fireEvent(document, new Event('visibilitychange'))
    expect(screen.getByText('PAUSED')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: '계속하기' })[0])
    expect(displayedCountdown()).toBe('2')
    advance(600)
    expect(displayedCountdown()).toBe('2')
    advance(1400)
    expect(screen.getByText('LIVE IN THE ARENA')).toBeInTheDocument()
    expect(screen.queryByText('READY TO DROP')).not.toBeInTheDocument()
  })

  it('reset during countdown cancels the round and ignores an already queued frame', () => {
    startCountdown()
    advance(1200)
    const staleFrame = Array.from(frames.values())[0]
    expect(staleFrame).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: '게임 초기화' }))
    expect(frames.size).toBe(0)
    expect(screen.getByText('READY TO PLAY')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeEnabled()

    act(() => { staleFrame(timestamp + 30000) })
    advance(5000)
    expect(frames.size).toBe(0)
    expect(screen.getByText('READY TO PLAY')).toBeInTheDocument()
    expect(screen.queryByText('LIVE IN THE ARENA')).not.toBeInTheDocument()
    expect(screen.queryByText('READY TO DROP')).not.toBeInTheDocument()
  })

  it('unmount cancels the pending frame and disposes audio without further drawing', () => {
    const { unmount } = startCountdown()
    advance(200)
    const staleFrame = Array.from(frames.values())[0]
    const audio = jest.mocked(PinballAudio).mock.results[0].value as PinballAudio
    unmount()
    const paintCount = jest.mocked(drawPinball).mock.calls.length

    expect(frames.size).toBe(0)
    expect(cancelAnimationFrame).toHaveBeenCalled()
    expect(audio.dispose).toHaveBeenCalledTimes(1)
    act(() => { staleFrame(timestamp + 20000) })
    advance(5000)
    expect(frames.size).toBe(0)
    expect(drawPinball).toHaveBeenCalledTimes(paintCount)
  })
})
