import { NextResponse } from "next/server"

type ZenQuote = { q: string; a: string }

const FALLBACKS = [
  { content: "Small steps every day add up.", author: "VibeFlow" },
  { content: "Breathe. You are exactly where you need to be.", author: "VibeFlow" },
  { content: "Quiet progress is still progress.", author: "VibeFlow" },
]

export async function GET() {
  try {
    const res = await fetch("https://zenquotes.io/api/random", {
      next: { revalidate: 0 },
    })
    if (!res.ok) throw new Error(`zenquotes ${res.status}`)

    const data = (await res.json()) as ZenQuote[]
    const first = data[0]
    if (!first?.q || !first?.a) throw new Error("empty response")

    return NextResponse.json({ content: first.q.trim(), author: first.a.trim() })
  } catch {
    const fb = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
    return NextResponse.json(fb, { status: 200 })
  }
}
