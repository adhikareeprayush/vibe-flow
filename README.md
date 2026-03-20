# Vibe Flow

A minimal, focused ambient workspace that lives in your browser. Pick a mood, let the music play, and get into flow — everything else stays out of the way.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)

---

## Features

**Four moods** — each with its own colour palette, particle field, and default YouTube stream:

| Mood | Vibe |
|------|------|
| Lofi | Tape warmth & rain |
| Chill | Soft drift, ocean calm |
| Focus | Deep work grid |
| Hype | Neon pulse energy |

**Widgets** — all individually toggleable from the settings dock:

- **Player** — streams the mood's YouTube playlist by default; swap in any YouTube URL, video ID, or playlist link per mood, or upload a local audio file
- **Pomodoro timer** — configurable duration (1–120 min), syncs the player (pauses during breaks, resumes on focus sessions)
- **Search bar** — quick search with Google, Bing, or DuckDuckGo; opens results in a new tab (mutually exclusive with the timer)
- **Analog clock** — minimal, no box
- **Weather** — current conditions + temperature via [Open-Meteo](https://open-meteo.com/); location resolved server-side from your IP, with a manual coordinate fallback in settings
- **Quote** — random inspirational quote from [ZenQuotes](https://zenquotes.io/), refreshable on demand
- **Particle field** — ambient background particles tuned to each mood

**Customisation**

- Per-mood custom YouTube streams
- Adjustable Pomodoro duration
- Manual lat/lon fallback for weather when IP geolocation isn't available
- One-click theme CSS export (downloads the current mood's CSS variables)

All preferences are persisted in `localStorage` — no account, no backend.

---

## Getting started

```bash
git clone https://github.com/your-username/vibe-flow.git
cd vibe-flow
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production build:

```bash
npm run build
npm start
```

---

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, server-side API routes)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide React](https://lucide.dev/)
- [canvas-confetti](https://github.com/catdad/canvas-confetti)
- [Open-Meteo API](https://open-meteo.com/) — weather (no API key required)
- [ZenQuotes API](https://zenquotes.io/) — quotes (no API key required)
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) — ambient streams

---

## Notes

- **YouTube autoplay** — browsers may block autoplay with sound on first load. If the player shows a pulse icon, click it once to unlock audio.
- **Weather** — location is detected server-side from your IP via [ipwho.is](https://ipwho.is/). If that fails, set a manual latitude/longitude in the settings dock.
- **Custom streams** — paste any YouTube watch URL, short URL (`youtu.be/…`), playlist URL, or bare video/playlist ID into the Streams section of settings.
- **Pomodoro + Search** — these two widgets are mutually exclusive; enabling one automatically disables the other.

---

## Contributing

Contributions are welcome! Here's how to get involved:

1. **Fork** the repository and create a branch from `main` — name it something descriptive like `feat/new-widget` or `fix/seek-bar`.
2. **Make your changes.** Keep commits focused — one logical change per commit.
3. **Test locally** with `npm run dev` and verify a clean `npm run build` before opening a PR.
4. **Open a pull request** against `main` with a clear description of what changed and why.

A few guidelines to keep things consistent:

- Match the existing code style — Tailwind utilities, `cn()` for conditional classes, `useCallback` for event handlers passed as props.
- New widgets should be toggleable via the settings dock and persist their state through `useVibePreferences`.
- Avoid adding new dependencies unless genuinely necessary; prefer what's already in the stack.

For bugs or feature ideas, open an issue first so we can discuss before you spend time on a PR.

**Author:** [adhikareeprayush](https://github.com/adhikareeprayush)
