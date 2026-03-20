import type { LucideIcon } from "lucide-react"
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react"

export function weatherFromWmoCode(code: number): { label: string; Icon: LucideIcon } {
  if (code === 0) return { label: "Clear sky", Icon: Sun }
  if (code === 1) return { label: "Mainly clear", Icon: CloudSun }
  if (code === 2) return { label: "Partly cloudy", Icon: CloudSun }
  if (code === 3) return { label: "Overcast", Icon: Cloud }
  if (code === 45 || code === 48) return { label: "Fog", Icon: CloudFog }
  if (code >= 51 && code <= 55) return { label: "Drizzle", Icon: CloudDrizzle }
  if (code >= 56 && code <= 57) return { label: "Freezing drizzle", Icon: CloudDrizzle }
  if (code >= 61 && code <= 65) return { label: "Rain", Icon: CloudRain }
  if (code >= 66 && code <= 67) return { label: "Freezing rain", Icon: CloudRain }
  if (code >= 71 && code <= 77) return { label: "Snow", Icon: CloudSnow }
  if (code >= 80 && code <= 82) return { label: "Rain showers", Icon: CloudRain }
  if (code >= 85 && code <= 86) return { label: "Snow showers", Icon: CloudSnow }
  if (code === 95) return { label: "Thunderstorm", Icon: CloudLightning }
  if (code >= 96 && code <= 99) return { label: "Thunderstorm & hail", Icon: CloudLightning }
  return { label: "Weather", Icon: Cloud }
}
