import { headers } from "next/headers"
import { NextResponse } from "next/server"

type IpWhoResponse = {
  success: boolean
  latitude: number
  longitude: number
  city?: string
  country?: string
  message?: string
}

export async function GET() {
  try {
    const headersList = await headers()
    const forwarded = headersList.get("x-forwarded-for")
    const realIp = headersList.get("x-real-ip")
    const rawIp = forwarded?.split(",")[0]?.trim() ?? realIp ?? ""

    // Localhost IPs — let ipwho.is auto-detect using the outbound server IP
    const isLocal = rawIp === "::1" || rawIp === "127.0.0.1" || rawIp === ""
    const url = isLocal ? "https://ipwho.is/" : `https://ipwho.is/${rawIp}`

    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`ipwho.is ${res.status}`)

    const data = (await res.json()) as IpWhoResponse

    if (!data.success) {
      return NextResponse.json(
        { error: data.message ?? "Could not resolve IP location" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      lat: data.latitude,
      lon: data.longitude,
      city: data.city ?? null,
      country: data.country ?? null,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Location lookup failed" },
      { status: 500 }
    )
  }
}
