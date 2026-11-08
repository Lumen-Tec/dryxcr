"use client"

import { useLayoutEffect, useRef } from "react"

/**
 * Video de fondo del hero. Next oculta la landing (no la desmonta) al navegar, así que se pausa
 * al ocultarse y se reanuda al volver, para no seguir decodificando video en segundo plano.
 */
export function HeroVideo({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useLayoutEffect(() => {
    const video = ref.current
    video?.play().catch(() => {})
    return () => video?.pause()
  }, [])

  return (
    <video
      ref={ref}
      className={className}
      src="/ig/v/hero.mp4"
      poster="/ig/p/tienda-tour.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
    />
  )
}
