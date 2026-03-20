"use client"

import { useEffect, useId, useState } from "react"

function polar(deg: number, len: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: 100 + len * Math.cos(rad), y: 100 + len * Math.sin(rad) }
}

export function AnalogClock() {
  const uid = useId().replace(/:/g, "")
  const faceId = `cf-${uid}`
  const handId = `hg-${uid}`
  const rimId = `rim-${uid}`
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 50)
    return () => window.clearInterval(id)
  }, [])

  const h = now.getHours() % 12
  const m = now.getMinutes()
  const s = now.getSeconds()
  const ms = now.getMilliseconds()
  const smoothSec = s + ms / 1000

  const hourDeg = h * 30 + m * 0.5
  const minDeg = m * 6 + smoothSec * 0.1
  const secDeg = smoothSec * 6

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const outer = polar(i * 30, 88)
    const inner = polar(i * 30, i % 3 === 0 ? 72 : 78)
    return (
      <line
        key={i}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        className={i % 3 === 0 ? "stroke-white/40" : "stroke-white/15"}
        strokeWidth={i % 3 === 0 ? 2.4 : 1}
        strokeLinecap="round"
      />
    )
  })

  const hEnd = polar(hourDeg, 46)
  const mEnd = polar(minDeg, 68)
  const sEnd = polar(secDeg, 76)

  return (
    <div
      className="size-[108px] sm:size-[128px]"
      role="img"
      aria-label={`${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-[0_4px_32px_color-mix(in_oklch,var(--vibe-glow)_28%,transparent)]">
            <defs>
              <radialGradient id={faceId} cx="50%" cy="48%" r="68%">
                <stop offset="0%" stopColor="oklch(0.26 0.04 280 / 0.55)" />
                <stop offset="70%" stopColor="oklch(0.14 0.04 280 / 0.85)" />
                <stop offset="100%" stopColor="oklch(0.1 0.03 280 / 0.95)" />
              </radialGradient>
              <linearGradient id={handId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--vibe-accent-2)" stopOpacity="0.35" />
                <stop offset="50%" stopColor="var(--vibe-accent)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--vibe-glow)" stopOpacity="0.55" />
              </linearGradient>
              <linearGradient id={rimId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(1 0 0 / 0.2)" />
                <stop offset="50%" stopColor="oklch(1 0 0 / 0.04)" />
                <stop offset="100%" stopColor="oklch(1 0 0 / 0.12)" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="94" fill={`url(#${rimId})`} opacity={0.9} />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill={`url(#${faceId})`}
              stroke="oklch(1 0 0 / 0.14)"
              strokeWidth="1.5"
            />
            <circle cx="100" cy="100" r="86" fill="none" stroke="oklch(0 0 0 / 0.35)" strokeWidth="1" opacity={0.5} />
            {ticks}
            <line
              x1="100"
              y1="100"
              x2={hEnd.x}
              y2={hEnd.y}
              stroke={`url(#${handId})`}
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <line
              x1="100"
              y1="100"
              x2={mEnd.x}
              y2={mEnd.y}
              stroke="oklch(0.94 0.02 270)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <line
              x1="100"
              y1="100"
              x2={sEnd.x}
              y2={sEnd.y}
              stroke="var(--vibe-accent)"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity={0.95}
            />
            <circle
              cx="100"
              cy="100"
              r="6"
              fill="oklch(0.12 0.03 280)"
              stroke="oklch(1 0 0 / 0.2)"
              strokeWidth="1"
            />
            <circle cx="100" cy="100" r="3.5" fill="var(--vibe-accent)" opacity={0.9} />
      </svg>
    </div>
  )
}
