"use client"

import { useCallback, useEffect, useState } from "react"
import confetti from "canvas-confetti"
import { AnalogClock } from "@/components/analog-clock"
import { PomodoroCard } from "@/components/pomodoro-card"
import { QuoteCard } from "@/components/quote-card"
import { VibeSettingsDock } from "@/components/vibe-settings-dock"
import { WeatherCard } from "@/components/weather-card"
import { VibeParticles } from "@/components/vibe-particles"
import { VibePlayer } from "@/components/vibe-player"
import { SearchCard } from "@/components/search-card"
import { useVibePreferences } from "@/hooks/use-vibe-preferences"
import type { MoodId } from "@/lib/moods"
import { MOODS } from "@/lib/moods"
import type { WidgetKey } from "@/hooks/use-vibe-preferences"

function burstForMood(mood: MoodId) {
  const origin = { x: 0.5, y: 0.35 }
  const colors =
    mood === "chill"
      ? ["#7ec8ff", "#50a0dc", "#b8e0ff"]
      : mood === "lofi"
        ? ["#e8a0ff", "#ffb0c8", "#c9a0ff"]
        : mood === "focus"
          ? ["#64ffc0", "#3cc8a0", "#a0ffe0"]
          : ["#ff5078", "#ffc850", "#ff9060"]

  void confetti({
    particleCount: 72,
    spread: 64,
    origin,
    colors,
    ticks: 200,
    gravity: 0.9,
    scalar: 0.92,
    drift: 0.05,
  })
}

export function VibeFlowHome() {
  const {
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
  } = useVibePreferences()
  const [pomoRunning, setPomoRunning] = useState(false)
  const [pomoSession, setPomoSession] = useState(false)

  const cfg = MOODS[mood]

  // Search and pomodoro are mutually exclusive — enabling one disables the other
  const handleToggleWidget = useCallback(
    (key: WidgetKey) => {
      if (key === "search" && !widgets.search && widgets.pomodoro) toggleWidget("pomodoro")
      if (key === "pomodoro" && !widgets.pomodoro && widgets.search) toggleWidget("search")
      toggleWidget(key)
    },
    [toggleWidget, widgets],
  )

  useEffect(() => {
    if (!hydrated) return
    const root = document.documentElement
    Object.entries(cfg.theme).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    root.dataset.mood = mood
  }, [cfg.theme, mood, hydrated])

  const applyMood = useCallback(
    (id: MoodId) => {
      if (id === mood) return
      burstForMood(id)
      setMood(id)
    },
    [mood, setMood],
  )

  const showTopBar = widgets.clock || widgets.weather
  const showCenter = widgets.pomodoro || widgets.quote || widgets.search

  return (
    <div className="cyber-root relative flex h-dvh max-h-dvh flex-col overflow-hidden text-foreground">
      <div className="cyber-grid pointer-events-none fixed inset-0 z-[1] opacity-[0.16]" aria-hidden />
      <div className="cyber-vignette pointer-events-none fixed inset-0 z-[1]" aria-hidden />
      {widgets.particles ? <VibeParticles mood={cfg} /> : null}

      <div className="relative z-10 flex h-full min-h-0 flex-col">

        {/* Top info bar */}
        {showTopBar ? (
          <header className="flex shrink-0 items-center justify-between gap-6 px-6 py-4 sm:px-10 sm:py-5">
            {widgets.clock ? <AnalogClock /> : <div />}
            {widgets.weather ? <WeatherCard fallbackCoords={fallbackCoords} /> : null}
          </header>
        ) : null}

        {/* Center stage */}
        <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-10 px-6 py-8">
          {widgets.search ? <SearchCard /> : null}
          {widgets.pomodoro ? (
            <PomodoroCard
              onRunningChange={setPomoRunning}
              onSessionChange={setPomoSession}
              totalSec={pomoDuration * 60}
            />
          ) : null}
          {widgets.quote ? <QuoteCard /> : null}
          {!showCenter && !widgets.player ? (
            <p className="text-[11px] tracking-[0.22em] text-white/20 uppercase">
              Open settings to add widgets
            </p>
          ) : null}
        </main>

        {/* Bottom player bar */}
        {widgets.player ? (
          <footer className="shrink-0">
            <VibePlayer
              key={mood}
              mood={cfg}
              pomoSession={pomoSession}
              pomoRunning={pomoRunning}
              youtubeOverride={customVideos[mood]}
            />
          </footer>
        ) : null}
      </div>

      <VibeSettingsDock
        mood={mood}
        onMoodChange={applyMood}
        widgets={widgets}
        toggleWidget={handleToggleWidget}
        playerBarVisible={widgets.player}
        pomoDuration={pomoDuration}
        onPomoDurationChange={setPomoDuration}
        customVideos={customVideos}
        onCustomVideoChange={setCustomVideo}
        fallbackCoords={fallbackCoords}
        onFallbackCoordsChange={setFallbackCoords}
      />
    </div>
  )
}
