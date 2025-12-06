import { useEffect, useRef, useState } from 'react'
import { loadYouTubeAPI } from '@lib/youtube'
// Utility to join class names
function cls(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}
import {Button} from './Button'

type Props = {
  videoId: string
  title?: string
  className?: string
  privacyEnhanced?: boolean // usa youtube-nocookie.com
}

export default function YouTubeEmbed({ videoId, title, className, privacyEnhanced = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [blocked, setBlocked] = useState(false) // errores 101/150
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    let player: any | null = null
    let placeholder: HTMLDivElement | null = null

    const host = privacyEnhanced ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com'
    const uid = `yt-${Math.random().toString(36).slice(2, 10)}`

    loadYouTubeAPI().then(() => {
      if (!mounted || !containerRef.current) return

      // Creamos un nodo "placeholder" que NO pertenece a React
      placeholder = document.createElement('div')
      placeholder.id = uid
      placeholder.style.width = '100%'
      placeholder.style.height = '100%'
      containerRef.current!.appendChild(placeholder)

      // @ts-ignore - API global de YouTube
      player = new window.YT.Player(uid, {
        host,
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => mounted && setReady(true),
          onError: (e: any) => {
            if (e?.data === 101 || e?.data === 150) {
              mounted && setBlocked(true)
            }
          }
        }
      })
    })

    return () => {
      mounted = false
      try { player?.destroy?.() } catch {}
      if (containerRef.current) containerRef.current.innerHTML = '' // limpiamos todo lo agregado manualmente
    }
  }, [videoId, privacyEnhanced])

  return (
    <div className={cls('bg-white border border-gray-100 rounded-xl shadow-femme overflow-hidden', className)}>
      <div className="relative" style={{ paddingTop: '56.25%' }}>
        <div ref={containerRef} className="absolute inset-0" />
        {/* Overlay de carga */}
        {!ready && !blocked && (
          <div className="absolute inset-0 flex items-center justify-center text-graphite bg-white/60">
            Cargando…
          </div>
        )}
        {/* Fallback por bloqueo de derechos */}
        {blocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/90 p-4 text-center">
            <div className="font-semibold text-femme-magenta">Video no disponible para inserción</div>
            <p className="text-sm text-graphite">
              El propietario bloqueó la reproducción embebida. Ábrelo directamente en YouTube.
            </p>
            <a
              className="inline-flex items-center justify-center rounded-md bg-femme-magenta px-4 py-2 text-white font-semibold shadow transition hover:bg-femme-magenta/90 focus:outline-none focus:ring-2 focus:ring-femme-magenta"
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir en YouTube
            </a>
          </div>
        )}
      </div>
      {title && <div className="p-3 text-sm text-graphite">{title}</div>}
    </div>
  )
}
