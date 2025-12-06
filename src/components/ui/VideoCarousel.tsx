import { useEffect, useMemo, useRef, useState, KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
// Simple classNames utility
function cls(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}
// Utility to extract YouTube video ID from URL or ID string
function parseYouTubeId(input: string): string | undefined {
  // If input is already a valid 11-character YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input
  // Try to extract from common YouTube URL formats
  const match = input.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : undefined
}
import YouTubeEmbed from './YouTubeEmbed'

type Video = { id?: string; url?: string; title?: string }
type Props = { videos: Video[]; className?: string; privacyEnhanced?: boolean }

export default function VideoCarousel({ videos, className, privacyEnhanced = false }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  // Normalizamos cada entrada a { videoId, key, title }
  const slides = useMemo(
    () =>
      videos.map((v) => {
        const videoId = parseYouTubeId(v.id ?? v.url ?? '')
        // clave estable: prioriza el ID; si no, usa la URL/ID cruda; si no, fallback
        const stableKey = videoId || v.url || v.id || `idx-${Math.random().toString(36).slice(2)}`
        return { ...v, videoId, _key: stableKey }
      }),
    [videos]
  )

  const slideCount = slides.length
  const clamped = (i: number) => Math.max(0, Math.min(slideCount - 1, i))

  // Si cambia la cantidad de slides, ajustamos el índice actual
  useEffect(() => {
    setCurrent((c) => clamped(c))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideCount])

  const goTo = (i: number) => {
    const idx = clamped(i)
    setCurrent(idx)
    // Scroll al hijo correspondiente
    if (trackRef.current) {
      const children = Array.from(trackRef.current.children)
      const el = children[idx] as HTMLElement | undefined
      el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(current + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(current - 1)
    }
  }

  const disabledPrev = current <= 0
  const disabledNext = current >= slideCount - 1

  return (
    <div className={cls('relative', className)} onKeyDown={onKeyDown} tabIndex={0} aria-roledescription="carousel">
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
        role="group"
        aria-label="Lista de videos"
      >
        {slides.map((v, i) => (
          <div
            key={v._key}
            className="snap-center shrink-0 w-[90%] sm:w-[70%] md:w-[55%] lg:w-[45%] xl:w-[35%]"
            aria-roledescription="slide"
            aria-label={v.title ? `${i + 1} de ${slideCount}: ${v.title}` : `${i + 1} de ${slideCount}`}
          >
            {v.videoId ? (
              <YouTubeEmbed videoId={v.videoId} title={v.title} privacyEnhanced={privacyEnhanced} />
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl shadow-femme p-4">
                <div className="text-sm text-red-600 font-medium">Entrada inválida</div>
                <div className="text-xs text-graphite mt-1 break-all">{v.id || v.url || '—'}</div>
                <div className="text-xs text-graphite mt-1">Pegá un ID de 11 caracteres o una URL de YouTube válida.</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Flechas */}
      <button
        aria-label="Anterior"
        onClick={() => goTo(current - 1)}
        disabled={disabledPrev}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white shadow-femme border text-ink hover:bg-femme-softyellow/50 disabled:opacity-40"
      >
        <ChevronLeft />
      </button>
      <button
        aria-label="Siguiente"
        onClick={() => goTo(current + 1)}
        disabled={disabledNext}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white shadow-femme border text-ink hover:bg-femme-softyellow/50 disabled:opacity-40"
      >
        <ChevronRight />
      </button>

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-2" role="tablist" aria-label="Selector de video">
        {slides.map((v, i) => (
          <button
            key={`dot-${v._key}`}
            role="tab"
            aria-selected={i === current}
            aria-controls={`slide-${i}`}
            onClick={() => goTo(i)}
            className={cls(
              'h-2.5 w-2.5 rounded-full transition-colors',
              i === current ? 'bg-femme-magenta' : 'bg-gray-300 hover:bg-gray-400'
            )}
          />
        ))}
      </div>
    </div>
  )
}
