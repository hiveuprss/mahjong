import { useEffect, useRef } from 'react'

/** Sapphire-night festival — coral, celeste, moon, ice. */
const PALETTE = ['#ff5a4a', '#ff8a7a', '#3fd0b6', '#7aefe0', '#f2d07a', '#e8eef5', '#5eb0ff', '#fff6d6']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  kind: 'spark' | 'trail'
}

interface Rocket {
  x: number
  y: number
  vx: number
  vy: number
  targetY: number
  color: string
  exploded: boolean
}

function burst(particles: Particle[], x: number, y: number, color: string) {
  const count = 70 + Math.floor(Math.random() * 36)
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3
    const speed = 2.8 + Math.random() * 5.5
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1.1 + Math.random() * 1.0,
      color: Math.random() > 0.28 ? color : PALETTE[Math.floor(Math.random() * PALETTE.length)]!,
      size: 3.2 + Math.random() * 3.6,
      kind: 'spark',
    })
  }
  for (let i = 0; i < 24; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 1 + Math.random() * 2.4
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1.3 + Math.random() * 0.7,
      color: '#fffef5',
      size: 2 + Math.random() * 2,
      kind: 'spark',
    })
  }
}

export function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    const rockets: Rocket[] = []
    const particles: Particle[] = []
    let spawnTimer = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const spawnRocket = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      rockets.push({
        x: w * (0.12 + Math.random() * 0.76),
        y: h + 8,
        vx: (Math.random() - 0.5) * 1.4,
        vy: -(6.2 + Math.random() * 3.5),
        targetY: h * (0.15 + Math.random() * 0.38),
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)]!,
        exploded: false,
      })
    }

    for (let i = 0; i < 4; i++) {
      window.setTimeout(spawnRocket, i * 140)
    }

    const tick = () => {
      if (!running) return
      const w = window.innerWidth
      const h = window.innerHeight

      ctx.clearRect(0, 0, w, h)

      spawnTimer += 1
      if (spawnTimer > 12 + Math.random() * 10) {
        spawnTimer = 0
        if (rockets.length < 8) spawnRocket()
        if (Math.random() > 0.55 && rockets.length < 8) spawnRocket()
      }

      for (const r of rockets) {
        if (r.exploded) continue
        r.x += r.vx
        r.y += r.vy
        r.vy += 0.05
        particles.push({
          x: r.x,
          y: r.y,
          vx: (Math.random() - 0.5) * 0.35,
          vy: 0.5 + Math.random() * 0.5,
          life: 1,
          maxLife: 0.45 + Math.random() * 0.25,
          color: r.color,
          size: 3,
          kind: 'trail',
        })
        ctx.beginPath()
        ctx.fillStyle = '#fff6d6'
        ctx.shadowColor = r.color
        ctx.shadowBlur = 12
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        if (r.y <= r.targetY || r.vy >= -0.35) {
          r.exploded = true
          burst(particles, r.x, r.y, r.color)
        }
      }
      for (let i = rockets.length - 1; i >= 0; i--) {
        if (rockets[i]!.exploded) rockets.splice(i, 1)
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!
        p.x += p.vx
        p.y += p.vy
        if (p.kind === 'spark') {
          p.vy += 0.028
          p.vx *= 0.985
        }
        p.life -= 1 / (p.maxLife * 60)
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        const alpha = Math.max(0, p.life)
        const radius = p.size * (0.75 + p.life * 0.6)
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0

      raf = requestAnimationFrame(tick)
    }

    // Clear once before the fade loop starts
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    raf = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas className="fireworks" ref={canvasRef} aria-hidden="true" />
}
