"use client"

import { useCallback, useEffect, useRef, useState, useLayoutEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, Settings2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FallbackCoords, WidgetKey } from "@/hooks/use-vibe-preferences"
import { downloadThemeCss } from "@/lib/theme-export"
import type { MoodId } from "@/lib/moods"
import { MOOD_LIST } from "@/lib/moods"
import { cn } from "@/lib/utils"

const LABEL = "text-[10px] font-medium tracking-wider text-white/35 uppercase"

const WIDGET_META: { key: WidgetKey; label: string }[] = [
  { key: "particles", label: "Particle field" },
  { key: "player", label: "Video / audio" },
  { key: "search", label: "Search bar" },
  { key: "pomodoro", label: "Timer" },
  { key: "clock", label: "Clock" },
  { key: "weather", label: "Weather" },
  { key: "quote", label: "Quote" },
]

function ToggleRow({
  on,
  onToggle,
  label,
}: {
  on: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 rounded-lg py-2 text-left text-xs text-white/80 transition hover:bg-white/[0.04]"
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          on ? "bg-vibe-accent/50" : "bg-white/10"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform",
            on ? "left-4" : "left-0.5"
          )}
        />
      </span>
    </button>
  )
}

export function VibeSettingsDock({
  mood,
  onMoodChange,
  widgets,
  toggleWidget,
  playerBarVisible = false,
  pomoDuration,
  onPomoDurationChange,
  customVideos,
  onCustomVideoChange,
  fallbackCoords,
  onFallbackCoordsChange,
}: {
  mood: MoodId
  onMoodChange: (id: MoodId) => void
  widgets: Record<WidgetKey, boolean>
  toggleWidget: (k: WidgetKey) => void
  playerBarVisible?: boolean
  pomoDuration: number
  onPomoDurationChange: (d: number) => void
  customVideos: Partial<Record<MoodId, string>>
  onCustomVideoChange: (id: MoodId, url: string) => void
  fallbackCoords: FallbackCoords | null
  onFallbackCoordsChange: (c: FallbackCoords | null) => void
}) {
  const [open, setOpen] = useState(false)
  const dockRef = useRef<HTMLDivElement>(null)

  // Local string state for coordinate inputs so typing partial values doesn't discard input
  const [latStr, setLatStr] = useState(() => fallbackCoords?.lat?.toString() ?? "")
  const [lonStr, setLonStr] = useState(() => fallbackCoords?.lon?.toString() ?? "")

  // Sync inputs from stored prefs when dock opens (handles hydration from localStorage)
  useLayoutEffect(() => {
    if (open) {
      setLatStr(fallbackCoords?.lat?.toString() ?? "")
      setLonStr(fallbackCoords?.lon?.toString() ?? "")
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const commitCoords = useCallback(
    (lat: string, lon: string) => {
      const latN = parseFloat(lat)
      const lonN = parseFloat(lon)
      if (!Number.isNaN(latN) && !Number.isNaN(lonN)) {
        onFallbackCoordsChange({ lat: latN, lon: lonN })
      } else if (lat.trim() === "" && lon.trim() === "") {
        onFallbackCoordsChange(null)
      }
    },
    [onFallbackCoordsChange],
  )

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (dockRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  const exportCss = useCallback(() => {
    downloadThemeCss(mood)
  }, [mood])

  return (
    <div
      ref={dockRef}
      className={cn(
        "group/dock pointer-events-auto fixed right-0 z-[80] flex flex-col items-end p-3 sm:p-4",
        playerBarVisible ? "bottom-16" : "bottom-0"
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass-surface mb-2 w-[min(calc(100vw-2rem),18rem)] overflow-hidden rounded-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <span className="text-xs font-medium text-white/90">Workspace</span>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="size-7 text-white/50 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="size-3.5" />
              </Button>
            </div>

            <div className="max-h-[min(52dvh,420px)] overflow-y-auto overscroll-contain px-3 py-2">
              <p className={cn("mb-1.5", LABEL)}>Mood</p>
              <div className="mb-4 grid grid-cols-2 gap-1.5">
                {MOOD_LIST.map((m) => (
                  <Button
                    key={m.id}
                    type="button"
                    size="sm"
                    variant={mood === m.id ? "default" : "outline"}
                    className={cn(
                      "h-8 text-xs",
                      mood === m.id &&
                        "border-transparent bg-vibe-accent/35 text-white hover:bg-vibe-accent/45"
                    )}
                    onClick={() => onMoodChange(m.id)}
                  >
                    {m.label}
                  </Button>
                ))}
              </div>

              <p className={cn("mb-1.5", LABEL)}>Visible</p>
              <div className="mb-4 flex flex-col divide-y divide-white/[0.06]">
                {WIDGET_META.map(({ key, label }) => (
                  <ToggleRow
                    key={key}
                    label={label}
                    on={widgets[key]}
                    onToggle={() => toggleWidget(key)}
                  />
                ))}
              </div>

              <p className={cn("mb-2", LABEL)}>Timer duration</p>
              <div className="mb-4 flex items-center gap-2.5">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={pomoDuration}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    if (!Number.isNaN(v)) onPomoDurationChange(v)
                  }}
                  className="w-16 rounded-lg border border-white/[0.1] bg-white/[0.06] px-2 py-1.5 text-center font-mono text-sm text-white [appearance:textfield] focus:border-vibe-accent/40 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-xs text-white/40">minutes</span>
              </div>

              <p className={cn("mb-2", LABEL)}>Streams</p>
              <div className="mb-4 flex flex-col gap-1.5">
                {MOOD_LIST.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <span className="w-11 shrink-0 text-[11px] text-white/40">{m.label}</span>
                    <input
                      type="text"
                      value={customVideos[m.id] ?? ""}
                      onChange={(e) => onCustomVideoChange(m.id, e.target.value)}
                      placeholder={m.youtubeId}
                      title={`Default: ${m.youtubeId}`}
                      className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 font-mono text-[11px] text-white/80 placeholder:text-white/18 focus:border-vibe-accent/30 focus:outline-none"
                    />
                  </div>
                ))}
                <p className="mt-0.5 text-[10px] text-white/25">
                  Paste a YouTube URL, video ID, or playlist link
                </p>
              </div>

              <p className={cn("mb-2", LABEL)}>Location fallback</p>
              <div className="mb-1 grid grid-cols-2 gap-1.5">
                <div>
                  <p className="mb-1 text-[10px] text-white/25">Latitude</p>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 28.6139"
                    value={latStr}
                    onChange={(e) => {
                      setLatStr(e.target.value)
                      commitCoords(e.target.value, lonStr)
                    }}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 font-mono text-[11px] text-white/80 placeholder:text-white/20 focus:border-vibe-accent/30 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <p className="mb-1 text-[10px] text-white/25">Longitude</p>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 77.2090"
                    value={lonStr}
                    onChange={(e) => {
                      setLonStr(e.target.value)
                      commitCoords(latStr, e.target.value)
                    }}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 font-mono text-[11px] text-white/80 placeholder:text-white/20 focus:border-vibe-accent/30 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <p className="mb-4 text-[10px] text-white/20">
                Used if weather auto-detect fails
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full gap-1.5 border-white/15 bg-white/[0.04] text-xs text-white/85 hover:bg-white/[0.08]"
                onClick={exportCss}
              >
                <Download className="size-3" />
                Download theme (.css)
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Workspace settings"
        className={cn(
          "flex size-10 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/90 shadow-lg backdrop-blur-md transition-all duration-300",
          "opacity-[0.14] hover:opacity-100 focus-visible:opacity-100 group-hover/dock:opacity-100 group-focus-within/dock:opacity-100",
          open && "opacity-100 ring-2 ring-vibe-accent/40"
        )}
      >
        <Settings2 className="size-[18px]" />
      </button>
    </div>
  )
}
