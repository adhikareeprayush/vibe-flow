"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

type QuoteData = { content: string; author: string }

export function QuoteCard() {
  const [data, setData] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/quote", { cache: "no-store" })
      const json = (await res.json()) as QuoteData
      setData(json)
    } catch {
      setData({ content: "Quiet progress is still progress.", author: "—" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="w-full max-w-lg px-4 text-center">
      <blockquote
        className={cn(
          "font-heading text-sm leading-[1.95] tracking-wide text-white/50 transition-opacity duration-500 sm:text-[15px]",
          loading && "opacity-0"
        )}
      >
        &ldquo;{data?.content ?? ""}&rdquo;
      </blockquote>

      {!loading && data ? (
        <footer className="mt-5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="h-px w-6 rounded-full bg-vibe-accent/30" />
            <span className="font-mono text-[10px] tracking-[0.22em] text-vibe-accent/55 uppercase">
              {data.author}
            </span>
            <span className="h-px w-6 rounded-full bg-vibe-accent/30" />
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            aria-label="New quote"
            className="rounded-lg border border-white/[0.07] p-1.5 text-white/20 transition hover:border-white/[0.12] hover:text-white/55 disabled:pointer-events-none"
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} />
          </button>
        </footer>
      ) : null}
    </div>
  )
}
