import type { Metadata } from "next"
import { JetBrains_Mono, Outfit } from "next/font/google"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-jb",
})

export const metadata: Metadata = {
  title: "Ambient workspace",
  description: "Minimal focus space: optional timer, media, weather, and quotes.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">{children}</body>
    </html>
  )
}
