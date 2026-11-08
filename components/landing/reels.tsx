"use client"

import { PlayIcon } from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"
import { InstagramIcon } from "@/components/brand/social-icons"
import { SectionHeading } from "@/components/landing/categories"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { site } from "@/lib/site"

const REELS = [
  { src: "/ig/v/reel-1.mp4", poster: "/ig/p/reel-1.jpg", caption: "Te esperamos con los brazos abiertos" },
  { src: "/ig/v/puma-suede-xl.mp4", poster: "/ig/p/puma-suede-xl.jpg", caption: "Puma Suede XL" },
  { src: "/ig/v/dryx-drycool.mp4", poster: "/ig/p/dryx-drycool.jpg", caption: "DRYX Dry Cool" },
  { src: "/ig/v/nb-550.mp4", poster: "/ig/p/nb-550.jpg", caption: "Nuevo drop NB 550" },
]

function Reel({ src, poster, caption }: (typeof REELS)[number]) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const play = () => {
    ref.current?.play().then(() => setPlaying(true)).catch(() => {})
  }
  const pause = () => {
    ref.current?.pause()
    setPlaying(false)
  }

  // Al salir de la landing la ruta queda oculta (no desmontada): pausar para no seguir reproduciendo.
  useLayoutEffect(() => {
    const video = ref.current
    return () => {
      video?.pause()
      setPlaying(false)
    }
  }, [])

  return (
    <figure
      className="group relative aspect-[9/16] w-[60vw] shrink-0 snap-start overflow-hidden rounded-xl bg-muted sm:w-auto"
      onMouseEnter={play}
      onMouseLeave={pause}
    >
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        className="size-full object-cover"
      />
      <button
        type="button"
        onClick={() => (playing ? pause() : play())}
        className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        aria-label={`${playing ? "Pausar" : "Reproducir"} video: ${caption}`}
      >
        <figcaption className="text-sm font-medium text-white">{caption}</figcaption>
        {!playing && (
          <span className="absolute top-1/2 left-1/2 grid size-14 -translate-1/2 place-items-center rounded-full bg-white/15 backdrop-blur transition-transform group-hover:scale-110">
            <PlayIcon className="size-6 fill-white text-white" />
          </span>
        )}
      </button>
    </figure>
  )
}

export function Reels() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="@dryx.cr"
        title="Así se vive DRYX"
        action={
          <Button variant="outline" nativeButton={false} render={<a href={site.social.instagram} target="_blank" rel="noreferrer" />}>
            <InstagramIcon className="size-4" data-icon="inline-start" />
            Seguinos
          </Button>
        }
      />
      <ScrollArea scrollbars="horizontal" className="-mx-4 mt-10 sm:mx-0" viewportClassName="snap-x snap-mandatory">
      <div className="flex w-max gap-4 px-4 pb-3 sm:grid sm:w-auto sm:grid-cols-4 sm:px-0 sm:pb-0">
        {REELS.map((r) => (
          <Reel key={r.src} {...r} />
        ))}
      </div>
      </ScrollArea>
    </section>
  )
}
