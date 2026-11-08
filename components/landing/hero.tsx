import { ArrowRightIcon, MapPinIcon } from "lucide-react"
import Link from "next/link"
import { HeroVideo } from "@/components/landing/hero-video"
import { Button } from "@/components/ui/button"
import { site } from "@/lib/site"

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-6rem)] items-end overflow-hidden">
      <HeroVideo className="absolute inset-0 -z-20 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,transparent_10%,var(--background)_75%)]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/40 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 pt-24 pb-14 sm:px-6 sm:pb-20">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/50 bg-brand/15 px-3 py-1 text-xs font-semibold tracking-wider text-foreground uppercase backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-brand" />
          </span>
          Nueva tienda en Avenida Central
        </span>
        <h1 className="max-w-4xl font-display text-[clamp(3.5rem,11vw,9.5rem)] text-balance">
          No es solo ropa.
          <br />
          Es <span className="text-brand">actitud.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base text-pretty text-foreground/80 sm:text-lg">
          Sneakers originales, streetwear y la marca DRYX, hecha en Costa Rica. Pedí en línea y lo coordinamos por
          WhatsApp, o vení a verlo en persona.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" className="h-12 px-6 text-base" nativeButton={false} render={<Link href="/tienda" />}>
            Comprar ahora
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-6 text-base backdrop-blur"
            nativeButton={false}
            render={<Link href="/#ubicacion" />}
          >
            <MapPinIcon data-icon="inline-start" />
            {site.addressHint}
          </Button>
        </div>
      </div>
    </section>
  )
}
