"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Pause, Play, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

const DEFAULT_TOTAL = 25 * 60

function formatMmSs(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function DigitSlot({ digit, placeId }: { digit: string; placeId: string }) {
  return (
    <span className="relative inline-grid h-[1.15em] w-[0.62em] place-items-center overflow-hidden align-middle">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={`${placeId}-${digit}`}
          initial={{ opacity: 0, y: "40%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-40%" }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          style={{ gridArea: "1/1" }}
          className="font-mono font-semibold leading-none tracking-tighter tabular-nums text-white drop-shadow-[0_0_32px_color-mix(in_oklch,var(--vibe-glow)_30%,transparent)]"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function PomodoroDigits({ left }: { left: number }) {
  const mm = String(Math.floor(left / 60)).padStart(2, "0")
  const ss = String(left % 60).padStart(2, "0")

  return (
    <div
      className="flex items-baseline tracking-tight"
      aria-label={`${formatMmSs(left)} remaining`}
    >
      <DigitSlot digit={mm[0]} placeId="m10" />
      <DigitSlot digit={mm[1]} placeId="m1" />
      <span
        className="mx-[0.06em] font-mono font-semibold leading-none text-white/20 select-none"
        aria-hidden
      >
        :
      </span>
      <DigitSlot digit={ss[0]} placeId="s10" />
      <DigitSlot digit={ss[1]} placeId="s1" />
    </div>
  )
}

export function PomodoroCard({
  onRunningChange,
  onSessionChange,
  className,
  totalSec = DEFAULT_TOTAL,
}: {
  onRunningChange: (running: boolean) => void
  onSessionChange?: (inSession: boolean) => void
  className?: string
  totalSec?: number
}) {
  const [left, setLeft] = useState(totalSec)
  const [running, setRunning] = useState(false)
  const wasRunningRef = useRef(false)
  const totalSecRef = useRef(totalSec)

  useEffect(() => {
    onRunningChange(running)
  }, [running, onRunningChange])

  useEffect(() => {
    if (running && !wasRunningRef.current) {
      onSessionChange?.(true)
    }
    wasRunningRef.current = running
  }, [running, onSessionChange])

  // Sync ref so interval always uses latest totalSec
  useEffect(() => {
    totalSecRef.current = totalSec
  }, [totalSec])

  // Reset timer when duration changes
  const prevTotalRef = useRef(totalSec)
  useEffect(() => {
    if (totalSec === prevTotalRef.current) return
    prevTotalRef.current = totalSec
    setRunning(false)
    setLeft(totalSec)
    onSessionChange?.(false)
  }, [totalSec, onSessionChange])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          queueMicrotask(() => {
            setRunning(false)
            onSessionChange?.(false)
          })
          return totalSecRef.current
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running, onSessionChange])

  const pct = ((totalSec - left) / totalSec) * 100

  const reset = useCallback(() => {
    setRunning(false)
    setLeft(totalSecRef.current)
    onSessionChange?.(false)
  }, [onSessionChange])

  return (
    <div className={cn("flex select-none flex-col items-center gap-7", className)}>
      <p className="text-[10px] font-medium tracking-[0.28em] text-white/25 uppercase">
        Focus session
      </p>

      <div className="text-[clamp(4.5rem,14vw,8rem)] leading-none">
        <PomodoroDigits left={left} />
      </div>

      <div
        className="h-px w-52 overflow-hidden rounded-full bg-white/[0.08] sm:w-64"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full bg-vibe-accent/70 shadow-[0_0_8px_color-mix(in_oklch,var(--vibe-glow)_50%,transparent)]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? "Pause" : "Start"}
          className={cn(
            "flex size-10 items-center justify-center rounded-xl border transition-all",
            running
              ? "border-vibe-accent/40 bg-vibe-accent/15 shadow-[0_0_20px_-6px_var(--vibe-glow)] hover:bg-vibe-accent/22 text-white"
              : "border-white/[0.1] bg-white/[0.05] text-white hover:border-vibe-accent/25 hover:bg-white/[0.09]"
          )}
        >
          {running ? <Pause className="size-4" /> : <Play className="size-4 pl-px" />}
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset timer"
          className="flex size-10 items-center justify-center rounded-xl border border-white/[0.07] bg-transparent text-white/30 transition hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white/60"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
