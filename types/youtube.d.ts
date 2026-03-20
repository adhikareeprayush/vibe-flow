/* eslint-disable @typescript-eslint/no-explicit-any */
export {}

declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
  }
}
