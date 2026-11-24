type Cue = 'collision' | 'countdown' | 'elimination' | 'winner' | 'sudden-death'

/** Optional, gesture-activated arcade audio with a single disposable audio graph. */
export class PinballAudio {
  private context: AudioContext | null = null
  private gain: GainNode | null = null
  private enabled = false
  private lastCollision = 0

  async enable(enabled: boolean): Promise<boolean> {
    this.enabled = enabled
    if (!enabled) {
      if (this.gain && this.context) this.gain.gain.setValueAtTime(0, this.context.currentTime)
      return false
    }
    try {
      if (!this.context) {
        const AudioConstructor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!AudioConstructor) return false
        this.context = new AudioConstructor()
        this.gain = this.context.createGain()
        this.gain.connect(this.context.destination)
      }
      await this.context.resume()
      if (this.enabled) this.gain?.gain.setValueAtTime(0.13, this.context.currentTime)
      return this.enabled && this.context.state === 'running'
    } catch {
      this.enabled = false
      return false
    }
  }

  play(cue: Cue): void {
    const context = this.context
    if (!this.enabled || !context || !this.gain || context.state !== 'running') return
    const now = context.currentTime
    if (cue === 'collision' && now - this.lastCollision < 0.075) return
    if (cue === 'collision') this.lastCollision = now
    const notes = cue === 'winner' ? [523, 659, 784, 1047] : cue === 'elimination' ? [220, 110] : cue === 'sudden-death' ? [196, 196, 294] : cue === 'countdown' ? [440] : [700]
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      const start = now + index * 0.12
      const duration = cue === 'collision' ? 0.055 : 0.22
      oscillator.type = cue === 'elimination' ? 'sawtooth' : 'sine'
      oscillator.frequency.setValueAtTime(frequency, start)
      oscillator.frequency.exponentialRampToValueAtTime(frequency * (cue === 'collision' ? 1.7 : 0.98), start + duration)
      envelope.gain.setValueAtTime(0, start)
      envelope.gain.linearRampToValueAtTime(0.5, start + 0.008)
      envelope.gain.exponentialRampToValueAtTime(0.001, start + duration)
      oscillator.connect(envelope)
      envelope.connect(this.gain!)
      oscillator.start(start)
      oscillator.stop(start + duration + 0.01)
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect() }
    })
  }

  dispose(): void {
    this.enabled = false
    void this.context?.close().catch(() => undefined)
    this.context = null
    this.gain = null
  }
}
