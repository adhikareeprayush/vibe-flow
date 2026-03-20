"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { weatherFromWmoCode } from "@/lib/wmo-weather"
import type { FallbackCoords } from "@/hooks/use-vibe-preferences"

type WeatherCurrent = {
  temperature: number
  apparent: number
  humidity: number
  windKmh: number
  code: number
  city: string | null
}

type Status = "loading" | "ready" | "error"

export function WeatherCard({ fallbackCoords }: { fallbackCoords: FallbackCoords | null }) {
  const [status, setStatus] = useState<Status>("loading")
  const [weather, setWeather] = useState<WeatherCurrent | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadWeather = useCallback(
    async (lat: number, lon: number, city: string | null = null) => {
      setStatus("loading")
      setError(null)
      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast")
        url.searchParams.set("latitude", String(lat))
        url.searchParams.set("longitude", String(lon))
        url.searchParams.set(
          "current",
          "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature"
        )
        url.searchParams.set("wind_speed_unit", "kmh")
        url.searchParams.set("timezone", "auto")

        const res = await fetch(url.toString())
        if (!res.ok) throw new Error("Forecast request failed")

        const data = (await res.json()) as {
          current: {
            temperature_2m: number
            apparent_temperature: number
            relative_humidity_2m: number
            weather_code: number
            wind_speed_10m: number
          }
        }
        const c = data.current
        setWeather({
          temperature: c.temperature_2m,
          apparent: c.apparent_temperature,
          humidity: c.relative_humidity_2m,
          windKmh: c.wind_speed_10m,
          code: c.weather_code,
          city,
        })
        setStatus("ready")
      } catch {
        setStatus("error")
        setError("Could not load forecast.")
      }
    },
    []
  )

  const fetchLocation = useCallback(async () => {
    setStatus("loading")
    setError(null)
    try {
      const res = await fetch("/api/location")
      if (!res.ok) throw new Error("Location lookup failed")
      const data = (await res.json()) as {
        lat: number
        lon: number
        city: string | null
      }
      await loadWeather(data.lat, data.lon, data.city)
    } catch {
      if (fallbackCoords) {
        await loadWeather(fallbackCoords.lat, fallbackCoords.lon, null)
      } else {
        setStatus("error")
        setError("Auto-detect failed. Set coordinates in settings ⚙")
      }
    }
  }, [loadWeather, fallbackCoords])

  useEffect(() => {
    void fetchLocation()
  }, [fetchLocation])

  if (status === "loading") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-white/30">
        <Loader2 className="size-3 animate-spin" />
        <span className="hidden sm:inline">Loading weather…</span>
      </div>
    )
  }

  if (status === "error") {
    return (
      <button
        type="button"
        onClick={() => void fetchLocation()}
        className="flex items-center gap-1.5 text-xs text-white/30 transition hover:text-white/65"
        title={error ?? "Retry"}
      >
        <RefreshCw className="size-3" />
        <span className="hidden sm:inline">{error ?? "Retry"}</span>
      </button>
    )
  }

  if (status === "ready" && weather) {
    const { label, Icon } = weatherFromWmoCode(weather.code)
    return (
      <div className="flex items-center gap-2.5 text-white/75">
        <Icon className="size-4 shrink-0 text-vibe-accent/90" />
        <span className="font-mono text-sm font-medium tabular-nums text-white">
          {Math.round(weather.temperature)}°
        </span>
        <span className="hidden text-xs text-white/45 sm:block">
          {weather.city ?? label}
        </span>
        <span className="hidden items-center gap-1 font-mono text-[10px] text-white/25 lg:flex">
          <span>{weather.humidity}%</span>
          <span className="text-white/15">·</span>
          <span>{Math.round(weather.windKmh)} km/h</span>
        </span>
        <button
          type="button"
          onClick={() => void fetchLocation()}
          aria-label="Refresh weather"
          className="rounded p-0.5 text-white/20 transition hover:text-white/55"
        >
          <RefreshCw className="size-3" />
        </button>
      </div>
    )
  }

  return null
}
