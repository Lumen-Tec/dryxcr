"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { landingBanner, promoHref } from "@/lib/landing"
import { useProducts, usePromotions } from "@/lib/store"
import { useNow } from "@/lib/store/hooks"

/** Banner grande de la landing. Sale de Promociones (tipo banner, vigente y con foto); sin ninguna, no se muestra. */
export function PromoBanner() {
  const promo = landingBanner(usePromotions(), useNow())
  const products = useProducts()
  if (!promo?.image) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="relative isolate grid overflow-hidden rounded-2xl bg-brand text-brand-foreground md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col justify-center gap-5 p-8 sm:p-12">
          <p className="text-xs font-bold tracking-[0.25em] uppercase opacity-80">Promo activa</p>
          <h2 className="font-display text-6xl text-balance sm:text-7xl">{promo.title}</h2>
          {promo.subtitle && <p className="max-w-md text-pretty opacity-90">{promo.subtitle}</p>}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              className="h-12 bg-black px-6 text-base text-white hover:bg-black/80"
              nativeButton={false}
              render={<Link href={promoHref(promo, products)} />}
            >
              {promo.cta?.trim() || "Ver promoción"}
            </Button>
            <span className="text-xs opacity-75">*Aplican restricciones. Se aplica al confirmar por WhatsApp.</span>
          </div>
        </div>
        <div className="relative min-h-80">
          <Image
            src={promo.image}
            alt=""
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
            style={{ objectPosition: promo.imagePosition }}
          />
        </div>
      </div>
    </section>
  )
}
