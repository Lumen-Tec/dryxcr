"use client"

import { useLayoutEffect, useRef } from "react"
import { useLanding } from "@/lib/store"

/**
 * Video de fondo del hero (editable desde el admin). Next oculta la landing (no la desmonta) al
 * navegar, así que se pausa al ocultarse y se reanuda al volver, para no seguir decodificando
 * video en segundo plano.
 */
export function HeroVideo({ className }: { className?: string }) {
  const { hero } = useLanding()
  const ref = useRef<HTMLVideoElement>(null)

  useLayoutEffect(() => {
    const video = ref.current
    video?.play().catch(() => {})
    return () => video?.pause()
  }, [hero.src])

  return (
    <video
      key={hero.src}
      ref={ref}
      className={className}
      src={hero.src}
      poster={hero.poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
    />
  )
}
