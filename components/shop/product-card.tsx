"use client"

import Image from "next/image"
import Link from "next/link"
import { Price } from "@/components/shop/price"
import { LOW_STOCK, totalStock } from "@/lib/pricing"
import { usePricer } from "@/lib/store/hooks"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

export function ProductCard({ product, priority, className }: { product: Product; priority?: boolean; className?: string }) {
  const pricer = usePricer()
  const pricing = pricer(product)
  const stock = totalStock(product)

  return (
    <Link
      href={`/tienda/${product.slug}`}
      className={cn("group flex flex-col gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-105",
            stock === 0 && "opacity-50 grayscale",
          )}
          style={{ objectPosition: product.imagePosition ?? "50% 50%" }}
        />
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
          {pricing.discount ? (
            <span className="rounded bg-brand px-2 py-0.5 text-xs font-bold text-brand-foreground">-{pricing.discount}%</span>
          ) : null}
          {product.isDryx && (
            <span className="rounded bg-foreground px-2 py-0.5 text-xs font-bold text-background">MARCA DRYX</span>
          )}
        </div>
        {stock === 0 ? (
          <span className="absolute inset-x-2 bottom-2 rounded bg-background/85 px-2 py-1 text-center text-xs font-semibold uppercase backdrop-blur">
            Agotado
          </span>
        ) : stock <= LOW_STOCK * 3 ? (
          <span className="absolute inset-x-2 bottom-2 rounded bg-background/85 px-2 py-1 text-center text-xs font-medium backdrop-blur">
            Últimas unidades
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 px-0.5">
        <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{product.brand}</span>
        <h3 className="line-clamp-2 text-sm leading-snug font-medium text-pretty">{product.name}</h3>
        <Price pricing={pricing} />
      </div>
    </Link>
  )
}
