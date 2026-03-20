"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Headphones, Pause, Play, Radio, Upload, Volume2 } from "lucide-react"
import type { MoodConfig } from "@/lib/moods"
import { cn } from "@/lib/utils"

type Source = "youtube" | "local"

type YtTarget = { kind: "video"; id: string } | { kind: "playlist"; id: string }

function parseYoutubeInput(raw: string): YtTarget | null {
  const s = raw.trim()
  if (!s) return null
  // youtu.be/ID
  const short = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/)
  if (short) return { kind: "video", id: short[1] }
  // youtube.com/watch?v=ID (may also have list=, prefer video)
  const watch = s.match(/[?&]v=([A-Za-z0-9_-]{11})/)
  if (watch) return { kind: "video", id: watch[1] }
  // playlist without v=
  const list = s.match(/[?&]list=([A-Za-z0-9_-]+)/)
  if (list) return { kind: "playlist", id: list[1] }
  // bare 11-char video ID
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return { kind: "video", id: s }
  return null
}

const YT_PLAYING = 1
const YT_PAUSED = 2
const YT_BUFFERING = 3

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

function loadYoutubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.YT?.Player) return Promise.resolve()
  return new Promise((resolve) => {
    const prior = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prior?.()
      resolve()
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      tag.async = true
      document.body.appendChild(tag)
    }
  })
}

type YtPlayer = {
  playVideo?: () => void
  pauseVideo?: () => void
  destroy?: () => void
  unMute?: () => void
  mute?: () => void
  setVolume?: (n: number) => void
  getPlayerState?: () => number
  getCurrentTime?: () => number
  getDuration?: () => number
  seekTo?: (seconds: number, allowSeekAhead?: boolean) => void
}

