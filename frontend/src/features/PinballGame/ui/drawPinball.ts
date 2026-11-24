import { BOARD_HEIGHT, BOARD_WIDTH, type Simulation } from '../model/pinball'

export interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

function circle(context: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
}

/** Paint the current physics state; rendering never changes the game outcome. */
export function drawPinball(context: CanvasRenderingContext2D, state: Simulation, width: number, height: number, sparks: Spark[], reducedMotion: boolean, preview: boolean): void {
  context.clearRect(0, 0, width, height)
  const scale = Math.min(width / BOARD_WIDTH, height / BOARD_HEIGHT)
  context.save()
  context.translate((width - BOARD_WIDTH * scale) / 2, (height - BOARD_HEIGHT * scale) / 2)
  context.scale(scale, scale)
  const danger = state.suddenDeath
  const accent = danger ? '#f5b55b' : '#a897fa'
  const background = context.createRadialGradient(360, 340, 40, 360, 380, 510)
  background.addColorStop(0, danger ? '#231a1d' : '#19152b')
  background.addColorStop(1, '#0a0a11')
  context.fillStyle = background
  context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT)

  context.fillStyle = '#ffffff0d'
  for (let x = 24; x < BOARD_WIDTH; x += 24) {
    for (let y = 20; y < BOARD_HEIGHT; y += 24) {
      circle(context, x, y, 0.9)
      context.fill()
    }
  }
  context.strokeStyle = '#ffffff05'
  context.lineWidth = 1
  for (const radius of [155, 240, 320]) {
    circle(context, 360, 400, radius)
    context.stroke()
  }
  context.textAlign = 'center'
  context.fillStyle = '#ffffff04'
  context.font = 'bold 176px Impact, Haettenschweiler, sans-serif'
  context.fillText('AIM', 360, 565)

  context.lineJoin = 'round'
  context.lineCap = 'round'
  context.strokeStyle = '#29243c'
  context.lineWidth = 15
  context.beginPath()
  context.moveTo(36, 766)
  context.lineTo(36, 72)
  context.quadraticCurveTo(36, 38, 70, 38)
  context.lineTo(650, 38)
  context.quadraticCurveTo(684, 38, 684, 72)
  context.lineTo(684, 766)
  context.stroke()
  context.strokeStyle = `${accent}70`
  context.lineWidth = 2
  context.stroke()

  context.strokeStyle = accent
  context.lineWidth = 3
  for (const x of [36, 684]) {
    context.beginPath()
    context.moveTo(x, 195)
    context.lineTo(x, 268)
    context.moveTo(x, 470)
    context.lineTo(x, 543)
    context.stroke()
  }

  context.font = '11px "Courier New", monospace'
  context.fillStyle = '#8b849d'
  context.fillText(preview ? 'READY TO MAKE YOUR OWN LUCK?' : danger ? 'SUDDEN DEATH — NO SECOND CHANCE' : 'LAST BALL STANDING', 360, 80)
  context.strokeStyle = '#ffffff0d'
  context.beginPath()
  context.moveTo(130, 100)
  context.lineTo(590, 100)
  context.stroke()

  state.bumpers.forEach((bumper, index) => {
    if (bumper.radius <= 0) return
    const hit = Math.min(1, Math.max(0, bumper.hit))
    context.shadowBlur = reducedMotion ? 0 : 14 + hit * 22
    context.shadowColor = accent
    context.fillStyle = danger ? '#382922' : '#34264c'
    circle(context, bumper.x, bumper.y, bumper.radius)
    context.fill()
    context.strokeStyle = accent
    context.lineWidth = 2 + hit * 2
    context.stroke()
    context.shadowBlur = 0
    circle(context, bumper.x, bumper.y, Math.max(1, bumper.radius - 7))
    context.strokeStyle = `${accent}45`
    context.lineWidth = 1
    context.stroke()
    context.fillStyle = hit > 0.2 ? '#ffffff' : accent
    context.font = 'bold 15px "Courier New", monospace'
    context.fillText(index % 3 === 0 ? '+' : '×', bumper.x, bumper.y + 5)
    if (hit > 0.05 && !reducedMotion) {
      circle(context, bumper.x, bumper.y, bumper.radius + (1 - hit) * 18)
      context.strokeStyle = `${accent}${Math.round(hit * 90).toString(16).padStart(2, '0')}`
      context.stroke()
    }
  })

  state.bars.forEach(bar => {
    if (bar.length <= 0) return
    context.save()
    context.translate(bar.x, bar.y)
    context.rotate(bar.angle)
    context.shadowColor = accent
    context.shadowBlur = reducedMotion ? 0 : 10
    context.lineWidth = 12
    context.strokeStyle = '#3c3354'
    context.beginPath()
    context.moveTo(-bar.length / 2, 0)
    context.lineTo(bar.length / 2, 0)
    context.stroke()
    context.lineWidth = 2
    context.strokeStyle = accent
    context.stroke()
    context.shadowBlur = 0
    context.fillStyle = '#d1c8ed'
    circle(context, 0, 0, 7)
    context.fill()
    context.fillStyle = '#393249'
    circle(context, 0, 0, 3)
    context.fill()
    context.restore()
  })

  const gateHalf = Math.min(324, state.gateWidth / 2)
  context.lineWidth = 9
  context.strokeStyle = danger ? '#b27b42' : '#514361'
  context.beginPath()
  context.moveTo(36, 766)
  context.lineTo(360 - gateHalf, 766)
  context.moveTo(360 + gateHalf, 766)
  context.lineTo(684, 766)
  context.stroke()
  if (gateHalf > 0) {
    const drain = context.createLinearGradient(0, 755, 0, 820)
    drain.addColorStop(0, '#f07e691c')
    drain.addColorStop(1, '#f07e6900')
    context.fillStyle = drain
    context.fillRect(360 - gateHalf, 768, gateHalf * 2, 52)
    context.fillStyle = '#c58f86'
    context.font = '10px "Courier New", monospace'
    context.fillText('▼  D R O P  Z O N E  ▼', 360, 797)
  } else {
    context.fillStyle = '#777080'
    context.font = '10px "Courier New", monospace'
    context.fillText(preview ? 'THE ARENA IS YOURS' : 'GATE OPENS AT 00:08', 360, 797)
  }

  state.balls.filter(ball => !ball.eliminated).forEach(ball => {
    if (!reducedMotion && ball.trail.length > 1) {
      context.strokeStyle = `${ball.color}45`
      context.lineWidth = ball.radius * 0.8
      context.beginPath()
      ball.trail.forEach((point, i) => i === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y))
      context.lineTo(ball.x, ball.y)
      context.stroke()
    }
    context.shadowColor = ball.color
    context.shadowBlur = reducedMotion ? 0 : 16
    const sphere = context.createRadialGradient(ball.x - 3, ball.y - 4, 1, ball.x, ball.y, ball.radius)
    sphere.addColorStop(0, '#ffffff')
    sphere.addColorStop(0.24, ball.color)
    sphere.addColorStop(1, `${ball.color}c0`)
    context.fillStyle = sphere
    circle(context, ball.x, ball.y, ball.radius)
    context.fill()
    context.shadowBlur = 0
    const label = Array.from(ball.name).length > 9 ? `${Array.from(ball.name).slice(0, 8).join('')}…` : ball.name
    context.font = '600 13px "Apple SD Gothic Neo", sans-serif'
    const textWidth = context.measureText(label).width
    const labelX = Math.min(BOARD_WIDTH - textWidth / 2 - 7, Math.max(textWidth / 2 + 7, ball.x))
    context.fillStyle = '#090912d9'
    context.fillRect(labelX - textWidth / 2 - 5, ball.y + ball.radius + 4, textWidth + 10, 20)
    context.fillStyle = '#f0ebfa'
    context.fillText(label, labelX, ball.y + ball.radius + 19)
  })

  if (!reducedMotion) sparks.forEach(spark => {
    context.globalAlpha = Math.max(0, spark.life)
    context.fillStyle = spark.color
    context.fillRect(spark.x, spark.y, 3, 3)
  })
  context.restore()
}
