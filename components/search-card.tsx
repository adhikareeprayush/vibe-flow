"use client"

import { useRef, useState } from "react"
import { ArrowRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type Engine = "google" | "bing" | "duck"

const ENGINES: {
  id: Engine
  label: string
  domain: string
  search: (q: string) => string
}[] = [
  {
    id: "google",
    label: "Google",
    domain: "google.com",
    search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "bing",
    label: "Bing",
    domain: "bing.com",
    search: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "duck",
    label: "DuckDuckGo",
    domain: "duckduckgo.com",
    search: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  },
]

export function SearchCard() {
  const [engine, setEngine] = useState<Engine>("google")
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const current = ENGINES.find((e) => e.id === engine)!

  const submit = () => {
    const q = query.trim()
    if (!q) return
    window.open(current.search(q), "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex w-full max-w-[min(520px,calc(100vw-3rem))] flex-col items-center gap-3">
      {/* Engine selector */}
      <div className="flex items-center gap-0.5">
        {ENGINES.map((eng) => (
          <button
            key={eng.id}
            type="button"
            onClick={() => {
              setEngine(eng.id)
              inputRef.current?.focus()
            }}
            title={eng.label}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium tracking-wide transition-all",
              engine === eng.id
                ? "bg-white/[0.12] text-white"
                : "text-white/35 hover:bg-white/[0.05] hover:text-white/60"
            )}
          >
            {/* Using standard img since this is a dynamic external favicon URL */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${eng.domain}&sz=32`}
              alt=""
              aria-hidden
              width={14}
              height={14}
              className="shrink-0 rounded-sm"
            />
            <span>{eng.label}</span>
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.06] px-4 py-3 backdrop-blur-sm transition-all",
          "focus-within:border-vibe-accent/40 focus-within:bg-white/[0.09]"
        )}
      >
        <Search className="size-4 shrink-0 text-white/25" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit()
          }}
          placeholder={`Search with ${current.label}…`}
          className="min-w-0 flex-1 bg-transparent text-sm text-white/90 caret-vibe-accent placeholder:text-white/25 focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!query.trim()}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full transition-all",
            query.trim()
              ? "bg-vibe-accent/25 text-vibe-accent hover:bg-vibe-accent/40"
              : "text-white/15"
          )}
          aria-label="Search"
        >
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
