"use client"

import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { SectionHeading } from "@/components/landing/categories"
import { ProductCard } from "@/components/shop/product-card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FEATURED_LIMIT } from "@/lib/data/landing"
import { featuredProducts } from "@/lib/landing"
import { useLanding, useProducts } from "@/lib/store"

export function Featured() {
  const products = featuredProducts(useProducts(), useLanding().featuredOrder).slice(0, FEATURED_LIMIT)
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Drops"
        title="Lo más buscado"
        action={
          <Button variant="outline" nativeButton={false} render={<Link href="/tienda" />}>
            Ver todo <ArrowRightIcon data-icon="inline-end" />
          </Button>
        }
      />
      <ScrollArea scrollbars="horizontal" className="-mx-4 mt-10 sm:mx-0" viewportClassName="snap-x snap-mandatory">
      <div className="flex w-max gap-4 px-4 pb-3 sm:grid sm:w-auto sm:grid-cols-3 sm:px-0 sm:pb-0 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} className="w-[62vw] shrink-0 snap-start sm:w-auto" />
        ))}
      </div>
      </ScrollArea>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Cuando se acaban, se acaban. <span className="text-foreground">DRYX no se repite.</span>
      </p>
    </section>
  )
}
