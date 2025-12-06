
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady?: () => void
  }
}

let ytPromise: Promise<void> | null = null

export function loadYouTubeAPI(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (ytPromise) return ytPromise
  ytPromise = new Promise<void>((resolve) => {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    window.onYouTubeIframeAPIReady = () => resolve()
    document.head.appendChild(tag)
  })
  return ytPromise
}

