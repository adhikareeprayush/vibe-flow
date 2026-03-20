"use client"

import { useEffect, useRef } from "react"
import type { MoodConfig } from "@/lib/moods"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  phase: number
  pulse: number
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function VibeParticles({ mood }: { mood: MoodConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const moodRef = useRef(mood)

  useEffect(() => {
    moodRef.current = mood
  }, [mood])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const draw = ctx

    let raf = 0
    let particles: Particle[] = []
    let w = 0
    let h = 0

    function resize() {
      const c = canvasRef.current
      if (!c) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      c.width = w * dpr
      c.height = h * dpr
      c.style.width = `${w}px`
      c.style.height = `${h}px`
      draw.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    function seed() {
      const m = moodRef.current.particles
      particles = []
      const n = Math.min(m.count, Math.floor((w * h) / 12000) + 20)
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * m.drift,
          vy: (Math.random() - 0.5) * m.drift,
          r: lerp(m.sizeMin, m.sizeMax, Math.random()),
          phase: Math.random() * Math.PI * 2,
          pulse: 0.6 + Math.random() * 0.5,
        })
      }
    }

    let last = performance.now()

    function tick(now: number) {
      const dt = Math.min(32, now - last) / 16.67
      last = now
      const m = moodRef.current.particles
      const [r1, g1, b1] = m.rgb
      const [r2, g2, b2] = m.rgb2

      draw.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.phase += 0.012 * m.speed * dt
        p.x += (p.vx + Math.sin(p.phase) * 0.15 * m.drift) * m.speed * dt
        p.y += (p.vy + Math.cos(p.phase * 0.8) * 0.12 * m.drift) * m.speed * dt
        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        if (p.y > h + 20) p.y = -20
      }

      if (m.connect && particles.length > 1) {
        draw.lineWidth = 0.5
        const maxD = moodRef.current.id === "focus" ? 110 : 140
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i]
            const b = particles[j]
            const dx = a.x - b.x
            const dy = a.y - b.y
            const d = Math.hypot(dx, dy)
            if (d < maxD) {
              const t = 1 - d / maxD
              const pulse = (a.pulse + b.pulse) / 2
              draw.strokeStyle = `rgba(${lerp(r1, r2, t)}, ${lerp(g1, g2, t)}, ${lerp(b1, b2, t)}, ${t * 0.22 * pulse})`
              draw.beginPath()
              draw.moveTo(a.x, a.y)
              draw.lineTo(b.x, b.y)
              draw.stroke()
            }
          }
        }
      }

      for (const p of particles) {
        const breathe = 0.55 + Math.sin(p.phase * p.pulse) * 0.35
        const grd = draw.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
        grd.addColorStop(0, `rgba(${r1},${g1},${b1},${0.45 * breathe})`)
        grd.addColorStop(1, `rgba(${r2},${g2},${b2},0)`)
        draw.fillStyle = grd
        draw.beginPath()
        draw.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
        draw.fill()
      }

      raf = requestAnimationFrame(tick)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [mood.id])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90"
    />
  )
}
