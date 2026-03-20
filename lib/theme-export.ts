import type { MoodId } from "@/lib/moods"
import { MOODS } from "@/lib/moods"

export function buildThemeCss(root: HTMLElement, mood: MoodId): string {
  const moodVars = MOODS[mood].theme
  const lines: string[] = [
    "/* Ambient theme — paste into :root or .dark */",
    `:root[data-ambient-mood="${mood}"] {`,
  ]
  Object.entries(moodVars).forEach(([k, v]) => {
    lines.push(`  ${k}: ${v};`)
  })

  const computed = getComputedStyle(root)
  const extras = [
    "--background",
    "--foreground",
    "--card",
    "--card-foreground",
    "--primary",
    "--primary-foreground",
    "--muted",
    "--muted-foreground",
    "--border",
    "--ring",
    "--radius",
  ]
  for (const name of extras) {
    const val = computed.getPropertyValue(name).trim()
    if (val) lines.push(`  ${name}: ${val};`)
  }
  lines.push("}", "")
  return lines.join("\n")
}

export function downloadThemeCss(mood: MoodId): void {
  if (typeof document === "undefined") return
  const css = buildThemeCss(document.documentElement, mood)
  const blob = new Blob([css], { type: "text/css;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `ambient-theme-${mood}.css`
  a.click()
  URL.revokeObjectURL(url)
}
