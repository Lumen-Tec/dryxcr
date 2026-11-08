import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="relative isolate grid overflow-hidden rounded-2xl bg-brand text-brand-foreground md:grid-cols-[1.2fr_1fr]">
        <div
          className="pointer-events-none absolute -top-10 -left-6 -z-10 font-display text-[16rem] leading-none text-black/10 select-none"
          aria-hidden
        >
          3×
        </div>
        <div className="flex flex-col justify-center gap-5 p-8 sm:p-12">
          <p className="text-xs font-bold tracking-[0.25em] uppercase opacity-80">Promo activa · Marca DRYX</p>
          <h2 className="font-display text-6xl text-balance sm:text-7xl">
            3 camisetas
            <br />
            por ₡35.000
          </h2>
          <p className="max-w-md text-pretty opacity-90">
            Diseño urbano, comodidad deportiva y calidad que habla sola. Mezclá colores y estilos, y ahorrá ₡9.700.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              className="h-12 bg-black px-6 text-base text-white hover:bg-black/80"
              nativeButton={false}
              render={<Link href="/tienda?categoria=ropa&marca=DRYX" />}
            >
              Armar mi combo
            </Button>
            <span className="text-xs opacity-75">*Aplican restricciones. Se aplica al confirmar por WhatsApp.</span>
          </div>
        </div>
        <div className="relative min-h-80">
          <Image
            src="/ig/p/dryx-drycool.jpg"
            alt="Modelo con camiseta DRYX Dry Cool en una cancha de básquet"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
            style={{ objectPosition: "50% 45%" }}
          />
        </div>
      </div>
    </section>
  )
}