export function VibePlayer({
  mood,
  pomoSession,
  pomoRunning,
  youtubeOverride,
  className,
}: {
  mood: MoodConfig
  pomoSession: boolean
  pomoRunning: boolean
  youtubeOverride?: string
  className?: string
}) {
  const [source, setSource] = useState<Source>("youtube")
  const [localUrl, setLocalUrl] = useState<string | null>(null)
  const [needsTap, setNeedsTap] = useState(false)
  const [progress, setProgress] = useState(0)
  const [curSec, setCurSec] = useState(0)
  const [durSec, setDurSec] = useState(0)
  const [mediaPlaying, setMediaPlaying] = useState(false)

  const hiddenMountRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YtPlayer | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const shouldPlayRef = useRef(true)

  const shouldPlayYoutube = source === "youtube" && (!pomoSession || pomoRunning)

  useEffect(() => {
    shouldPlayRef.current = shouldPlayYoutube
  }, [shouldPlayYoutube])

  const onLocalFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (!f) return
      if (localUrl) URL.revokeObjectURL(localUrl)
      setLocalUrl(URL.createObjectURL(f))
      setSource("local")
    },
    [localUrl]
  )

  const tryPlayWithSound = useCallback((player: YtPlayer) => {
    try {
      player.unMute?.()
      player.setVolume?.(100)
      player.playVideo?.()
    } catch {
      /* autoplay policy */
    }
  }, [])

  const unlockYoutube = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    setNeedsTap(false)
    tryPlayWithSound(p)
  }, [tryPlayWithSound])

  const togglePlay = useCallback(() => {
    if (source === "youtube") {
      const p = playerRef.current
      if (!p) return
      const st = p.getPlayerState?.()
      if (st === YT_PLAYING || st === YT_BUFFERING) p.pauseVideo?.()
      else tryPlayWithSound(p)
      return
    }
    const a = audioRef.current
    if (!a) return
    if (a.paused) void a.play().catch(() => {})
    else a.pause()
  }, [source, tryPlayWithSound])

  const seekToFraction = useCallback(
    (clientX: number) => {
      const el = progressBarRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      setProgress(t)
      if (source === "youtube") {
        const p = playerRef.current
        const d = p?.getDuration?.() ?? 0
        if (d > 0) {
          p?.seekTo?.(t * d, true)
          setCurSec(t * d)
        }
      } else {
        const a = audioRef.current
        if (a?.duration) {
          a.currentTime = t * a.duration
          setCurSec(t * a.duration)
        }
      }
    },
    [source]
  )

  const onBarMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      seekToFraction(e.clientX)
      const onMove = (ev: MouseEvent) => seekToFraction(ev.clientX)
      const onUp = () => {
        window.removeEventListener("mousemove", onMove)
        window.removeEventListener("mouseup", onUp)
      }
      window.addEventListener("mousemove", onMove)
      window.addEventListener("mouseup", onUp)
    },
    [seekToFraction]
  )

  const onBarTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      seekToFraction(e.touches[0].clientX)
    },
    [seekToFraction]
  )

  const onBarTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault()
      seekToFraction(e.touches[0].clientX)
    },
    [seekToFraction]
  )

  useEffect(() => {
    if (source !== "youtube") return
    const mountEl = hiddenMountRef.current
    if (!mountEl) return

    // Resolve which video/playlist to play
    const target: YtTarget =
      (youtubeOverride ? parseYoutubeInput(youtubeOverride) : null) ??
      { kind: "video", id: mood.youtubeId }

    let alive = true
    const instanceRef: { current: { destroy?: () => void } | null } = { current: null }
    const tapReset = window.setTimeout(() => setNeedsTap(false), 0)

    ;(async () => {
      await loadYoutubeApi()
      if (!alive || !mountEl || !window.YT?.Player) return

      mountEl.innerHTML = ""
      const div = document.createElement("div")
      const uid = `yt-audio-${target.id}-${Math.random().toString(36).slice(2)}`
      div.id = uid
      div.className = "h-full w-full"
      mountEl.appendChild(div)

      const player = new window.YT.Player(uid, {
        videoId: target.kind === "video" ? target.id : undefined,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          ...(target.kind === "playlist"
            ? { list: target.id, listType: "playlist" }
            : {}),
        },
        events: {
          onReady: () => {
            if (!alive) return
            playerRef.current = player
            if (shouldPlayRef.current) tryPlayWithSound(player)
            else {
              try {
                player.pauseVideo?.()
              } catch {
                /* noop */
              }
            }
            window.setTimeout(() => {
              if (!alive) return
              const st = player.getPlayerState?.()
              if (shouldPlayRef.current && st === YT_PAUSED) setNeedsTap(true)
            }, 900)
          },
          onStateChange: (e: { data: number }) => {
            if (!alive) return
            const playing = e.data === YT_PLAYING || e.data === YT_BUFFERING
            setMediaPlaying(playing)
            if (shouldPlayRef.current && e.data === YT_PLAYING) setNeedsTap(false)
          },
        },
      })
      instanceRef.current = player
      if (!alive) {
        try {
          player.destroy?.()
        } catch {
          /* noop */
        }
        instanceRef.current = null
      }
    })()

    return () => {
      window.clearTimeout(tapReset)
      alive = false
      playerRef.current = null
      try {
        instanceRef.current?.destroy?.()
      } catch {
        /* noop */
      }
      instanceRef.current = null
      mountEl.innerHTML = ""
    }
  }, [mood.youtubeId, youtubeOverride, source, tryPlayWithSound])

  useEffect(() => {
    if (source !== "youtube") return
    const p = playerRef.current
    if (!p?.playVideo) return
    try {
      if (shouldPlayYoutube) {
        tryPlayWithSound(p)
        window.setTimeout(() => {
          const st = p.getPlayerState?.()
          if (shouldPlayYoutube && st === YT_PAUSED) setNeedsTap(true)
        }, 400)
      } else {
        p.pauseVideo?.()
      }
    } catch {
      /* noop */
    }
  }, [shouldPlayYoutube, source, tryPlayWithSound])

  useEffect(() => {
    if (source !== "youtube") return
    const id = window.setInterval(() => {
      const p = playerRef.current
      if (!p?.getCurrentTime) return
      const cur = p.getCurrentTime() ?? 0
      const dur = p.getDuration?.() ?? 0
      setCurSec(cur)
      setDurSec(dur)
      setProgress(dur > 0 ? cur / dur : 0)
      const st = p.getPlayerState?.()
      setMediaPlaying(st === YT_PLAYING || st === YT_BUFFERING)
    }, 350)
    return () => window.clearInterval(id)
  }, [source])

  useEffect(() => {
    const a = audioRef.current
    if (!a || source !== "local") return
    const playLocal = !pomoSession || pomoRunning
    if (playLocal) void a.play().catch(() => {})
    else a.pause()
  }, [pomoRunning, pomoSession, source, localUrl])

  const onAudioTime = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    setCurSec(a.currentTime)
    setDurSec(a.duration || 0)
    setProgress(a.duration ? a.currentTime / a.duration : 0)
  }, [])

  const onAudioPlayState = useCallback(() => {
    const a = audioRef.current
    setMediaPlaying(!!a && !a.paused)
  }, [])

  const noFile = source === "local" && !localUrl

  return (
    <div className={cn("relative border-t border-white/[0.07] bg-black/30 backdrop-blur-xl", className)}>
      {/* Hidden YT mount — keeps the YouTube API alive without a visible iframe */}
      <div
        className="pointer-events-none absolute left-0 top-0 -z-10 h-px w-px overflow-hidden opacity-0 [clip-path:inset(50%)]"
        aria-hidden="true"
      >
        <div ref={hiddenMountRef} className="h-[200px] w-[320px] shrink-0" />
      </div>

      {/* Audio element — always mounted so useEffect logic fires */}
      <audio
        ref={audioRef}
        className="hidden"
        loop
        src={localUrl ?? undefined}
        onTimeUpdate={onAudioTime}
        onLoadedMetadata={onAudioTime}
        onPlay={onAudioPlayState}
        onPause={onAudioPlayState}
      />

      <div className="flex items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        {/* Mood label */}
        <div className="hidden w-32 min-w-0 shrink-0 lg:block xl:w-44">
          <p className="truncate text-sm font-medium leading-none text-white/85">{mood.label}</p>
          <p className="mt-0.5 truncate text-[11px] leading-none text-white/35">{mood.description}</p>
        </div>

        {/* Play / Upload */}
        {noFile ? (
          <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs text-white/40 transition hover:text-white/70">
            <Upload className="size-4" />
            <span className="hidden sm:inline">Choose file</span>
            <input type="file" accept="audio/*" className="hidden" onChange={onLocalFile} />
          </label>
        ) : (
          <button
            type="button"
            onClick={needsTap ? unlockYoutube : togglePlay}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full border transition-all",
              needsTap
                ? "animate-pulse border-vibe-accent/50 bg-vibe-accent/15 text-vibe-accent"
                : "border-white/[0.14] bg-white/[0.07] text-white hover:bg-white/[0.13]"
            )}
            aria-label={needsTap ? "Tap to enable audio" : mediaPlaying ? "Pause" : "Play"}
          >
            {needsTap ? (
              <Volume2 className="size-4" />
            ) : mediaPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4 pl-px" />
            )}
          </button>
        )}

        {/* Seek bar + timestamps */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <span className="w-9 shrink-0 text-right font-mono text-[11px] tabular-nums text-white/30">
            {formatTime(curSec)}
          </span>

          {/* Outer div is the click / keyboard target — py-2 gives a larger hit area */}
          <div
            ref={progressBarRef}
            role="slider"
            tabIndex={0}
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            className={cn(
              "group/bar flex min-w-0 flex-1 cursor-pointer items-center py-2",
              noFile && "pointer-events-none opacity-30"
            )}
            onMouseDown={onBarMouseDown}
            onTouchStart={onBarTouchStart}
            onTouchMove={onBarTouchMove}
            onKeyDown={(e) => {
              if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
              if (source === "youtube") {
                const p = playerRef.current
                const d = durSec || p?.getDuration?.() || 0
                const step = Math.max(5, d * 0.05)
                const cur = curSec || p?.getCurrentTime?.() || 0
                const next = e.key === "ArrowLeft" ? cur - step : cur + step
                if (d > 0) p?.seekTo?.(Math.min(d, Math.max(0, next)), true)
              } else {
                const a = audioRef.current
                if (!a?.duration) return
                const step = Math.max(5, a.duration * 0.05)
                a.currentTime =
                  e.key === "ArrowLeft"
                    ? Math.max(0, a.currentTime - step)
                    : Math.min(a.duration, a.currentTime + step)
              }
            }}
          >
            {/* Visual track — purely decorative children must not eat pointer events */}
            <div className="relative h-1.5 w-full rounded-full bg-white/[0.1]">
              <div
                className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-vibe-accent-2 to-vibe-accent shadow-[0_0_12px_color-mix(in_oklch,var(--vibe-glow)_50%,transparent)] transition-[width] duration-200 ease-out"
                style={{ width: `${progress * 100}%` }}
              />
              <div
                className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-sm transition-opacity group-hover/bar:opacity-100"
                style={{ left: `clamp(6px, ${progress * 100}%, calc(100% - 6px))` }}
                aria-hidden
              />
            </div>
          </div>

          <span className="w-9 shrink-0 font-mono text-[11px] tabular-nums text-white/30">
            {formatTime(durSec)}
          </span>
        </div>

        {/* Source toggle */}
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => setSource("youtube")}
            title="Stream"
            aria-label="Stream audio"
            className={cn(
              "flex size-8 items-center justify-center rounded-lg transition",
              source === "youtube"
                ? "bg-vibe-accent/25 text-white shadow-[0_0_12px_-2px_var(--vibe-glow)]"
                : "text-white/30 hover:bg-white/[0.05] hover:text-white/60"
            )}
          >
            <Radio className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setSource("local")}
            title="Local file"
            aria-label="Local audio file"
            className={cn(
              "flex size-8 items-center justify-center rounded-lg transition",
              source === "local"
                ? "bg-vibe-accent/25 text-white shadow-[0_0_12px_-2px_var(--vibe-glow)]"
                : "text-white/30 hover:bg-white/[0.05] hover:text-white/60"
            )}
          >
            <Headphones className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
