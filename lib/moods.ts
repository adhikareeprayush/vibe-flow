export type MoodId = "chill" | "lofi" | "focus" | "hype"

export type MoodConfig = {
  id: MoodId
  label: string
  description: string
  /** YouTube video ID for embed */
  youtubeId: string
  /** Theme tokens exported as CSS variables */
  theme: Record<string, string>
  particles: {
    count: number
    speed: number
    sizeMin: number
    sizeMax: number
    drift: number
    connect: boolean
    rgb: [number, number, number]
    rgb2: [number, number, number]
  }
}

export const MOODS: Record<MoodId, MoodConfig> = {
  chill: {
    id: "chill",
    label: "Chill",
    description: "Soft drift, ocean calm",
    youtubeId: "2OEL4P1Rz04",
    theme: {
      "--vibe-accent": "oklch(0.78 0.12 210)",
      "--vibe-accent-2": "oklch(0.72 0.08 200)",
      "--vibe-glow": "oklch(0.65 0.14 220)",
      "--vibe-surface": "oklch(0.22 0.04 240 / 0.55)",
      "--vibe-grid": "oklch(0.55 0.08 220 / 0.12)",
      "--vibe-particle": "oklch(0.75 0.1 210)",
    },
    particles: {
      count: 48,
      speed: 0.35,
      sizeMin: 1.2,
      sizeMax: 3.2,
      drift: 0.4,
      connect: true,
      rgb: [120, 200, 255],
      rgb2: [80, 160, 220],
    },
  },
  lofi: {
    id: "lofi",
    label: "Lofi",
    description: "Tape warmth & rain",
    youtubeId: "uVcVzDH4d1k",
    theme: {
      "--vibe-accent": "oklch(0.72 0.16 310)",
      "--vibe-accent-2": "oklch(0.78 0.12 330)",
      "--vibe-glow": "oklch(0.62 0.2 300)",
      "--vibe-surface": "oklch(0.24 0.06 300 / 0.5)",
      "--vibe-grid": "oklch(0.55 0.12 300 / 0.1)",
      "--vibe-particle": "oklch(0.78 0.14 320)",
    },
    particles: {
      count: 72,
      speed: 0.55,
      sizeMin: 1,
      sizeMax: 2.8,
      drift: 0.65,
      connect: true,
      rgb: [200, 140, 255],
      rgb2: [255, 160, 200],
    },
  },
  focus: {
    id: "focus",
    label: "Focus",
    description: "Deep work grid",
    youtubeId: "-scpRk2xZcI",
    theme: {
      "--vibe-accent": "oklch(0.78 0.14 145)",
      "--vibe-accent-2": "oklch(0.7 0.1 160)",
      "--vibe-glow": "oklch(0.68 0.18 150)",
      "--vibe-surface": "oklch(0.2 0.03 150 / 0.55)",
      "--vibe-grid": "oklch(0.55 0.1 150 / 0.15)",
      "--vibe-particle": "oklch(0.75 0.12 155)",
    },
    particles: {
      count: 90,
      speed: 0.25,
      sizeMin: 0.8,
      sizeMax: 2,
      drift: 0.15,
      connect: true,
      rgb: [100, 255, 180],
      rgb2: [60, 200, 160],
    },
  },
  hype: {
    id: "hype",
    label: "Hype",
    description: "Neon pulse energy",
    youtubeId: "ljnGl5nvUJY",
    theme: {
      "--vibe-accent": "oklch(0.75 0.22 25)",
      "--vibe-accent-2": "oklch(0.72 0.2 330)",
      "--vibe-glow": "oklch(0.7 0.24 20)",
      "--vibe-surface": "oklch(0.22 0.08 25 / 0.5)",
      "--vibe-grid": "oklch(0.6 0.18 25 / 0.14)",
      "--vibe-particle": "oklch(0.78 0.2 15)",
    },
    particles: {
      count: 110,
      speed: 1.15,
      sizeMin: 1,
      sizeMax: 3.8,
      drift: 1.2,
      connect: false,
      rgb: [255, 80, 120],
      rgb2: [255, 200, 80],
    },
  },
}

export const MOOD_LIST = Object.values(MOODS)
