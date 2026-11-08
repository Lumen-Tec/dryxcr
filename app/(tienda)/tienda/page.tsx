import type { Metadata } from "next"
import { Suspense } from "react"
import { Catalog } from "@/components/shop/catalog"

export const metadata: Metadata = {
  title: "Tienda",
  description: "Sneakers, ropa, gorras y accesorios originales. Envíos a todo Costa Rica.",
}

export default function StorePage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Catalog />
    </Suspense>
  )
}

function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-busy>
      <div className="h-16 w-72 animate-pulse rounded bg-muted" />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}
