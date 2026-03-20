"use client"

import { useCallback, useEffect, useState } from "react"
import type { MoodId } from "@/lib/moods"

export type WidgetKey = "particles" | "player" | "pomodoro" | "clock" | "weather" | "quote" | "search"
export type FallbackCoords = { lat: number; lon: number }

const STORAGE_KEY = "ambient-desk-v1"

const DEFAULT_WIDGETS: Record<WidgetKey, boolean> = {
  particles: true,
  player: true,
  pomodoro: true,
  clock: false,
  weather: false,
  quote: false,
  search: false,
}

const DEFAULT_POMO_DURATION = 25

type Stored = {
  mood?: MoodId
  widgets?: Partial<Record<WidgetKey, boolean>>
  pomoDuration?: number
  customVideos?: Partial<Record<MoodId, string>>
  fallbackCoords?: FallbackCoords | null
}

function loadStored(): {
  mood: MoodId
  widgets: Record<WidgetKey, boolean>
  pomoDuration: number
  customVideos: Partial<Record<MoodId, string>>
  fallbackCoords: FallbackCoords | null
} | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Stored
    const mood = p.mood && ["chill", "lofi", "focus", "hype"].includes(p.mood) ? p.mood : "lofi"
    return {
      mood,
      widgets: { ...DEFAULT_WIDGETS, ...p.widgets },
      pomoDuration:
        typeof p.pomoDuration === "number" && p.pomoDuration > 0
          ? p.pomoDuration
          : DEFAULT_POMO_DURATION,
      customVideos: p.customVideos ?? {},
      fallbackCoords: p.fallbackCoords ?? null,
    }
  } catch {
    return null
  }
}

export function useVibePreferences() {
  const [mood, setMoodState] = useState<MoodId>("lofi")
  const [widgets, setWidgets] = useState<Record<WidgetKey, boolean>>(DEFAULT_WIDGETS)
  const [pomoDuration, setPomoDurationState] = useState(DEFAULT_POMO_DURATION)
  const [customVideos, setCustomVideosState] = useState<Partial<Record<MoodId, string>>>({})
  const [fallbackCoords, setFallbackCoordsState] = useState<FallbackCoords | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => {
      const s = loadStored()
      if (s) {
        setMoodState(s.mood)
        setWidgets(s.widgets)
        setPomoDurationState(s.pomoDuration)
        setCustomVideosState(s.customVideos)
        setFallbackCoordsState(s.fallbackCoords)
      }
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const payload: Stored = { mood, widgets, pomoDuration, customVideos, fallbackCoords }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [mood, widgets, hydrated, pomoDuration, customVideos, fallbackCoords])

  const setMood = useCallback((id: MoodId) => {
    setMoodState(id)
  }, [])

  const toggleWidget = useCallback((key: WidgetKey) => {
    setWidgets((w) => ({ ...w, [key]: !w[key] }))
  }, [])

  const setPomoDuration = useCallback((d: number) => {
    setPomoDurationState(Math.max(1, Math.min(120, Math.round(d))))
  }, [])

  const setCustomVideo = useCallback((id: MoodId, url: string) => {
    setCustomVideosState((v) => ({ ...v, [id]: url }))
  }, [])

  const setFallbackCoords = useCallback((coords: FallbackCoords | null) => {
    setFallbackCoordsState(coords)
  }, [])

  return {
    mood,
    setMood,
    widgets,
    toggleWidget,
    hydrated,
    pomoDuration,
    setPomoDuration,
    customVideos,
    setCustomVideo,
    fallbackCoords,
    setFallbackCoords,
  }
}
